# Gobierno analítico y de alertas

## Alcance

Radar Persona 360 es una demostración de monitoreo gerencial, no un modelo
aprobado para decisiones crediticias. Todos los datos, coeficientes y umbrales
incluidos en el repositorio son sintéticos.

## Capas de control

1. **Calidad de datos:** completitud, unicidad, oportunidad, reconciliación y
   estabilidad de variables.
2. **Desempeño:** discriminación, calibración, PSI, backtesting de alertas,
   falsos positivos, cura y pérdida evitada.
3. **Negocio:** RAROC, margen, tasa de contacto, aceptación, retención y
   experiencia del cliente.
4. **Gobierno:** dueño de la regla, aprobador, versión, fecha efectiva,
   excepción, evidencia y SLA.
5. **Uso responsable:** revisión de sesgo, variables permitidas, explicabilidad,
   privacidad y proporcionalidad de la acción.

## Registro mínimo por alerta

| Campo | Propósito |
| --- | --- |
| `alert_id` | Trazabilidad única |
| `rule_version` | Reproducibilidad |
| `event_timestamp` | Orden y SLA |
| `customer/account key` | Vinculación controlada |
| `reason_codes` | Explicabilidad |
| `recommended_action` | Uso previsto |
| `owner` | Responsabilidad |
| `decision` | Acción ejecutada o excepción |
| `outcome_30_60_90` | Aprendizaje |

## Validación propuesta

- Desarrollo y validación independiente no deben compartir la aprobación final.
- Todo cambio de umbral requiere simulación de impacto y versionado.
- Las estrategias deben iniciar con grupo de control o diseño cuasiexperimental.
- Ninguna señal debe producir una acción adversa automática sin controles,
  explicabilidad y aprobación institucional.
- El tablero debe distinguir dato observado, estimación y escenario.

## Limitaciones de la demo

- No incorpora datos reales ni información personal.
- No estima provisiones regulatorias ni contables.
- El RAROC es simplificado y no representa la metodología de una entidad.
- Las elasticidades macro son didácticas, no calibradas.
- Las cifras de impacto son hipótesis de trabajo.
