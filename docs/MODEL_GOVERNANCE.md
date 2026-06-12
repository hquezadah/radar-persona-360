# Gobierno analítico y de alertas

## Alcance

Radar Persona 360 es una plataforma de monitoreo gerencial. Las salidas
analíticas apoyan decisiones de portafolio; no sustituyen los modelos aprobados,
las políticas vigentes ni las instancias de autorización.

La activación operativa exige datos homologados, parámetros aprobados,
validación independiente, pruebas de usuario y controles de seguridad.

## Roles

| Rol | Responsabilidad |
| --- | --- |
| Product Owner | prioriza casos de uso y acepta entregables |
| Data Owner | certifica fuentes, definiciones y calidad |
| Risk Strategy Owner | propone reglas y acciones |
| Model Risk / Validación | desafía metodología y desempeño |
| Tecnología | opera integración, seguridad y disponibilidad |
| Negocio / Cobranzas | ejecuta acciones y registra resultado |
| Comité aprobador | autoriza parámetros y cambios materiales |

## Capas de control

1. **Datos:** completitud, unicidad, oportunidad, reconciliación, linaje y
   estabilidad.
2. **Analítica:** discriminación, calibración, PSI, backtesting, falsos
   positivos y sensibilidad.
3. **Negocio:** RAROC, margen, contacto, aceptación, cura, retención y
   experiencia del cliente.
4. **Gobierno:** dueño, aprobador, versión, vigencia, excepción, evidencia y
   SLA.
5. **Uso responsable:** variables permitidas, explicabilidad, privacidad,
   proporcionalidad y revisión de sesgo.

## Registro mínimo por alerta

| Campo | Propósito |
| --- | --- |
| `alert_id` | Trazabilidad única |
| `rule_id` y `rule_version` | Reproducibilidad |
| `event_timestamp` | Orden y SLA |
| `account_key` | Vinculación tokenizada |
| `reason_codes` | Explicabilidad |
| `recommended_action` | Uso previsto |
| `owner` | Responsabilidad |
| `decision` | Acción o excepción |
| `outcome_30_60_90` | Aprendizaje |

## Ciclo de cambio

1. propuesta de regla o parámetro;
2. simulación de impacto y backtesting;
3. revisión de Datos, Riesgo, Negocio y Validación;
4. aprobación y fecha efectiva;
5. despliegue con rollback disponible;
6. monitoreo postimplementación;
7. ratificación, ajuste o retiro.

## Criterios para producción

- reconciliación dentro de tolerancias aprobadas;
- cero defectos críticos de seguridad o privacidad;
- pruebas funcionales y de recuperación aprobadas;
- métricas y reason codes reproducibles;
- responsables y SLA configurados;
- bitácora inmutable de parámetros y decisiones;
- plan de contingencia manual vigente;
- documentación de modelo, proceso y operación aprobada.

## Restricciones de la instancia pública

- no contiene información institucional ni personal;
- usa un fixture controlado exclusivamente para pruebas de integración;
- no publica parámetros confidenciales ni credenciales;
- no debe utilizarse para decisiones sobre clientes;
- el despliegue interno debe residir en infraestructura privada.
