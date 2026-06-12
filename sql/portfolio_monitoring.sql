/*
Radar Persona 360
Consultas de referencia para monitoreo mensual de riesgo persona.

Supuestos:
- SQL estilo ANSI; adaptar funciones de fecha al motor institucional.
- Las tablas y datos son ilustrativos.
- Los umbrales deben gobernarse mediante tablas de parámetros.
*/

WITH monthly_snapshot AS (
    SELECT
        account_id,
        customer_id,
        snapshot_date,
        product_type,
        segment_code,
        employer_group,
        current_balance,
        credit_limit,
        days_past_due,
        payment_amount,
        statement_balance,
        pd_12m,
        lgd,
        ead_factor,
        annual_net_margin,
        economic_capital
    FROM risk_mart.retail_account_snapshot
    WHERE snapshot_date >= DATE '2025-01-31'
),

account_signals AS (
    SELECT
        account_id,
        customer_id,
        snapshot_date,
        product_type,
        segment_code,
        employer_group,
        current_balance,
        CASE
            WHEN credit_limit > 0 THEN current_balance / credit_limit
            ELSE 0
        END AS utilization_rate,
        days_past_due,
        CASE WHEN days_past_due >= 30 THEN 1 ELSE 0 END AS is_30_plus,
        CASE WHEN days_past_due >= 90 THEN 1 ELSE 0 END AS is_90_plus,
        CASE
            WHEN statement_balance > 0 THEN payment_amount / statement_balance
            ELSE 1
        END AS payment_ratio,
        pd_12m,
        lgd,
        ead_factor,
        current_balance * pd_12m * lgd * ead_factor AS expected_loss,
        CASE
            WHEN economic_capital > 0
                THEN (
                    annual_net_margin
                    - current_balance * pd_12m * lgd * ead_factor
                ) / economic_capital
            ELSE NULL
        END AS raroc
    FROM monthly_snapshot
),

segment_kpis AS (
    SELECT
        snapshot_date,
        segment_code,
        product_type,
        COUNT(DISTINCT customer_id) AS customers,
        SUM(current_balance) AS exposure,
        SUM(current_balance * is_30_plus) / NULLIF(SUM(current_balance), 0) AS balance_30_plus_rate,
        SUM(current_balance * is_90_plus) / NULLIF(SUM(current_balance), 0) AS balance_90_plus_rate,
        SUM(current_balance * pd_12m) / NULLIF(SUM(current_balance), 0) AS weighted_pd_12m,
        SUM(expected_loss) AS expected_loss,
        SUM(annual_net_margin - expected_loss)
            / NULLIF(SUM(economic_capital), 0) AS portfolio_raroc
    FROM account_signals
    GROUP BY snapshot_date, segment_code, product_type
),

early_warning_alerts AS (
    SELECT
        snapshot_date,
        account_id,
        customer_id,
        segment_code,
        current_balance,
        CASE
            WHEN utilization_rate >= 0.85
                AND payment_ratio < 0.08
                AND pd_12m >= 0.05
                THEN 'HIGH_REVOLVING_UTILIZATION'
            WHEN days_past_due BETWEEN 1 AND 29
                AND pd_12m >= 0.08
                THEN 'PRE_DELINQUENCY_HIGH_PD'
            WHEN raroc < 0.13
                THEN 'RAROC_BELOW_HURDLE'
        END AS alert_code,
        CASE
            WHEN utilization_rate >= 0.85
                AND payment_ratio < 0.08
                AND pd_12m >= 0.05
                THEN 'CRITICAL'
            WHEN days_past_due BETWEEN 1 AND 29
                AND pd_12m >= 0.08
                THEN 'CRITICAL'
            WHEN raroc < 0.13
                THEN 'PREVENTIVE'
        END AS severity
    FROM account_signals
    WHERE
        (utilization_rate >= 0.85 AND payment_ratio < 0.08 AND pd_12m >= 0.05)
        OR (days_past_due BETWEEN 1 AND 29 AND pd_12m >= 0.08)
        OR raroc < 0.13
)

SELECT
    k.snapshot_date,
    k.segment_code,
    k.product_type,
    k.customers,
    k.exposure,
    k.balance_30_plus_rate,
    k.balance_90_plus_rate,
    k.weighted_pd_12m,
    k.expected_loss,
    k.portfolio_raroc,
    COUNT(a.account_id) AS open_alerts,
    SUM(CASE WHEN a.severity = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_alerts,
    SUM(a.current_balance) AS exposure_under_alert
FROM segment_kpis k
LEFT JOIN early_warning_alerts a
    ON k.snapshot_date = a.snapshot_date
    AND k.segment_code = a.segment_code
GROUP BY
    k.snapshot_date,
    k.segment_code,
    k.product_type,
    k.customers,
    k.exposure,
    k.balance_30_plus_rate,
    k.balance_90_plus_rate,
    k.weighted_pd_12m,
    k.expected_loss,
    k.portfolio_raroc
ORDER BY k.snapshot_date DESC, k.exposure DESC;
