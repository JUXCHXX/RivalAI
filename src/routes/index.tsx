import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Loader } from "@/components/Loader";
import { ResultView } from "@/components/ResultView";
import { compareWithGemini } from "@/lib/gemini";
import { storage, type ComparisonResult, type HistoryEntry } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RivalAI — Compara cualquier cosa con IA" },
      {
        name: "description",
        content:
          "Compara absolutamente cualquier cosa con IA: tecnologías, productos, ideas o métodos. Decide con datos, no con dudas.",
      },
      { property: "og:title", content: "RivalAI — Compara cualquier cosa con IA" },
      {
        property: "og:description",
        content:
          "Herramienta de comparación universal potenciada por Google Gemini. Pros, contras, criterios y veredicto.",
      },
    ],
  }),
  component: HomePage,
});

const CATEGORIES = ["General", "Tecnología", "Entretenimiento", "Ciencia", "Productos", "Salud"];
const CHIPS = [
  "iPhone vs Android",
  "Python vs JavaScript",
  "Netflix vs Disney+",
  "React vs Vue",
  "Café vs Té",
  "Tesla vs Toyota",
];

const MARQUEE = [
  "COMPARA · DECIDE · GANA",
  "POTENCIADO POR GEMINI",
  "DOS OPCIONES · UN VEREDICTO",
  "SIN DUDAS · CON DATOS",
];

function parseChip(s: string): [string, string] | null {
  const m = s.split(/\s+vs\s+/i);
  if (m.length !== 2) return null;
  return [m[0].trim(), m[1].trim()];
}

