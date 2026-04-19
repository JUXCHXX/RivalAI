import type { ComparisonResult } from "./storage";

const ENV_KEY = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim() || "";
const MODEL =
  (import.meta.env.VITE_GROQ_MODEL as string | undefined)?.trim() || "llama-3.3-70b-versatile";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export function getEnvApiKey() {
  return ENV_KEY;
}

function hasTextPart(value: unknown): value is { text: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

function buildPrompt(a: string, b: string, category: string, locale: string) {
  const cat = category && category !== "General" ? ` (categoria: ${category})` : "";
  return `Eres un analista experto. Compara de forma rigurosa y util "${a}" vs "${b}"${cat}.
Responde EXCLUSIVAMENTE con un JSON valido (sin markdown, sin texto extra) en el idioma "${locale}", con esta estructura EXACTA:

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
  "recomendacion": "Cual elegir segun contexto, 2-3 frases",
  "veredicto_ganador": "${a}" | "${b}" | "Empate"
}

Genera entre 5 y 8 criterios relevantes segun el tipo de cosa que se compara. Se concreto, evita relleno.`;
}

export async function compareWithGroq(opts: {
  opcion1: string;
  opcion2: string;
  category: string;
}): Promise<ComparisonResult> {
  const { opcion1, opcion2, category } = opts;
  const locale = (typeof navigator !== "undefined" && navigator.language) || "es-ES";

  if (!ENV_KEY) {
    throw new Error("Falta VITE_GROQ_API_KEY en el archivo .env del proyecto.");
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV_KEY}`,
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
      throw new Error(
        "API key invalida. Revisa VITE_GROQ_API_KEY en el archivo .env del proyecto.",
      );
    }
    if (res.status === 429) {
      throw new Error(
        "Has superado el limite de la API Groq. Intenta de nuevo mas tarde o revisa tu cuota.",
      );
    }
    throw new Error(msg);
  }

  const json = await res.json();
  const message = json?.choices?.[0]?.message;
  let text = "";

  if (typeof message?.content === "string") {
    text = message.content;
  } else if (Array.isArray(message?.content)) {
    const firstPart = message.content.find(hasTextPart);
    text = firstPart?.text ?? "";
  } else if (hasTextPart(message?.content)) {
    text = message.content.text;
  }

  if (!text) throw new Error("La IA no devolvio contenido.");

  let parsed: ComparisonResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Respuesta de la IA no es JSON valido.");
    parsed = JSON.parse(match[0]);
  }

  return parsed;
}
