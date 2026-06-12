const scenarios = {
  base: {
    exposure: "RD$28.4B",
    delinquency: "4.10%",
    expectedLoss: "RD$1.08B",
    raroc: "18.7%",
    health: 82,
    healthDelta: "+3 pts vs. dic-25",
    protection: "RD$184 MM",
    ranges: [1.2, 175, 2.0],
  },
  moderate: {
    exposure: "RD$28.1B",
    delinquency: "5.38%",
    expectedLoss: "RD$1.34B",
    raroc: "15.4%",
    health: 68,
    healthDelta: "-11 pts bajo estrés",
    protection: "RD$241 MM",
    ranges: [2.1, 275, 3.4],
  },
  severe: {
    exposure: "RD$27.5B",
    delinquency: "7.12%",
    expectedLoss: "RD$1.72B",
    raroc: "11.8%",
    health: 49,
    healthDelta: "-30 pts bajo estrés",
    protection: "RD$326 MM",
    ranges: [3.5, 450, 5.2],
  },
};

const chartSeries = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  values: [2.42, 2.51, 2.48, 2.57, 2.69, 2.63, 2.71, 2.78, 2.73, 2.81, 2.92, 2.87, 2.95, 3.02, 3.08, 2.98, 2.91, 2.84],
  threshold: 3.2,
};

const alerts = [
  {
    level: "Crítica",
    type: "critical",
    time: "Hace 2h",
    title: "Utilización revolvente > 85%",
    description: "Crecimiento de 14% en clientes con pago mínimo recurrente.",
    impact: "RD$412 MM",
    action: "Revisar línea y ofrecer consolidación selectiva.",
    owner: "Riesgo + Tarjetas",
    rule: "Utilización > 85% por 2 cortes y pago/estado < 8%.",
  },
  {
    level: "Crítica",
    type: "critical",
    time: "Hace 5h",
    title: "Nómina joven: roll rate al alza",
    description: "El tramo 0-12 meses supera el umbral por tercer corte.",
    impact: "8,420 clientes",
    action: "Ajustar límites iniciales y activar contacto preventivo.",
    owner: "Políticas + Negocio",
    rule: "Roll rate 0→30 > 3.8% y variación mensual > 20 pb.",
  },
  {
    level: "Crítica",
    type: "critical",
    time: "Ayer",
    title: "Concentración empleador",
    description: "Tres empleadores superan el límite interno combinado.",
    impact: "RD$286 MM",
    action: "Congelar expansión incremental hasta revisión sectorial.",
    owner: "Admisión + Portafolio",
    rule: "Exposición agregada por empleador > 2.5% del subportafolio.",
  },
  {
    level: "Preventiva",
    type: "preventive",
    time: "Ayer",
    title: "Menor pago a capital",
    description: "Caída sostenida en amortización de préstamos de consumo.",
    impact: "11,204 clientes",
    action: "Segmentar por capacidad de pago y priorizar orientación.",
    owner: "Cobranzas tempranas",
    rule: "Pago a capital cae > 25% frente al promedio móvil de 3 meses.",
  },
  {
    level: "Preventiva",
    type: "preventive",
    time: "2 días",
    title: "Aumento de consultas externas",
    description: "Se acelera la búsqueda de crédito en clientes prime.",
    impact: "3,116 clientes",
    action: "Aplicar oferta de retención solo a perfiles rentables.",
    owner: "CRM + Riesgo",
    rule: "Consultas de buró >= 3 en 60 días con saldo externo creciente.",
  },
  {
    level: "Preventiva",
    type: "preventive",
    time: "2 días",
    title: "Cross-sell con margen disponible",
    description: "Clientes nómina estables sin tarjeta presentan alto potencial.",
    impact: "RD$96 MM/año",
    action: "Piloto preaprobado con límites según capacidad residual.",
    owner: "Comercial + Analítica",
    rule: "PD < 2%, antigüedad > 18 meses y capacidad residual > 35%.",
  },
  {
    level: "Preventiva",
    type: "preventive",
    time: "3 días",
    title: "Refinanciamientos con cura débil",
    description: "Dos cohortes muestran reincidencia superior a lo esperado.",
    impact: "RD$137 MM",
    action: "Recalibrar elegibilidad y seguimiento postacuerdo.",
    owner: "Cobranzas + Modelos",
    rule: "Reincidencia 30+ a 6 meses > 18% por cohorte.",
  },
  {
    level: "Preventiva",
    type: "preventive",
    time: "3 días",
    title: "Subutilización en segmento premium",
    description: "Líneas sanas con baja activación reducen retorno del capital.",
    impact: "+1.1 pp RAROC",
    action: "Campaña de uso basada en propensión, sin ampliar límites.",
    owner: "Tarjetas + Comercial",
    rule: "Utilización < 12%, PD < 1.2% y margen neto positivo.",
  },
];

