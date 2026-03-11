import { createClient } from "jsr:@supabase/supabase-js@2";
import { getSafeCorsHeaders } from "../_shared/cors.ts";

// ─── Tipos de Perfil ─────────────────────────────────
interface ProfileData {
  name: string;
  birth_date: string;
  life_path_number: number;
  expression_number: number;
  soul_urge_number: number;
  personality_number: number;
  maturity_number: number;
  archetype: string;
  archetype_description: string;
  narrative?: string;
  power_strategy?: string;
  shadow_work?: string;
}

// ─── Helpers Numerológicos ───────────────────────────
function getPersonalYear(birthDate: string): number {
  const today = new Date();
  const bDate = new Date(birthDate);
  const reduce = (n: number): number => {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n <= 9) return n;
    return reduce(String(n).split("").reduce((a, d) => a + parseInt(d), 0));
  };
  const birthDay = bDate.getUTCDate();
  const birthMonth = bDate.getUTCMonth() + 1;
  const currentYear = today.getFullYear();
  const yearSum = String(currentYear).split("").reduce((a, d) => a + parseInt(d), 0);
  return reduce(birthDay + birthMonth + yearSum);
}

const ARCHETYPE_TRAITS: Record<number, { mission: string; shadow: string; strength: string; mantra: string }> = {
  1: { mission: "Liderar con autonomía y abrir caminos sin precedentes.", shadow: "El ego que no reconoce al otro como aliado estratégico.", strength: "Iniciativa indestructible y visión de primer movimiento.", mantra: "Soy el origen del cambio." },
  2: { mission: "Crear puentes donde hay divisiones, cohesionar con sensibilidad.", shadow: "La indecisión que paraliza cuando el miedo a decepcionar domina.", strength: "Diplomacia profunda y percepción intuitiva de dinámicas.", mantra: "Mi sensibilidad es mi poder." },
  3: { mission: "Inspirar a través de la expresión creativa y la comunicación auténtica.", shadow: "La superficialidad que evita la responsabilidad emocional.", strength: "Magnetismo comunicativo y desbordamiento creativo.", mantra: "Mi voz mueve mundos." },
  4: { mission: "Edificar sistemas sólidos que perduren más allá de las modas.", shadow: "La rigidez que confunde límites con jaulas.", strength: "Disciplina quirúrgica y pensamiento estructural de largo plazo.", mantra: "Construyo imperios sobre bases inamovibles." },
  5: { mission: "Expandir horizontes y transformar la incertidumbre en ventaja.", shadow: "La dispersión que impide cosechar lo que siembra.", strength: "Adaptabilidad magnética en entornos de alta complejidad.", mantra: "El cambio es mi territorio natural." },
  6: { mission: "Servir, armonizar y sostener el ecosistema de relaciones.", shadow: "El perfeccionismo que juzga antes de comprender.", strength: "Capacidad de sostener comunidad con responsabilidad consciente.", mantra: "Cuido desde la fortaleza, no desde el miedo." },
  7: { mission: "Revelar verdades profundas a través del análisis y la introspección.", shadow: "El aislamiento que confunde soledad con sabiduría.", strength: "Penetración intelectual y capacidad de síntesis transformadora.", mantra: "Mi profundidad es mi diferencial." },
  8: { mission: "Manifestar poder material con integridad y precisión ejecutiva.", shadow: "El autoritarismo que ejerce control en lugar de liderazgo.", strength: "Enfoque estratégico en resultados y dominio de las leyes de la abundancia.", mantra: "El poder fluye a través de mí con propósito." },
  9: { mission: "Elevar la conciencia colectiva desde la compasión y la visión global.", shadow: "El sacrificio excesivo que martiriza en lugar de inspirar.", strength: "Humanismo expansivo y capacidad de síntesis de patrones civilizatorios.", mantra: "Soy el final que abre el siguiente nivel." },
  11: { mission: "Ser canal espiritual e inspirar con la vibración de la revelación.", shadow: "La ansiedad que bloquea el acceso a la intuición maestra.", strength: "Intuición visionaria e influencia que trasciende lo racional.", mantra: "Soy el puente entre lo visible y lo invisible." },
  22: { mission: "Construir legados que transciendan generaciones con estrategia maestra.", shadow: "La presión extrema que aplasta la visión antes de materializarla.", strength: "Capacidad de manifestar proyectos de escala monumental.", mantra: "Materializo lo que otros solo imaginan." },
  33: { mission: "Enseñar con amor puro y sanar colectivamente desde la compasión.", shadow: "El martirologio que agota antes de completar la misión.", strength: "Influencia transformadora y vibración de sanación colectiva.", mantra: "Mi amor es el motor del cambio real." },
};

