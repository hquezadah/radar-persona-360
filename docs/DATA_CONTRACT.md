# Contrato de datos

## Grano

Una fila por cuenta y fecha de corte en la capa detallada. La sala de control
consume agregados por segmento y producto; el detalle se habilita solo para
roles autorizados.

## Campos mínimos

| Campo | Tipo | Regla |
| --- | --- | --- |
| `snapshot_date` | date | corte válido y no futuro |
| `account_key` | string | tokenizado, no nulo y único por corte |
| `customer_key` | string | tokenizado |
| `product_type` | string | catálogo homologado |
| `segment_code` | string | versión vigente |
| `current_balance` | decimal | mayor o igual a cero |
| `credit_limit` | decimal | mayor o igual a cero |
| `days_past_due` | integer | mayor o igual a cero |
| `payment_amount` | decimal | mayor o igual a cero |
| `pd_12m` | decimal | rango 0 a 1 |
| `lgd` | decimal | rango 0 a 1 |
| `ead_factor` | decimal | mayor a cero |
| `annual_net_margin` | decimal | definición financiera homologada |
| `economic_capital` | decimal | mayor o igual a cero |

## Controles de entrada

- completitud de campos críticos >= tolerancia aprobada;
- unicidad por cuenta y corte;
- corte consistente entre fuentes;
- saldos reconciliados con MIS;
- catálogos válidos;
- distribución y drift dentro de límites;
- rechazo total de carga si falla un control crítico.

## Metadatos de salida

Cada snapshot publicado debe incluir:

- fecha de corte;
- fecha y hora de proceso;
- versión de contrato;
- versión de reglas;
- fuente;
- estado de reconciliación;
- conteo de filas aceptadas y rechazadas;
- hash o identificador de corrida.