const segments = [
  { initials: "NP", name: "Nómina Prime", detail: "Relación > 24 meses", exposure: "RD$8.9B", customers: "92,410", delinquency: "1.82%", pd: "1.46%", raroc: "23.8%", signal: "Crecimiento", className: "growth" },
  { initials: "NJ", name: "Nómina Joven", detail: "Relación 0-12 meses", exposure: "RD$4.2B", customers: "71,208", delinquency: "5.76%", pd: "5.18%", raroc: "13.1%", signal: "Vigilancia", className: "watch" },
  { initials: "RV", name: "Revolvente Intensivo", detail: "Utilización > 70%", exposure: "RD$3.6B", customers: "48,905", delinquency: "7.41%", pd: "7.92%", raroc: "11.4%", signal: "Vigilancia", className: "watch" },
  { initials: "PP", name: "Profesionales", detail: "Ingreso independiente", exposure: "RD$5.1B", customers: "39,117", delinquency: "3.12%", pd: "2.88%", raroc: "19.6%", signal: "Crecimiento", className: "growth" },
  { initials: "CO", name: "Consumo Tradicional", detail: "Préstamo amortizable", exposure: "RD$4.8B", customers: "83,640", delinquency: "4.36%", pd: "4.04%", raroc: "16.8%", signal: "Estable", className: "stable" },
  { initials: "RF", name: "Refinanciados", detail: "Acuerdo vigente", exposure: "RD$1.8B", customers: "18,294", delinquency: "10.62%", pd: "12.30%", raroc: "7.9%", signal: "Vigilancia", className: "watch" },
];