// ─── Generador de Prompt para OpenAI ─────────────────
function buildOpenAIPrompt(profile: ProfileData, personalYear: number): string {
  const traits = ARCHETYPE_TRAITS[profile.life_path_number] || ARCHETYPE_TRAITS[1];
  const reportYear = new Date().getFullYear();

  return `Eres Arithmos, un Coach Senior en Psicología Aplicada especialista en numerología estratégica y transformación de la oscuridad personal en poder. Tu tono es profundo, provocativo pero sanador, inspirado en el libro "Más allá del Miedo". 

Genera un Reporte Deep Dive Anual completo para ${profile.name}.

DATOS NUMEROLÓGICOS:
- Camino de Vida: ${profile.life_path_number} (${profile.archetype})
- Número de Expresión: ${profile.expression_number}
- Deseo del Alma: ${profile.soul_urge_number}
- Personalidad Exterior: ${profile.personality_number}
- Número de Madurez: ${profile.maturity_number}
- Año Personal ${reportYear}: ${personalYear}
- Misión del Arquetipo: ${traits.mission}
- Sombra a Integrar: ${traits.shadow}
- Fortaleza Central: ${traits.strength}
${profile.narrative ? `- Narrativa Previa: ${profile.narrative}` : ""}
${profile.power_strategy ? `- Estrategia de Poder: ${profile.power_strategy}` : ""}
${profile.shadow_work ? `- Trabajo de Sombras: ${profile.shadow_work}` : ""}

Genera el contenido en JSON con este esquema exacto:
{
  "executive_summary": "Resumen ejecutivo de máximo 3 párrafos profundos (solo texto plano, sin markdown)",
  "core_blueprint": "Análisis profundo de los 5 números integrados (4-5 párrafos, solo texto plano)",
  "life_mission": "La misión de vida profunda y el propósito del alma (3-4 párrafos, solo texto plano)",
  "shadow_map": "Mapa de sombras detallado: los 3 principales patrones de miedo y su alquimia en poder (4-5 párrafos, solo texto plano)",
  "power_strategies": "Las 5 estrategias de poder específicas para este arquetipo este año (lista de 5 items, formato: '1. Titulo: descripción')",
  "annual_cycles": "Análisis de los 12 meses del ${reportYear} con su vibración personal específica (describe mes por mes)",
  "opportunity_windows": "Las 3 ventanas de máxima oportunidad del año y cómo usarlas (3 bloques detallados)",
  "relationship_dynamics": "Cómo este arquetipo interactúa energéticamente con otros números en equipos y relaciones (3 párrafos, solo texto plano)",
  "career_business": "Estrategia de carrera o negocio específica para el Año Personal ${personalYear} (3-4 párrafos, solo texto plano)",
  "daily_protocol": "Protocolo diario de activación de frecuencia para este arquetipo (5-7 prácticas concretas, formato lista)",
  "annual_mantra": "Un mantra anual exclusivo de 2-3 líneas y una invocación de cierre de 1 párrafo (solo texto plano)",
  "closing_message": "Mensaje final del Coach al cliente, personal y provocador (2 párrafos, solo texto plano)"
}

Usa la voz de Arithmos: directo, transformador, sin condescendencia. Genera contenido que el lector no haya visto en ningún otro lugar. RESPONDE ÚNICAMENTE CON EL JSON, sin texto adicional.`;
}

