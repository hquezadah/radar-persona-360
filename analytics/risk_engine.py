"""Motor de métricas para monitoreo de un portafolio de crédito persona.

El módulo prioriza trazabilidad: cada salida puede explicarse desde variables,
reglas, parámetros versionados y supuestos explícitos.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from typing import Iterable


@dataclass(frozen=True)
class Segment:
    name: str
    exposure_mm: float
    customers: int
    pd_12m: float
    lgd: float
    ead_factor: float
    delinquency_30: float
    annual_net_margin_mm: float
    economic_capital_mm: float
    utilization: float = 0.0
    roll_rate_0_30: float = 0.0


@dataclass(frozen=True)
class MacroScenario:
    name: str
    unemployment_delta_pp: float
    active_rate_delta_bp: float
    inflation_delta_pp: float


def expected_loss_mm(segment: Segment) -> float:
    """Return 12-month expected loss in RD$ millions."""
    return segment.exposure_mm * segment.ead_factor * segment.pd_12m * segment.lgd


def raroc(segment: Segment) -> float:
    """Return simplified risk-adjusted return on economic capital."""
    if segment.economic_capital_mm <= 0:
        raise ValueError("economic_capital_mm must be greater than zero")
    return (segment.annual_net_margin_mm - expected_loss_mm(segment)) / segment.economic_capital_mm


def stress_segment(segment: Segment, scenario: MacroScenario) -> Segment:
    """Apply transparent macro elasticities to PD, delinquency and margin."""
    pd_multiplier = (
        1
        + 0.16 * scenario.unemployment_delta_pp
        + 0.00055 * scenario.active_rate_delta_bp
        + 0.04 * scenario.inflation_delta_pp
    )
    delinquency_addon = (
        0.0048 * scenario.unemployment_delta_pp
        + 0.000012 * scenario.active_rate_delta_bp
        + 0.0014 * scenario.inflation_delta_pp
    )
    margin_haircut = min(
        0.35,
        0.035 * scenario.unemployment_delta_pp
        + 0.00012 * scenario.active_rate_delta_bp
        + 0.012 * scenario.inflation_delta_pp,
    )

    return Segment(
        **{
            **asdict(segment),
            "pd_12m": min(0.99, segment.pd_12m * pd_multiplier),
            "delinquency_30": min(0.99, segment.delinquency_30 + delinquency_addon),
            "annual_net_margin_mm": segment.annual_net_margin_mm * (1 - margin_haircut),
        }
    )


def portfolio_summary(segments: Iterable[Segment]) -> dict[str, float | int]:
    segment_list = list(segments)
    exposure = sum(segment.exposure_mm for segment in segment_list)
    if exposure <= 0:
        raise ValueError("portfolio exposure must be greater than zero")

    expected_loss = sum(expected_loss_mm(segment) for segment in segment_list)
    margin = sum(segment.annual_net_margin_mm for segment in segment_list)
    capital = sum(segment.economic_capital_mm for segment in segment_list)

    return {
        "exposure_mm": round(exposure, 2),
        "customers": sum(segment.customers for segment in segment_list),
        "weighted_pd_12m": round(
            sum(segment.pd_12m * segment.exposure_mm for segment in segment_list) / exposure,
            6,
        ),
        "weighted_delinquency_30": round(
            sum(segment.delinquency_30 * segment.exposure_mm for segment in segment_list)
            / exposure,
            6,
        ),
        "expected_loss_mm": round(expected_loss, 2),
        "raroc": round((margin - expected_loss) / capital, 6),
        "health_score": portfolio_health_score(segment_list),
    }


def portfolio_health_score(segments: Iterable[Segment]) -> int:
    """Score portfolio health from quality, loss, return and concentration."""
    segment_list = list(segments)
    exposure = sum(segment.exposure_mm for segment in segment_list)
    if exposure <= 0:
        raise ValueError("portfolio exposure must be greater than zero")

    delinquency = sum(
        segment.delinquency_30 * segment.exposure_mm for segment in segment_list
    ) / exposure
    pd = sum(segment.pd_12m * segment.exposure_mm for segment in segment_list) / exposure
    total_margin = sum(segment.annual_net_margin_mm for segment in segment_list)
    total_loss = sum(expected_loss_mm(segment) for segment in segment_list)
    total_capital = sum(segment.economic_capital_mm for segment in segment_list)
    portfolio_raroc = (total_margin - total_loss) / total_capital
    largest_concentration = max(segment.exposure_mm for segment in segment_list) / exposure

    quality_score = max(0.0, 100 - delinquency * 720)
    loss_score = max(0.0, 100 - pd * 560)
    return_score = min(100.0, max(0.0, portfolio_raroc / 0.22 * 100))
    concentration_score = max(0.0, 100 - max(0.0, largest_concentration - 0.20) * 240)

    score = (
        quality_score * 0.35
        + loss_score * 0.25
        + return_score * 0.25
        + concentration_score * 0.15
    )
    return round(score)


def generate_alerts(segment: Segment) -> list[dict[str, str]]:
    """Generate explainable alerts from deterministic policy rules."""
    alerts: list[dict[str, str]] = []
    if segment.utilization >= 0.85 and segment.pd_12m >= 0.05:
        alerts.append(
            {
                "severity": "critical",
                "rule": "high_revolving_utilization",
                "message": "Utilización elevada combinada con PD superior a 5%.",
                "action": "Revisar línea y evaluar consolidación selectiva.",
            }
        )
    if segment.roll_rate_0_30 >= 0.038:
        alerts.append(
            {
                "severity": "critical",
                "rule": "roll_rate_threshold",
                "message": "Roll rate 0→30 supera el umbral de 3.8%.",
                "action": "Activar contacto preventivo y revisar cosecha.",
            }
        )
    if raroc(segment) < 0.13:
        alerts.append(
            {
                "severity": "preventive",
                "rule": "raroc_below_hurdle",
                "message": "RAROC por debajo del hurdle parametrizado de 13%.",
                "action": "Revisar precio, límite, costo de riesgo o estrategia.",
            }
        )
    return alerts


def sample_segments() -> list[Segment]:
    return [
        Segment("Nómina Prime", 8_900, 92_410, 0.0146, 0.43, 0.95, 0.0182, 610, 1_920, 0.32, 0.017),
        Segment("Nómina Joven", 4_200, 71_208, 0.0518, 0.48, 0.96, 0.0576, 375, 1_130, 0.61, 0.041),
        Segment("Revolvente Intensivo", 3_600, 48_905, 0.0792, 0.58, 1.08, 0.0741, 640, 1_480, 0.88, 0.052),
        Segment("Profesionales", 5_100, 39_117, 0.0288, 0.45, 0.94, 0.0312, 460, 1_320, 0.47, 0.026),
        Segment("Consumo Tradicional", 4_800, 83_640, 0.0404, 0.47, 0.92, 0.0436, 470, 1_510, 0.42, 0.031),
        Segment("Refinanciados", 1_800, 18_294, 0.1230, 0.61, 0.98, 0.1062, 205, 960, 0.55, 0.067),
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Radar Persona 360 risk engine")
    parser.add_argument(
        "--scenario",
        choices=("base", "moderate", "severe"),
        default="base",
        help="Macro scenario to apply",
    )
    args = parser.parse_args()
    scenario_map = {
        "base": MacroScenario("Base", 0.0, 0.0, 0.0),
        "moderate": MacroScenario("Moderado", 2.1, 275, 3.4),
        "severe": MacroScenario("Severo", 3.5, 450, 5.2),
    }
    scenario = scenario_map[args.scenario]
    segments = [stress_segment(segment, scenario) for segment in sample_segments()]
    result = {
        "scenario": asdict(scenario),
        "portfolio": portfolio_summary(segments),
        "alerts": {
            segment.name: generate_alerts(segment)
            for segment in segments
            if generate_alerts(segment)
        },
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
