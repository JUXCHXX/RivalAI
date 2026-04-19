import type { ComparisonResult } from "./storage";

const ENV_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || "";
const MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim() || "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export function getEnvApiKey() {
  return ENV_KEY;
}

function buildPrompt(a: string, b: string, category: string, locale: string) {
  const cat = category && category !== "General" ? ` (categoría: ${category})` : "";
  return `Eres un analista experto. Compara de forma rigurosa y útil "${a}" vs "${b}"${cat}.
Responde EXCLUSIVAMENTE con un JSON válido (sin markdown, sin texto extra) en el idioma "${locale}", con esta estructura EXACTA:

{
  "resumen": "2-3 oraciones impactantes",
  "criterios": [
    {"nombre": "string corto", "opcion1": "string breve", "opcion2": "string breve", "ganador": "1" | "2" | "empate"}
  ],
  "pros_opcion1": ["string", "string", "string"],
  "contras_opcion1": ["string", "string"],
  "pros_opcion2": ["string", "string", "string"],
  "contras_opcion2": ["string", "string"],
  "puntuacion_opcion1": 0-100,
  "puntuacion_opcion2": 0-100,
  "recomendacion": "Cuál elegir según contexto, 2-3 frases",
  "veredicto_ganador": "${a}" | "${b}" | "Empate"
}

Genera entre 5 y 8 criterios relevantes según el tipo de cosa que se compara. Sé concreto, evita relleno.`;
}

export async function compareWithGemini(opts: {
  apiKey: string;
  opcion1: string;
  opcion2: string;
  category: string;
}): Promise<ComparisonResult> {
  const { apiKey, opcion1, opcion2, category } = opts;
  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "es-ES";

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(opcion1, opcion2, category, locale) }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.error?.message || msg;
    } catch {
      /* ignore */
    }
    if (res.status === 400 && /API key/i.test(msg)) {
      throw new Error("API key inválida. Revisa tu clave en ⚙️ o en el archivo .env.");
    }
    if (res.status === 429) {
      throw new Error("Has superado el límite gratuito de Gemini. Espera un minuto o revisa tu cuota en ai.google.dev/rate-limit.");
    }
    throw new Error(msg);
  }

  const json = await res.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) throw new Error("La IA no devolvió contenido.");

  let parsed: ComparisonResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Respuesta de la IA no es JSON válido.");
    parsed = JSON.parse(match[0]);
  }
  return parsed;
}
