import unittest

from analytics.risk_engine import (
    MacroScenario,
    expected_loss_mm,
    generate_alerts,
    portfolio_summary,
    raroc,
    sample_segments,
    stress_segment,
)


class RiskEngineTests(unittest.TestCase):
    def test_expected_loss_uses_pd_lgd_and_ead(self):
        segment = sample_segments()[0]
        expected = (
            segment.exposure_mm * segment.pd_12m * segment.lgd * segment.ead_factor
        )
        self.assertAlmostEqual(expected_loss_mm(segment), expected)

    def test_portfolio_summary_is_exposure_weighted(self):
        summary = portfolio_summary(sample_segments())
        self.assertEqual(summary["exposure_mm"], 28_400)
        self.assertEqual(summary["customers"], 353_574)
        self.assertGreater(summary["health_score"], 0)
        self.assertLessEqual(summary["health_score"], 100)

    def test_stress_increases_pd_and_reduces_raroc(self):
        segment = sample_segments()[2]
        stressed = stress_segment(segment, MacroScenario("Severo", 3.5, 450, 5.2))
        self.assertGreater(stressed.pd_12m, segment.pd_12m)
        self.assertGreater(stressed.delinquency_30, segment.delinquency_30)
        self.assertLess(raroc(stressed), raroc(segment))

    def test_high_risk_revolver_triggers_explainable_alerts(self):
        alerts = generate_alerts(sample_segments()[2])
        rules = {alert["rule"] for alert in alerts}
        self.assertIn("high_revolving_utilization", rules)
        self.assertIn("roll_rate_threshold", rules)


if __name__ == "__main__":
    unittest.main()