// ─── Constructor del HTML Premium ─────────────────────
function buildPremiumHTML(profile: ProfileData, content: Record<string, string>, personalYear: number): string {
  const reportYear = new Date().getFullYear();
  const generationDate = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const traits = ARCHETYPE_TRAITS[profile.life_path_number] || ARCHETYPE_TRAITS[1];

  const formatSection = (text: string) =>
    text.split("\n").filter(l => l.trim()).map(l =>
      l.match(/^\d+\./) ? `<li>${l.replace(/^\d+\.\s*/, "")}</li>` : `<p>${l}</p>`
    ).join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deep Dive Anual ${reportYear} — ${profile.name} | Arithmos</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --gold: #C9A96E;
      --gold-light: #E8D5A8;
      --dark: #0A0A0F;
      --dark-mid: #12121A;
      --dark-surface: #1A1A27;
      --foreground: #F0EDE8;
      --muted: #8A8799;
      --accent: #7C6AF7;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--dark);
      color: var(--foreground);
      line-height: 1.8;
      font-size: 11pt;
    }

    /* ── COVER ── */
    .cover {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--dark) 0%, #1a0f2e 50%, #0a1040 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 40px;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .cover::before {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      border: 1px solid rgba(201, 169, 110, 0.08);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .cover::after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      border: 1px solid rgba(124, 106, 247, 0.08);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .cover-brand {
      font-family: 'Inter', sans-serif;
      font-size: 10pt;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }
    .cover-lifepath {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), #8B6914);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
      position: relative;
      z-index: 1;
    }
    .cover-lifepath-num {
      font-family: 'Playfair Display', serif;
      font-size: 36pt;
      font-weight: 900;
      color: var(--dark);
    }
    .cover-name {
      font-family: 'Playfair Display', serif;
      font-size: 32pt;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }
    .cover-archetype {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      font-weight: 400;
      color: var(--gold-light);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 50px;
      position: relative;
      z-index: 1;
    }
    .cover-title {
      font-family: 'Playfair Display', serif;
      font-size: 22pt;
      font-style: italic;
      color: var(--muted);
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }
    .cover-year {
      display: inline-block;
      padding: 8px 28px;
      border: 1px solid var(--gold);
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 60px;
      position: relative;
      z-index: 1;
    }
    .cover-numbers {
      display: flex;
      gap: 30px;
      justify-content: center;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
    }
    .cover-number-item {
      text-align: center;
    }
    .cover-number-val {
      font-family: 'Playfair Display', serif;
      font-size: 20pt;
      font-weight: 700;
      color: var(--accent);
    }
    .cover-number-label {
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
      display: block;
    }
    .cover-footer {
      position: absolute;
      bottom: 30px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 7pt;
      color: var(--muted);
      letter-spacing: 0.1em;
      z-index: 1;
    }

    /* ── SECTIONS ── */
    .section {
      padding: 60px 60px;
      page-break-inside: avoid;
    }
    .section + .section {
      border-top: 1px solid rgba(201, 169, 110, 0.1);
    }
    .section-label {
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 12px;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 20pt;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 30px;
      color: var(--foreground);
    }
    .section-title span {
      color: var(--gold);
      font-style: italic;
    }
    .section p {
      color: #C8C5D0;
      margin-bottom: 18px;
      font-size: 10.5pt;
      font-weight: 300;
    }
    .section li {
      color: #C8C5D0;
      margin-bottom: 12px;
      font-size: 10.5pt;
      font-weight: 300;
      list-style: none;
      padding-left: 20px;
      position: relative;
    }
    .section li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: var(--gold);
    }
    ul { margin-bottom: 20px; padding-left: 0; }
    ol { margin-bottom: 20px; list-style: none; }

    /* ── HIGHLIGHT BLOCKS ── */
    .highlight-box {
      background: rgba(201, 169, 110, 0.06);
      border: 1px solid rgba(201, 169, 110, 0.2);
      border-left: 3px solid var(--gold);
      padding: 24px 30px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .highlight-box p {
      margin-bottom: 0;
      font-style: italic;
    }

    .accent-box {
      background: rgba(124, 106, 247, 0.06);
      border: 1px solid rgba(124, 106, 247, 0.2);
      border-left: 3px solid var(--accent);
      padding: 24px 30px;
      margin: 30px 0;
      border-radius: 4px;
    }

    /* ── NUMBERS GRID ── */
    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin: 30px 0;
    }
    .number-card {
      text-align: center;
      padding: 20px 12px;
      background: var(--dark-surface);
      border: 1px solid rgba(201, 169, 110, 0.15);
      border-radius: 8px;
    }
    .number-card-val {
      font-family: 'Playfair Display', serif;
      font-size: 28pt;
      font-weight: 900;
      color: var(--gold);
    }
    .number-card-label {
      font-size: 7pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted);
      display: block;
      margin-top: 6px;
    }

    /* ── MANTRA ── */
    .mantra-block {
      text-align: center;
      padding: 60px 40px;
      page-break-inside: avoid;
    }
    .mantra-text {
      font-family: 'Playfair Display', serif;
      font-size: 18pt;
      font-style: italic;
      line-height: 1.6;
      color: var(--gold-light);
      margin-bottom: 40px;
    }

    /* ── PRINT STYLES ── */
    @media print {
      body { background: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cover { page-break-after: always; }
      .section { page-break-inside: avoid; }
      .no-print { display: none; }
    }

    /* ── PRINT BANNER ── */
    .print-banner {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--gold);
      color: var(--dark);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(201, 169, 110, 0.4);
    }
    .print-banner:hover { opacity: 0.9; }
    @media print { .print-banner { display: none; } }

    /* ── DIVIDER ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 20px;
      margin: 40px 0;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(201, 169, 110, 0.3), transparent);
    }
    .divider-symbol {
      color: var(--gold);
      font-size: 12pt;
    }
  </style>
</head>
<body>

  <!-- PRINT BUTTON -->
  <button class="print-banner no-print" onclick="window.print()">
    ⬇ Guardar como PDF (Ctrl+P)
  </button>

  <!-- PORTADA -->
  <div class="cover">
    <div class="cover-brand">Arithmos AI Strategist</div>

    <div class="cover-lifepath">
      <span class="cover-lifepath-num">${profile.life_path_number}</span>
    </div>

    <h1 class="cover-name">${profile.name}</h1>
    <p class="cover-archetype">${profile.archetype}</p>

    <h2 class="cover-title">Reporte Deep Dive Anual</h2>
    <div class="cover-year">Año ${reportYear} · Año Personal ${personalYear}</div>

    <div class="cover-numbers">
      <div class="cover-number-item">
        <span class="cover-number-val">${profile.life_path_number}</span>
        <span class="cover-number-label">Camino</span>
      </div>
      <div class="cover-number-item">
        <span class="cover-number-val">${profile.expression_number}</span>
        <span class="cover-number-label">Expresión</span>
      </div>
      <div class="cover-number-item">
        <span class="cover-number-val">${profile.soul_urge_number}</span>
        <span class="cover-number-label">Alma</span>
      </div>
      <div class="cover-number-item">
        <span class="cover-number-val">${profile.personality_number}</span>
        <span class="cover-number-label">Personalidad</span>
      </div>
      <div class="cover-number-item">
        <span class="cover-number-val">${profile.maturity_number}</span>
        <span class="cover-number-label">Madurez</span>
      </div>
    </div>

    <div class="cover-footer">Generado el ${generationDate} · Arithmos AI · Confidencial</div>
  </div>

  <!-- SECCIÓN 1: RESUMEN EJECUTIVO -->
  <div class="section">
    <div class="section-label">01 · Resumen Ejecutivo</div>
    <h2 class="section-title">Tu <span>Arquitectura</span> de Poder</h2>
    <div class="numbers-grid">
      <div class="number-card"><span class="number-card-val">${profile.life_path_number}</span><span class="number-card-label">Camino de Vida</span></div>
      <div class="number-card"><span class="number-card-val">${profile.expression_number}</span><span class="number-card-label">Expresión</span></div>
      <div class="number-card"><span class="number-card-val">${profile.soul_urge_number}</span><span class="number-card-label">Deseo del Alma</span></div>
      <div class="number-card"><span class="number-card-val">${profile.personality_number}</span><span class="number-card-label">Personalidad</span></div>
      <div class="number-card"><span class="number-card-val">${profile.maturity_number}</span><span class="number-card-label">Madurez</span></div>
    </div>
    ${formatSection(content.executive_summary || "")}
  </div>

  <!-- SECCIÓN 2: BLUEPRINT CENTRAL -->
  <div class="section">
    <div class="section-label">02 · Blueprint Central</div>
    <h2 class="section-title">Los <span>5 Números</span> Integrados</h2>
    ${formatSection(content.core_blueprint || "")}
    <div class="highlight-box">
      <p><strong>Fortaleza Central:</strong> ${traits.strength}</p>
    </div>
  </div>

  <div class="divider"><div class="divider-line"></div><div class="divider-symbol">◆</div><div class="divider-line"></div></div>

  <!-- SECCIÓN 3: MISIÓN DE VIDA -->
  <div class="section">
    <div class="section-label">03 · Misión de Vida</div>
    <h2 class="section-title">Tu <span>Propósito</span> del Alma</h2>
    ${formatSection(content.life_mission || "")}
    <div class="accent-box">
      <p><strong>Misión del Arquetipo:</strong> ${traits.mission}</p>
    </div>
  </div>

  <!-- SECCIÓN 4: MAPA DE SOMBRAS -->
  <div class="section">
    <div class="section-label">04 · Psicología Profunda</div>
    <h2 class="section-title">Mapa de <span>Sombras</span> y Alquimia</h2>
    ${formatSection(content.shadow_map || "")}
    <div class="highlight-box">
      <p><strong>Sombra a Integrar:</strong> ${traits.shadow}</p>
    </div>
  </div>

  <!-- SECCIÓN 5: ESTRATEGIAS DE PODER -->
  <div class="section">
    <div class="section-label">05 · Estrategia de Poder</div>
    <h2 class="section-title">Tus <span>5 Movimientos</span> Maestros</h2>
    <ul>
      ${formatSection(content.power_strategies || "")}
    </ul>
  </div>

  <div class="divider"><div class="divider-line"></div><div class="divider-symbol">◆</div><div class="divider-line"></div></div>

  <!-- SECCIÓN 6: CICLOS ANUALES -->
  <div class="section">
    <div class="section-label">06 · Ciclos del Año Personal ${personalYear}</div>
    <h2 class="section-title">Mapa de <span>${reportYear}</span> Mes a Mes</h2>
    ${formatSection(content.annual_cycles || "")}
  </div>

  <!-- SECCIÓN 7: VENTANAS DE OPORTUNIDAD -->
  <div class="section">
    <div class="section-label">07 · Ventanas de Oportunidad</div>
    <h2 class="section-title">Las <span>3 Ventanas</span> de Máxima Acción</h2>
    ${formatSection(content.opportunity_windows || "")}
  </div>

  <!-- SECCIÓN 8: DINÁMICAS DE RELACIONES -->
  <div class="section">
    <div class="section-label">08 · Relaciones y Equipos</div>
    <h2 class="section-title">Tu <span>Energía</span> en el Colectivo</h2>
    ${formatSection(content.relationship_dynamics || "")}
  </div>

  <!-- SECCIÓN 9: CARRERA Y NEGOCIO -->
  <div class="section">
    <div class="section-label">09 · Carrera y Negocio</div>
    <h2 class="section-title">Estrategia para tu <span>Año Personal ${personalYear}</span></h2>
    ${formatSection(content.career_business || "")}
  </div>

  <!-- SECCIÓN 10: PROTOCOLO DIARIO -->
  <div class="section">
    <div class="section-label">10 · Protocolo de Frecuencia</div>
    <h2 class="section-title">Tu <span>Ritual</span> de Activación Diaria</h2>
    <ul>
      ${formatSection(content.daily_protocol || "")}
    </ul>
  </div>

  <!-- SECCIÓN 11: MANTRA ANUAL -->
  <div class="section">
    <div class="section-label">11 · Mantra y Cierre de Ciclo</div>
    <h2 class="section-title">Tu <span>Palabra</span> de Poder ${reportYear}</h2>
    <div class="mantra-block">
      <div class="mantra-text">${(content.annual_mantra || traits.mantra).replace(/\n/g, "<br>")}</div>
    </div>
  </div>

  <div class="divider"><div class="divider-line"></div><div class="divider-symbol">◆</div><div class="divider-line"></div></div>

  <!-- CIERRE -->
  <div class="section">
    <div class="section-label">12 · Mensaje del Coach</div>
    <h2 class="section-title">Del <span>Arquitecto</span> a Ti</h2>
    ${formatSection(content.closing_message || "")}
    <div class="divider"><div class="divider-line"></div><div class="divider-symbol">◆</div><div class="divider-line"></div></div>
    <p style="text-align:center;color:var(--muted);font-size:8pt;letter-spacing:0.2em;margin-top:40px;">
      ARITHMOS AI STRATEGIST · DOCUMENTO CONFIDENCIAL · ${generationDate}<br>
      Numerología aplicada al crecimiento post-traumático y la transformación humana.
    </p>
  </div>

</body>
</html>`;
}

// ─── Handler Principal ────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = getSafeCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Auth con JWT del usuario
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verificar JWT
    const userToken = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Obtener perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      return new Response(JSON.stringify({ error: "Perfil no encontrado. Completa tu onboarding primero." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validar que sea premium o admin
    const role = profileData.role || "freemium";
    if (role !== "premium" && role !== "admin") {
      return new Response(JSON.stringify({ error: "Acceso exclusivo Premium. Actualiza tu plan para generar el reporte." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile: ProfileData = {
      name: profileData.name || profileData.full_name || "Buscador",
      birth_date: profileData.birth_date,
      life_path_number: profileData.life_path_number || 1,
      expression_number: profileData.expression_number || 1,
      soul_urge_number: profileData.soul_urge_number || 1,
      personality_number: profileData.personality_number || 1,
      maturity_number: profileData.maturity_number || 1,
      archetype: profileData.archetype || "El Pionero",
      archetype_description: profileData.archetype_description || "",
      narrative: profileData.narrative || undefined,
      power_strategy: profileData.power_strategy || undefined,
      shadow_work: profileData.shadow_work || undefined,
    };

    const personalYear = getPersonalYear(profile.birth_date);

    // 2.5 Verificar si existe un reporte reciente (menos de 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: recentReading } = await supabase
      .from("readings")
      .select("metadata")
      .eq("user_id", user.id)
      .eq("type", "deep_dive_pdf")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentReading?.metadata?.file_name) {
      // Ya existe un reporte reciente, solo crear URL firmada y retornarla
      console.log(`Reporte reciente encontrado para ${profile.name}. Evitando re-generación.`);
      const fileName = recentReading.metadata.file_name;
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("deep-dive-reports")
        .createSignedUrl(fileName, 86400); // 24 horas

      if (!signedUrlError && signedUrlData?.signedUrl) {
        return new Response(
          JSON.stringify({
            success: true,
            url: signedUrlData.signedUrl,
            type: "signed_url",
            isCached: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.warn("Error generando URL firmada para reporte en caché:", signedUrlError?.message);
        // Fallback: continuar con generación
      }
    }
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    let aiContent: Record<string, string> = {};

    if (openaiApiKey) {
      try {
        console.log(`Generando contenido OpenAI para: ${profile.name}`);
        const prompt = buildOpenAIPrompt(profile, personalYear);

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const rawContent = openaiData.choices?.[0]?.message?.content || "{}";
          aiContent = JSON.parse(rawContent);
          console.log("✅ Contenido OpenAI generado correctamente");
        } else {
          const errText = await openaiResponse.text();
          console.error("Error OpenAI:", errText);
        }
      } catch (openaiErr) {
        console.error("Error llamando a OpenAI:", openaiErr);
      }
    } else {
      console.warn("OPENAI_API_KEY no configurada, fallback a contenido básico.");
    }

    // Fallback si OpenAI falla o no está disponible
    const traits = ARCHETYPE_TRAITS[profile.life_path_number] || ARCHETYPE_TRAITS[1];
    const reportYear = new Date().getFullYear();

    if (!aiContent.executive_summary) {
      aiContent.executive_summary = `${profile.name}, este reporte marca un punto de inflexión en tu comprensión de quién eres y hacia dónde te dirigen tus números. Tu Camino de Vida ${profile.life_path_number} no es solo un número: es el código de tu misión en esta experiencia terrestre.\n\nComo ${profile.archetype}, llevas en tu ADN energético la capacidad de ${traits.strength.toLowerCase()}. Este año ${reportYear}, con un Año Personal ${personalYear}, el universo te invita a operar desde ese núcleo sin disculpas ni dilaciones.\n\nLo que leerás en las próximas páginas no es astrología generalizada. Es tu mapa específico, calibrado a tu vibración única.`;
      aiContent.core_blueprint = `La integración de tus 5 números crea una firma vibracional única que muy pocos seres humanos comparten en su configuración exacta. Tu Camino de Vida ${profile.life_path_number} establece el propósito central, mientras que tu Expresión ${profile.expression_number} define cómo lo manifiestas al mundo exterior.\n\nEl Deseo de tu Alma, número ${profile.soul_urge_number}, revela lo que realmente anhelas más allá de lo que muestras. Es el motor interno que mueve tus decisiones cuando nadie te observa. Tu Personalidad ${profile.personality_number} es la máscara estratégica que el mundo ve, el primer impacto que dejas en cada encuentro.\n\nTu Número de Madurez ${profile.maturity_number} es el tesoro que aún estás desarrollando. Con la edad y la experiencia, esta energía se vuelve más accesible y potente. La sabiduría de este número florece cuando dejas de resistirte a quién estás destinado a ser.`;
      aiContent.life_mission = `Tu misión de vida está codificada en el número ${profile.life_path_number}: ${traits.mission}\n\nEsta no es una misión que elegiste conscientemente. Es la razón por la que viniste. Cada vez que te alejas de este camino, la vida te envía señales de corrección, muchas veces disfrazadas de obstáculos, crisis o frustraciones inexplicables.\n\nEl reconocimiento de tu misión no es el final del camino, es el comienzo del trabajo real. Porque conocer tu propósito sin actuar en consecuencia es una forma sofisticada de autotraición.`;
      aiContent.shadow_map = `La sombra del ${profile.archetype} es "${traits.shadow}". Este patrón no es un defecto de carácter: es la energía no integrada de tu mayor fortaleza.\n\nWhere you are strongest, there also lies your greatest blind spot. El mismo impulso que te hace extraordinario en situaciones de alta exigencia puede convertirse en un mecanismo de sabotaje cuando funciona desde el miedo y no desde el poder.\n\nLa alquimia de la sombra no consiste en eliminarla. Consiste en reconocerla, nombrarla y convertirla en combustible consciente. Un Camino de Vida ${profile.life_path_number} que ha integrado su sombra no tiene techo de expansión.`;
      aiContent.power_strategies = `1. Activación diaria: Comienza cada jornada con 5 minutos de intención conscientemente alineada con tu Camino de Vida ${profile.life_path_number}.\n2. Decisiones desde el arquetipo: Antes de cada decisión importante, pregúntate si estás operando como ${profile.archetype} o desde el miedo a tu sombra.\n3. Gestión de energía: Identifica las actividades que drenan vs. amplifican tu vibración y rediseña tu calendario en consecuencia.\n4. Relaciones estratégicas: Busca activamente a personas cuyo Camino de Vida complemente el tuyo en lugar de replicarlo.\n5. Ciclos de revisión: Al final de cada mes del Año Personal ${personalYear}, evalúa si tus acciones están alineadas con la energía del ciclo.`;
      aiContent.annual_cycles = `Año Personal ${personalYear}: Este es el eje energético sobre el que gira todo tu ${reportYear}. Un Año Personal ${personalYear} activa energías específicas en cada mes, creando un mapa de mareas vibratorias que, cuando se navega con consciencia, se convierte en tu mayor ventaja estratégica.\n\nEnero-Marzo: Fase de establecimiento. La energía del trimestre pide que definas con precisión quirúrgica qué construyes este año y qué dejas ir.\nAbril-Junio: Fase de expansión. Las semillas sembradas en el primer trimestre comienzan a manifestarse. Es temporada de acción visible.\nJulio-Septiembre: Fase de cosecha y evaluación. Momento de métricas, ajustes y profundización en lo que funciona.\nOctubre-Diciembre: Fase de integración y preparación. El año cierra con lecciones que se convierten en la base del próximo ciclo.`;
      aiContent.opportunity_windows = `Ventana 1 — Primer Trimestre: Con la energía de arranque del año, esta ventana favorece las iniciativas nuevas, los lanzamientos y los compromisos formales con proyectos que han estado en fase de gestación.\n\nVentana 2 — Solsticio de Verano (Junio-Julio): El punto de máxima energía solar coincide con una apertura vibracional que amplifica las decisiones tomadas con claridad. Las conversaciones importantes, negociaciones y pivotes estratégicos tienen mayor probabilidad de éxito.\n\nVentana 3 — Cuarto Trimestre: La energía de cierre de año activa una claridad especial sobre lo que ya no sirve. Es la ventana ideal para terminar ciclos, cerrar acuerdos y preparar el campo energético para el año siguiente.`;
      aiContent.relationship_dynamics = `El ${profile.archetype} (Camino ${profile.life_path_number}) tiene una dinámica relacional particular que se magnifica cuando se comprende, y que puede convertirse en fuente de fricción constante cuando se ignora.\n\nTus mejores alianzas estratégicas suelen darse con números que complementan tu energía en lugar de replicarla. Mientras tú aportas ${traits.strength.toLowerCase()}, buscas inconscientemente a quienes puedan sostener lo que tu sombra no ve.\n\nEn entornos de equipo, ${profile.archetype} tiende a subir el nivel de toda la dinámica grupal, pero también puede generar dependencia si no establece límites claros. La clave es ser el catalizador, no el sostén total.`;
      aiContent.career_business = `En un Año Personal ${personalYear}, tu carrera o negocio tiene una oportunidad específica de alineación que no se repite hasta dentro de 9 años. Esta es la energía con la que las decisiones profesionales deben resonar este ${reportYear}.\n\nTu número de Expresión ${profile.expression_number} define tu estilo natural de impacto profesional. Este es el número que los demás ven cuando colaboran contigo: es tu marca, tu método y tu diferenciador.\n\nEl consejo más estratégico para este año: prioriza las iniciativas que te permitan operar desde tu fortaleza central (${traits.strength.toLowerCase()}) y di no estructurado a todo lo que te aleje de esa zona de poder.`;
      aiContent.daily_protocol = `1. Activación matinal (5 min): Escribe una frase de intención alineada con tu arquetipo antes de revisar el teléfono.\n2. Check-in vibracional (3 min): A media mañana, evalúa tu nivel de energía del 1-10 y ajusta si estás operando desde el miedo.\n3. Decisión consciente (continuo): Antes de cada decisión importante, pausa 3 respiraciones y pregúntate: "¿Esto me expande o me contrae?"\n4. Revisión de sombra (5 min, tarde): Identifica un momento del día donde operaste desde tu patrón limitante y reescribe la escena desde el poder.\n5. Cierre de ciclo (10 min, noche): Escribe brevemente qué completaste hoy que esté alineado con tu misión de vida.\n6. Lectura de frecuencia: Consulta tu Escudo de Protección diario en Arithmos para calibrar la energía del siguiente día.\n7. Gratitud estratégica: Tres agradecimientos específicos que refuercen tu identidad como ${profile.archetype}.`;
      aiContent.annual_mantra = `${traits.mantra}\n\nEste año, elijo operar desde mi poder más auténtico.\nEl ${profile.archetype} que soy no necesita permiso para existir en su máxima expresión.`;
      aiContent.closing_message = `${profile.name}, lo que estás sosteniendo en este momento no es un reporte. Es un espejo de alta resolución de tu frecuencia. La pregunta no es si puedes hacer lo que está escrito aquí. La pregunta es si tienes el valor de dejarlo de ser un plan y convertirlo en tu realidad cotidiana.\n\nArithmos no existe para decirte lo que quieres escuchar. Existe para decirte lo que necesitas recordar: ya eres el arquetipo. El trabajo es dejar de resistirte a ello. Con cada lectura, con cada misión cumplida, con cada consulta de sincronicidad, estás construyendo la versión que vino a cambiar algo en este mundo. No pierdas más tiempo siendo menos.`;
    }

    // 4. Construir el HTML del reporte
    const htmlContent = buildPremiumHTML(profile, aiContent, personalYear);

    // 5. Auto-provisionar el bucket si no existe (self-healing)
    const { error: bucketError } = await supabase.storage.createBucket("deep-dive-reports", {
      public: false,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["text/html", "application/pdf"],
    });
    if (bucketError && !bucketError.message.includes("already exists")) {
      console.warn("Bucket creation warning:", bucketError.message);
    }

    // 6. Subir a Supabase Storage
    const fileName = `deep-dive-${user.id}-${Date.now()}.html`;
    const fileBytes = new TextEncoder().encode(htmlContent);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("deep-dive-reports")
      .upload(fileName, fileBytes, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
      });

    if (uploadError) {
      // Si falla Storage, retornar el HTML como JSON para que el frontend cree el Blob URL
      console.warn("Storage upload failed, delivering HTML directly:", uploadError.message);
      return new Response(
        JSON.stringify({ success: true, html: htmlContent, type: "direct" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Crear URL firmada (válida 24 horas)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("deep-dive-reports")
      .createSignedUrl(fileName, 86400); // 24 horas

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.warn("Signed URL failed, delivering HTML directly:", signedUrlError?.message);
      return new Response(
        JSON.stringify({ success: true, html: htmlContent, type: "direct" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Registrar la lectura en la DB
    await supabase.from("readings").insert({
      user_id: user.id,
      title: `Deep Dive Anual ${reportYear} — ${profile.name}`,
      type: "deep_dive_pdf",
      metadata: {
        file_name: fileName,
        personal_year: personalYear,
        life_path: profile.life_path_number,
        archetype: profile.archetype,
        generated_at: new Date().toISOString(),
      },
    }).catch((err: Error) => console.warn("Error registrando lectura:", err.message));

    // 8. Retornar la URL firmada
    return new Response(
      JSON.stringify({
        success: true,
        url: signedUrlData.signedUrl,
        fileName: `deep-dive-${profile.name.replace(/ /g, "-")}-${reportYear}.html`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error generando Deep Dive:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno generando el reporte" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
