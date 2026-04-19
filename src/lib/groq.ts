import type { ComparisonResult } from "./storage";

const ENV_KEY = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim() || "";
const MODEL = (import.meta.env.VITE_GROQ_MODEL as string | undefined)?.trim() || "llama-3.3-70b-versatile";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

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

export async function compareWithGroq(opts: {
  apiKey: string;
  opcion1: string;
  opcion2: string;
  category: string;
}): Promise<ComparisonResult> {
  const { apiKey, opcion1, opcion2, category } = opts;
  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "es-ES";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: buildPrompt(opcion1, opcion2, category, locale),
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      n: 1,
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
    if (res.status === 401 || res.status === 403 || /API key/i.test(msg)) {
      throw new Error("API key inválida. Revisa tu clave en ⚙️ o en el archivo .env.");
    }
    if (res.status === 429) {
      throw new Error("Has superado el límite de la API Groq. Intenta de nuevo más tarde o revisa tu cuota.");
    }
    throw new Error(msg);
  }

  const json = await res.json();
  const message = json?.choices?.[0]?.message;
  let text = "";

  if (typeof message?.content === "string") {
    text = message.content;
  } else if (Array.isArray(message?.content)) {
    const firstPart = message.content.find((part: any) => typeof part?.text === "string");
    text = firstPart?.text ?? "";
  } else if (typeof message?.content?.text === "string") {
    text = message.content.text;
  }

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