const strategies = [
  {
    status: "Contener",
    title: "Intervención temprana en revolventes",
    text: "Combinar reducción selectiva de líneas, oferta de consolidación y contacto antes del primer atraso.",
    metricLabel: "Pérdida evitada",
    metric: "RD$92 MM",
    timing: "Piloto en 30 días",
  },
  {
    status: "Crecer",
    title: "Cross-sell responsable en nómina prime",
    text: "Preaprobar tarjeta o consumo solo donde la capacidad residual y el RAROC superen el hurdle.",
    metricLabel: "Ingreso incremental",
    metric: "RD$96 MM",
    timing: "12 meses",
  },
  {
    status: "Recalibrar",
    title: "Límites de entrada para nómina joven",
    text: "Usar comportamiento de los primeros 90 días para graduar exposición y evitar deterioro de cosechas.",
    metricLabel: "Mejora mora 30+",
    metric: "-48 pb",
    timing: "2 cohortes",
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function renderAlerts() {
  $("#alertList").innerHTML = alerts
    .map(
      (alert, index) => `
        <article class="alert-card ${alert.type}" tabindex="0" role="button" data-alert="${index}" aria-label="Ver detalle: ${alert.title}">
          <div class="alert-card-top">
            <span class="alert-level">${alert.level}</span>
            <time>${alert.time}</time>
          </div>
          <h4>${alert.title}</h4>
          <p>${alert.description}</p>
          <div class="alert-impact"><span>Exposición / oportunidad</span><strong>${alert.impact}</strong></div>
        </article>
      `,
    )
    .join("");
}

function metricClass(value, kind) {
  const number = Number.parseFloat(value);
  if (kind === "raroc") return number >= 18 ? "metric-good" : number >= 13 ? "metric-watch" : "metric-bad";
  return number <= 3 ? "metric-good" : number <= 6 ? "metric-watch" : "metric-bad";
}

function renderSegments(filter = "all") {
  const filtered = segments.filter((segment) => filter === "all" || segment.className === filter);
  $("#segmentTable").innerHTML = filtered
    .map(
      (segment) => `
        <tr>
          <td>
            <div class="segment-name">
              <span class="segment-initial">${segment.initials}</span>
              <span><strong>${segment.name}</strong><small>${segment.detail}</small></span>
            </div>
          </td>
          <td>${segment.exposure}</td>
          <td>${segment.customers}</td>
          <td class="${metricClass(segment.delinquency, "risk")}">${segment.delinquency}</td>
          <td class="${metricClass(segment.pd, "risk")}">${segment.pd}</td>
          <td class="${metricClass(segment.raroc, "raroc")}">${segment.raroc}</td>
          <td><span class="signal ${segment.className}">${segment.signal}</span></td>
        </tr>
      `,
    )
    .join("");
}

function renderStrategies() {
  $("#strategyGrid").innerHTML = strategies
    .map(
      (strategy, index) => `
        <article class="strategy-card">
          <span class="strategy-number">0${index + 1}</span>
          <span class="pill">${strategy.status}</span>
          <h3>${strategy.title}</h3>
          <p>${strategy.text}</p>
          <div class="strategy-metric">
            <div><span>${strategy.metricLabel}</span><strong>${strategy.metric}</strong></div>
            <small>${strategy.timing}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderLineChart(months = 12) {
  const labels = chartSeries.labels.slice(-months);
  const values = chartSeries.values.slice(-months);
  const width = 760;
  const height = 195;
  const padding = { top: 12, right: 15, bottom: 28, left: 35 };
  const min = 2.2;
  const max = 3.4;
  const x = (index) => padding.left + (index * (width - padding.left - padding.right)) / Math.max(values.length - 1, 1);
  const y = (value) => padding.top + ((max - value) * (height - padding.top - padding.bottom)) / (max - min);
  const path = values.map((value, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`).join(" ");
  const area = `${path} L ${x(values.length - 1)} ${height - padding.bottom} L ${x(0)} ${height - padding.bottom} Z`;
  const ticks = [2.4, 2.8, 3.2];

  $("#rollRateChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#0b9b8f" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#0b9b8f" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${ticks
        .map(
          (tick) => `
            <line x1="${padding.left}" x2="${width - padding.right}" y1="${y(tick)}" y2="${y(tick)}" stroke="#e8ecee" stroke-width="1"/>
            <text x="${padding.left - 8}" y="${y(tick) + 3}" text-anchor="end" font-size="9" fill="#82909a">${tick.toFixed(1)}%</text>
          `,
        )
        .join("")}
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${y(chartSeries.threshold)}" y2="${y(chartSeries.threshold)}" stroke="#d6a63c" stroke-width="1.5" stroke-dasharray="5 5"/>
      <path d="${area}" fill="url(#chartFill)"/>
      <path d="${path}" fill="none" stroke="#087f78" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${values
        .map(
          (value, index) => `
            <circle cx="${x(index)}" cy="${y(value)}" r="${index === values.length - 1 ? 5 : 3}" fill="white" stroke="#087f78" stroke-width="2"/>
          `,
        )
        .join("")}
      ${labels
        .map((label, index) => {
          const frequency = months > 12 ? 3 : months > 6 ? 2 : 1;
          return index % frequency === 0 || index === labels.length - 1
            ? `<text x="${x(index)}" y="${height - 8}" text-anchor="middle" font-size="9" fill="#82909a">${label}</text>`
            : "";
        })
        .join("")}
    </svg>
  `;
}

function updateScenario(key) {
  const scenario = scenarios[key];
  $("#exposureKpi").textContent = scenario.exposure;
  $("#delinquencyKpi").textContent = scenario.delinquency;
  $("#expectedLossKpi").textContent = scenario.expectedLoss;
  $("#rarocKpi").textContent = scenario.raroc;
  $("#healthScore").textContent = scenario.health;
  $("#healthDelta").textContent = scenario.healthDelta;
  $("#heroProtection").textContent = scenario.protection;
  $("#healthRing").style.background =
    `conic-gradient(var(--teal-600) 0deg ${scenario.health * 3.6}deg, #d8e5e5 ${scenario.health * 3.6}deg 360deg)`;
  $("#unemploymentRange").value = scenario.ranges[0];
  $("#rateRange").value = scenario.ranges[1];
  $("#inflationRange").value = scenario.ranges[2];
  updateStressTest();
}

function updateStressTest() {
  const unemployment = Number($("#unemploymentRange").value);
  const rate = Number($("#rateRange").value);
  const inflation = Number($("#inflationRange").value);
  const pressure = unemployment * 0.52 + rate / 540 + inflation * 0.12;
  const delinquency = 4.1 + pressure * 0.69;
  const loss = 1.08 * (1 + pressure * 0.14);
  const raroc = Math.max(8.2, 18.7 - pressure * 1.7);
  const appetite = Math.min(100, Math.round(48 + pressure * 16));

  $("#unemploymentOutput").textContent = `+${unemployment.toFixed(1)} pp`;
  $("#rateOutput").textContent = `+${rate} pb`;
  $("#inflationOutput").textContent = `+${inflation.toFixed(1)} pp`;
  $("#stressDelinquency").textContent = `${delinquency.toFixed(2)}%`;
  $("#stressDelinquencyDelta").textContent = `+${Math.round((delinquency - 4.1) * 100)} pb`;
  $("#stressLoss").textContent = `RD$${loss.toFixed(2)}B`;
  $("#stressLossDelta").textContent = `+${((loss / 1.08 - 1) * 100).toFixed(1)}%`;
  $("#stressRaroc").textContent = `${raroc.toFixed(1)}%`;
  $("#stressRarocDelta").textContent = `${(raroc - 18.7).toFixed(1)} pp`;
  $("#appetiteValue").textContent = `${appetite}%`;
  $("#appetiteBar").style.width = `${appetite}%`;

  if (appetite >= 90) {
    $("#stressNarrative").textContent = "El escenario consume el apetito disponible. Se requiere contención focalizada, revisión de límites y mayor cobertura.";
  } else if (appetite >= 72) {
    $("#stressNarrative").textContent = "El portafolio permanece dentro del apetito, con presión en revolventes y préstamos sin garantía.";
  } else {
    $("#stressNarrative").textContent = "El portafolio absorbe el escenario con holgura; conviene preservar crecimiento selectivo en segmentos rentables.";
  }
}

function openDialog({ eyebrow, title, body }) {
  $("#dialogEyebrow").textContent = eyebrow;
  $("#dialogTitle").textContent = title;
  $("#dialogBody").innerHTML = body;
  $("#detailDialog").showModal();
}

function showAlertDetail(index) {
  const alert = alerts[index];
  openDialog({
    eyebrow: `${alert.level} · ${alert.owner}`,
    title: alert.title,
    body: `
      <p>${alert.description}</p>
      <p><strong>Regla:</strong> ${alert.rule}</p>
      <p><strong>Exposición u oportunidad:</strong> ${alert.impact}</p>
      <p><strong>Decisión sugerida:</strong> ${alert.action}</p>
      <p><strong>Gobierno:</strong> validar la población afectada, ejecutar champion/challenger y medir cura, pérdida evitada y experiencia del cliente.</p>
    `,
  });
}

function exportMis() {
  const headers = ["segmento", "exposicion", "clientes", "mora_30", "pd_12m", "raroc", "senal"];
  const rows = segments.map((segment) => [
    segment.name,
    segment.exposure,
    segment.customers,
    segment.delinquency,
    segment.pd,
    segment.raroc,
    segment.signal,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "radar-persona-360-mis.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("MIS exportado con éxito.");
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

renderAlerts();
renderSegments();
renderStrategies();
renderLineChart();
updateStressTest();

$("#scenarioSelect").addEventListener("change", (event) => updateScenario(event.target.value));
$("#exportButton").addEventListener("click", exportMis);
$("#methodButton").addEventListener("click", () =>
  openDialog({
    eyebrow: "Metodología",
    title: "Cómo se construye la señal ejecutiva",
    body: `
      <p>El índice de salud combina cinco dimensiones ponderadas:</p>
      <ul>
        <li>Calidad: mora, roll rates, cosechas y curas.</li>
        <li>Pérdida: PD, LGD, EAD y pérdida esperada.</li>
        <li>Rentabilidad: margen neto, costo de riesgo y RAROC.</li>
        <li>Concentración: producto, empleador, zona y perfil.</li>
        <li>Resiliencia: sensibilidad bajo escenarios macroeconómicos.</li>
      </ul>
      <p>Las ponderaciones y umbrales son demostrativos. En producción se calibran con historia interna, apetito de riesgo y validación independiente.</p>
    `,
  }),
);

$("#dialogClose").addEventListener("click", () => $("#detailDialog").close());
$("#detailDialog").addEventListener("click", (event) => {
  if (event.target === $("#detailDialog")) $("#detailDialog").close();
});

$("#alertList").addEventListener("click", (event) => {
  const card = event.target.closest("[data-alert]");
  if (card) showAlertDetail(Number(card.dataset.alert));
});
$("#alertList").addEventListener("keydown", (event) => {
  const card = event.target.closest("[data-alert]");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    showAlertDetail(Number(card.dataset.alert));
  }
});

$$(".period-tab").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".period-tab").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderLineChart(Number(button.dataset.period));
  });
});

$$(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".filter-chip").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderSegments(button.dataset.filter);
  });
});

["#unemploymentRange", "#rateRange", "#inflationRange"].forEach((selector) => {
  $(selector).addEventListener("input", updateStressTest);
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    $$(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.section === visible.target.id));
  },
  { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25] },
);

["resumen", "alertas", "segmentos", "estres", "estrategia"].forEach((id) => {
  const section = document.getElementById(id);
  if (section) observer.observe(section);
});
