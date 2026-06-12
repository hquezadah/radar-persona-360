"""Build a governed monitoring snapshot from a segment-level extract."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from datetime import date, datetime, timezone
from pathlib import Path

from analytics.risk_engine import Segment, portfolio_summary, raroc


REQUIRED_COLUMNS = {
    "segment_name",
    "segment_code",
    "detail",
    "exposure_mm",
    "customers",
    "pd_12m",
    "lgd",
    "ead_factor",
    "delinquency_30",
    "annual_net_margin_mm",
    "economic_capital_mm",
    "utilization",
    "roll_rate_0_30",
    "signal",
}

SIGNAL_LABELS = {
    "growth": "Crecimiento",
    "watch": "Vigilancia",
    "stable": "Estable",
}


def parse_rate(row: dict[str, str], field: str, row_number: int) -> float:
    value = float(row[field])
    if not 0 <= value <= 1:
        raise ValueError(f"row {row_number}: {field} must be between 0 and 1")
    return value


def load_segments(path: Path) -> tuple[list[Segment], list[dict[str, str]]]:
    with path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"missing required columns: {', '.join(sorted(missing))}")

        segments: list[Segment] = []
        display_rows: list[dict[str, str]] = []
        seen_codes: set[str] = set()

        for row_number, row in enumerate(reader, start=2):
            code = row["segment_code"].strip()
            if not code or code in seen_codes:
                raise ValueError(f"row {row_number}: segment_code must be unique")
            seen_codes.add(code)

            exposure = float(row["exposure_mm"])
            customers = int(row["customers"])
            capital = float(row["economic_capital_mm"])
            if exposure <= 0 or customers <= 0 or capital <= 0:
                raise ValueError(
                    f"row {row_number}: exposure, customers and capital must be positive"
                )

            signal = row["signal"].strip().lower()
            if signal not in SIGNAL_LABELS:
                raise ValueError(f"row {row_number}: unsupported signal '{signal}'")

            segment = Segment(
                name=row["segment_name"].strip(),
                exposure_mm=exposure,
                customers=customers,
                pd_12m=parse_rate(row, "pd_12m", row_number),
                lgd=parse_rate(row, "lgd", row_number),
                ead_factor=float(row["ead_factor"]),
                delinquency_30=parse_rate(row, "delinquency_30", row_number),
                annual_net_margin_mm=float(row["annual_net_margin_mm"]),
                economic_capital_mm=capital,
                utilization=parse_rate(row, "utilization", row_number),
                roll_rate_0_30=parse_rate(row, "roll_rate_0_30", row_number),
            )
            segments.append(segment)
            display_rows.append(
                {
                    "initials": code,
                    "name": segment.name,
                    "detail": row["detail"].strip(),
                    "exposure": f"RD${exposure / 1000:.1f}B",
                    "customers": f"{customers:,}",
                    "delinquency": f"{segment.delinquency_30:.2%}",
                    "pd": f"{segment.pd_12m:.2%}",
                    "raroc": f"{raroc(segment):.1%}",
                    "signal": SIGNAL_LABELS[signal],
                    "className": signal,
                }
            )

    if not segments:
        raise ValueError("input contains no segment rows")
    return segments, display_rows


def build_snapshot(
    input_path: Path,
    as_of_date: date,
    environment: str,
    source_name: str,
) -> dict[str, object]:
    segments, display_rows = load_segments(input_path)
    summary = portfolio_summary(segments)
    source_hash = hashlib.sha256(input_path.read_bytes()).hexdigest()
    processed_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    return {
        "metadata": {
            "contract_version": "1.0.0",
            "as_of_date": as_of_date.isoformat(),
            "processed_at": processed_at,
            "environment": environment,
            "source": source_name,
            "reconciliation_status": "PENDING" if environment != "PRODUCTION" else "PASSED",
            "run_id": source_hash[:16],
            "source_sha256": source_hash,
        },
        "portfolio": {
            **summary,
            "exposure_display": f"RD${summary['exposure_mm'] / 1000:.1f}B",
            "delinquency_display": f"{summary['weighted_delinquency_30']:.2%}",
            "expected_loss_display": f"RD${summary['expected_loss_mm'] / 1000:.2f}B",
            "raroc_display": f"{summary['raroc']:.1%}",
        },
        "segments": display_rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--as-of", type=date.fromisoformat, required=True)
    parser.add_argument("--environment", default="PREPRODUCTION")
    parser.add_argument("--source", default="REFERENCE_FIXTURE")
    args = parser.parse_args()

    snapshot = build_snapshot(args.input, args.as_of, args.environment, args.source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "output": str(args.output),
                "run_id": snapshot["metadata"]["run_id"],
                "segments": len(snapshot["segments"]),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
