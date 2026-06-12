# Plan de implementación

## Fase 0: mandato y acceso

**Salida:** alcance, dueños, fuentes, ambientes y casos de uso aprobados.

- nombrar Product Owner y Data Owner;
- definir foro de aprobación;
- confirmar variables permitidas;
- tramitar accesos no productivos;
- establecer criterios de éxito.

## Fase 1: datos y baseline

**Salida:** corte reconciliado y catálogo de métricas.

- mapear fuentes y llaves;
- construir vista cuenta-fecha;
- ejecutar controles de calidad;
- reconciliar exposición y mora;
- establecer baseline por segmento y cosecha.

## Fase 2: reglas y validación

**Salida:** reglas propuestas con desempeño conocido.

- calibrar umbrales;
- medir cobertura y falsos positivos;
- simular exposición afectada;
- revisar sesgo y proporcionalidad;
- completar validación independiente.

## Fase 3: UAT y operación controlada

**Salida:** flujo operativo funcional con trazabilidad.

- integrar responsables y SLA;
- ejecutar champion/challenger;
- registrar decisiones y excepciones;
- medir resultados a 30, 60 y 90 días;
- validar continuidad y rollback.

## Fase 4: escalamiento

**Salida:** decisión de producción y roadmap trimestral.

- cuantificar pérdida evitada e ingreso incremental;
- confirmar estabilidad y experiencia de cliente;
- aprobar parámetros finales;
- desplegar en infraestructura privada;
- activar monitoreo postimplementación.

## Backlog inicial

| Prioridad | Entregable | Responsable principal |
| --- | --- | --- |
| P0 | catálogo de métricas y fuentes | Data Owner |
| P0 | reconciliación de exposición y mora | Riesgo + Finanzas |
| P0 | bitácora de regla y decisión | Tecnología |
| P1 | alerta de utilización revolvente | Estrategia |
| P1 | cohortes de relaciones nuevas | Analítica |
| P1 | tablero de SLA y resultados | Operación |
| P2 | escenarios macroeconómicos | Riesgo + Modelos |
| P2 | propensión de crecimiento responsable | Analítica + Negocio |

## Riesgos de ejecución

| Riesgo | Mitigación |
| --- | --- |
| definiciones inconsistentes | catálogo y reconciliación aprobados |
| alertas sin capacidad operativa | límites diarios y SLA |
| exceso de falsos positivos | backtesting y champion/challenger |
| uso no previsto | reason codes, permisos y auditoría |
| dependencia de personas | runbook y matriz RACI |
| degradación de datos | controles automáticos y bloqueo de carga |
