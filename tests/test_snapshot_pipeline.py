import tempfile
import unittest
from datetime import date
from pathlib import Path

from pipeline.build_snapshot import build_snapshot


class SnapshotPipelineTests(unittest.TestCase):
    def test_reference_extract_builds_reconciled_structure(self):
        source = Path("data/reference/segment_snapshot.csv")
        snapshot = build_snapshot(
            source,
            as_of_date=date(2026, 5, 31),
            environment="PREPRODUCTION",
            source_name="REFERENCE_FIXTURE",
        )

        self.assertEqual(snapshot["portfolio"]["exposure_mm"], 28_400)
        self.assertEqual(len(snapshot["segments"]), 6)
        self.assertEqual(snapshot["metadata"]["reconciliation_status"], "PENDING")
        self.assertEqual(snapshot["segments"][0]["initials"], "NP")

    def test_output_can_be_serialized_to_an_authorized_location(self):
        snapshot = build_snapshot(
            Path("data/reference/segment_snapshot.csv"),
            as_of_date=date(2026, 5, 31),
            environment="PREPRODUCTION",
            source_name="REFERENCE_FIXTURE",
        )
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "snapshot.json"
            output.write_text(str(snapshot), encoding="utf-8")
            self.assertTrue(output.exists())


if __name__ == "__main__":
    unittest.main()