function HomePage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [resultLabels, setResultLabels] = useState<{ a: string; b: string }>({ a: "", b: "" });
  const [error, setError] = useState<string | null>(null);

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const k = storage.getApiKey();
    setHasKey(Boolean(k));
    setHistory(storage.getHistory());
    // Solo abrir modal forzado si NO hay key (ni en .env ni en localStorage)
    if (!k) setKeyModalOpen(true);
  }, []);

  const canCompare = useMemo(
    () => a.trim().length > 0 && b.trim().length > 0 && !loading,
    [a, b, loading],
  );

  const handleCompare = async (overrideA?: string, overrideB?: string) => {
    const opt1 = (overrideA ?? a).trim();
    const opt2 = (overrideB ?? b).trim();
    if (!opt1 || !opt2) return;
    setError(null);

    const apiKey = storage.getApiKey();
    if (!apiKey) {
      setKeyModalOpen(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setResultLabels({ a: opt1, b: opt2 });
    if (overrideA !== undefined) setA(opt1);
    if (overrideB !== undefined) setB(opt2);

    try {
      const r = await compareWithGemini({ apiKey, opcion1: opt1, opcion2: opt2, category });
      setResult(r);
      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        opcion1: opt1,
        opcion2: opt2,
        category,
        createdAt: Date.now(),
        result: r,
      };
      storage.pushHistory(entry);
      setHistory(storage.getHistory());
      setTimeout(() => {
        document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setA("");
    setB("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChip = (chip: string) => {
    const parsed = parseChip(chip);
    if (!parsed) return;
    handleCompare(parsed[0], parsed[1]);
  };

  const handleHistoryClick = (h: HistoryEntry) => {
    setA(h.opcion1);
    setB(h.opcion2);
    setCategory(h.category);
    setResult(h.result);
    setResultLabels({ a: h.opcion1, b: h.opcion2 });
    setError(null);
    setTimeout(() => {
      document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Top marquee */}
      <div className="border-b-2 border-foreground bg-foreground text-background overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-1.5">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="font-mono text-[11px] tracking-[0.3em] px-6 inline-flex items-center gap-6">
              {t} <span className="text-acid">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between border-b-2 border-foreground">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className={`h-2 w-2 ${hasKey ? "bg-success" : "bg-destructive"}`} />
            {hasKey ? "ONLINE" : "OFFLINE"}
          </span>
          <button
            onClick={() => setKeyModalOpen(true)}
            className="brutal-hover bg-background text-foreground border-2 border-foreground px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] flex items-center gap-2"
            style={{ boxShadow: "var(--shadow-brutal-sm)" }}
            aria-label="Configuración"
          >
            ⚙ <span className="hidden sm:inline">{hasKey ? "API KEY" : "CONFIGURAR"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        {/* HERO — gigante */}
        <section className="pt-10 sm:pt-16 pb-12 relative">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-acid mb-4 flex items-center gap-3">
                  <span className="h-px w-10 bg-acid" /> N°001 · COMPARADOR UNIVERSAL
                </div>
                <h1 className="font-display text-[clamp(3rem,11vw,9rem)] leading-[0.85] tracking-tight">
                  COMPARA<br />
                  <span className="text-stroke">CUALQUIER</span>{" "}
                  <span className="bg-acid text-ink px-2 inline-block -rotate-1">COSA</span>
                  .
                </h1>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4 lg:pl-6 lg:border-l-2 lg:border-foreground"
            >
              <p className="text-base sm:text-lg leading-snug">
                Dos opciones. Una IA brutalmente honesta. Un veredicto sin ambigüedades.
                <br /><br />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  ▸ Pros · contras · criterios · score
                </span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* INPUTS — brutal arena */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="brutal p-5 sm:p-8 relative"
        >
          <div className="absolute -top-3 left-6 bg-foreground text-background font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1">
            ▸ ARENA
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-5 md:gap-6 items-stretch">
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-2">
                01 · CHALLENGER
              </div>
              <input
                value={a}
                onChange={(e) => setA(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                placeholder="Escribe aquí…"
                maxLength={80}
                className="w-full bg-background border-2 border-primary px-5 py-5 font-display text-2xl sm:text-3xl text-primary placeholder:text-primary/30 focus:outline-none focus:bg-primary focus:text-primary-foreground transition uppercase"
                style={{ boxShadow: "6px 6px 0 0 var(--cyan-glow)" }}
              />
            </div>

            <div className="flex items-center justify-center md:py-6">
              <div
                className="font-display text-5xl sm:text-6xl px-3"
                style={{ color: "var(--acid)", textShadow: "3px 3px 0 var(--foreground)" }}
              >
                VS
              </div>
            </div>

            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-secondary mb-2 md:text-right">
                02 · CONTENDER
              </div>
              <input
                value={b}
                onChange={(e) => setB(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                placeholder="Escribe aquí…"
                maxLength={80}
                className="w-full bg-background border-2 border-secondary px-5 py-5 font-display text-2xl sm:text-3xl text-secondary placeholder:text-secondary/30 focus:outline-none focus:bg-secondary focus:text-secondary-foreground transition uppercase"
                style={{ boxShadow: "6px 6px 0 0 var(--violet-glow)" }}
              />
            </div>
          </div>

          {/* Category strip + button */}
          <div className="mt-7 flex flex-col lg:flex-row gap-5 lg:items-end lg:justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                ▸ CATEGORÍA
              </div>
              <div className="flex flex-wrap gap-0 border-2 border-foreground inline-flex">
                {CATEGORIES.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 sm:px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition ${
                      i > 0 ? "border-l-2 border-foreground" : ""
                    } ${
                      category === c
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleCompare()}
              disabled={!canCompare}
              className="brutal-hover bg-acid text-ink font-display text-xl sm:text-2xl tracking-wider px-8 py-5 border-2 border-foreground disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 self-start lg:self-auto"
              style={{ boxShadow: "var(--shadow-brutal)" }}
            >
              ⚡ COMPARAR ▸
            </button>
          </div>
        </motion.section>

        {/* Chips */}
        {!result && !loading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-muted-foreground" /> EJEMPLOS RÁPIDOS
            </div>
            <div className="flex flex-wrap gap-3">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleChip(c)}
                  className="brutal-hover bg-background text-foreground border-2 border-foreground px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-acid hover:text-ink transition"
                  style={{ boxShadow: "var(--shadow-brutal-sm)" }}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 border-2 border-destructive bg-destructive/15 px-5 py-4 font-mono text-sm flex items-start gap-3"
              style={{ boxShadow: "6px 6px 0 0 var(--destructive)" }}
            >
              <span className="text-destructive font-bold">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loader / Result */}
        <div id="result-anchor" className="mt-12">
          {loading && <Loader />}
          {result && !loading && (
            <ResultView
              result={result}
              opcion1={resultLabels.a}
              opcion2={resultLabels.b}
              onReset={handleReset}
            />
          )}
        </div>

        {/* History */}
        {history.length > 0 && !loading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-20"
          >
            <div className="flex items-end justify-between mb-5 border-b-2 border-foreground pb-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-acid mb-1">
                  ▸ ARCHIVO
                </div>
                <h2 className="font-display text-2xl sm:text-3xl">COMPARACIONES RECIENTES</h2>
              </div>
              <button
                onClick={() => {
                  storage.clearHistory();
                  setHistory([]);
                }}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition underline underline-offset-4"
              >
                Limpiar
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => handleHistoryClick(h)}
                  className="brutal-hover brutal-sm p-4 text-left group"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    #{String(history.length - i).padStart(3, "0")} · {h.category}
                  </div>
                  <div className="flex items-center gap-2 font-display text-base uppercase">
                    <span className="text-primary truncate flex-1">{h.opcion1}</span>
                    <span className="text-acid shrink-0">VS</span>
                    <span className="text-secondary truncate flex-1 text-right">{h.opcion2}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-foreground/30 font-mono text-[10px] uppercase tracking-widest flex items-center justify-between">
                    <span className="text-muted-foreground">VEREDICTO</span>
                    <span className="text-foreground truncate ml-2">▸ {h.result.veredicto_ganador}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        <footer className="mt-24 border-t-2 border-foreground pt-6 grid sm:grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <div>© RIVALAI · {new Date().getFullYear()}</div>
          <div className="sm:text-center">▸ POWERED BY GOOGLE GEMINI</div>
          <div className="sm:text-right">{storage.hasEnvKey() ? "KEY: ENV" : "KEY: LOCAL ONLY"}</div>
        </footer>
      </main>

      <ApiKeyModal
        open={keyModalOpen}
        forceOpen={!hasKey}
        onClose={() => setKeyModalOpen(false)}
        onSaved={() => setHasKey(true)}
      />
    </div>
  );
}
