import { motion } from "framer-motion";
import type { ComparisonResult } from "@/lib/storage";

function ScoreBar({
  value,
  side,
  delay = 0,
}: {
  value: number;
  side: "left" | "right";
  delay?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const color = side === "left" ? "var(--cyan-glow)" : "var(--violet-glow)";
  return (
    <div className="w-full">
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
        <span>SCORE</span>
        <span className="font-display text-2xl text-foreground leading-none">
          {v}
          <span className="text-muted-foreground text-sm">/100</span>
        </span>
      </div>
      <div className="h-4 border-2 border-foreground bg-background relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function ProsCons({ pros, contras }: { pros: string[]; contras: string[] }) {
  return (
    <div className="space-y-5 mt-6">
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3 inline-block bg-success text-ink px-2 py-0.5">
          ✚ PROS
        </h4>
        <ul className="space-y-2">
          {pros.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-snug">
              <span className="font-mono text-success font-bold shrink-0">+</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3 inline-block bg-destructive text-foreground px-2 py-0.5">
          ✕ CONTRAS
        </h4>
        <ul className="space-y-2">
          {contras.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-snug text-muted-foreground">
              <span className="font-mono text-destructive font-bold shrink-0">−</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ResultView({
  result,
  opcion1,
  opcion2,
  onReset,
}: {
  result: ComparisonResult;
  opcion1: string;
  opcion2: string;
  onReset: () => void;
}) {
  const handleCopy = async () => {
    const txt = `${opcion1} vs ${opcion2}\n\n${result.resumen}\n\nVeredicto: ${result.veredicto_ganador}\n${opcion1}: ${result.puntuacion_opcion1}/100\n${opcion2}: ${result.puntuacion_opcion2}/100\n\n${result.recomendacion}`;
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      /* noop */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Mega VS header */}
      <div className="brutal p-6 sm:p-10 relative overflow-hidden grain">
        <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          ▸ RESULTADO #{Date.now().toString().slice(-4)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-6 mt-6">
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 120 }}
            className="text-center sm:text-right"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-2">
              OPCIÓN 01
            </div>
            <div className="font-display text-3xl sm:text-5xl lg:text-6xl text-primary break-words">
              {opcion1}
            </div>
          </motion.div>

          <div className="flex justify-center">
            <div
              className="font-display text-6xl sm:text-7xl px-4"
              style={{
                color: "var(--acid)",
                textShadow: "4px 4px 0 var(--foreground)",
              }}
            >
              VS
            </div>
          </div>

          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 120 }}
            className="text-center sm:text-left"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-secondary mb-2">
              OPCIÓN 02
            </div>
            <div className="font-display text-3xl sm:text-5xl lg:text-6xl text-secondary break-words">
              {opcion2}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resumen */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="brutal-paper p-6 sm:p-8 relative"
      >
        <div className="absolute -top-3 left-6 bg-foreground text-background font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1">
          RESUMEN
        </div>
        <p className="text-base sm:text-xl leading-snug font-medium pt-1">“{result.resumen}”</p>
      </motion.div>

      {/* Score columns */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="brutal brutal-cyan p-6 sm:p-7"
        >
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="font-display text-2xl sm:text-3xl text-primary truncate">{opcion1}</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
              01
            </span>
          </div>
          <div className="h-px bg-foreground/30 my-3" />
          <ScoreBar value={result.puntuacion_opcion1} side="left" delay={0.5} />
          <ProsCons pros={result.pros_opcion1} contras={result.contras_opcion1} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="brutal brutal-violet p-6 sm:p-7"
        >
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="font-display text-2xl sm:text-3xl text-secondary truncate">{opcion2}</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
              02
            </span>
          </div>
          <div className="h-px bg-foreground/30 my-3" />
          <ScoreBar value={result.puntuacion_opcion2} side="right" delay={0.6} />
          <ProsCons pros={result.pros_opcion2} contras={result.contras_opcion2} />
        </motion.div>
      </div>

      {/* Criteria table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="brutal p-0 overflow-hidden"
      >
        <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between">
          <h3 className="font-display text-lg sm:text-xl">▸ COMPARACIÓN DETALLADA</h3>
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
            {result.criterios.length} CRITERIOS
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b-2 border-foreground">
                <th className="text-left px-4 py-3">CRITERIO</th>
                <th className="text-left px-4 py-3 text-primary">{opcion1}</th>
                <th className="text-left px-4 py-3 text-secondary">{opcion2}</th>
                <th className="text-center px-4 py-3 w-20">WIN</th>
              </tr>
            </thead>
            <tbody>
              {result.criterios.map((c, i) => (
                <tr
                  key={i}
                  className="border-t border-foreground/30 hover:bg-foreground/5 transition"
                >
                  <td className="px-4 py-3 font-display text-base uppercase">{c.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.opcion1}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.opcion2}</td>
                  <td className="px-4 py-3 text-center">
                    {c.ganador === "1" && (
                      <span className="inline-block bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-foreground">
                        01 ✓
                      </span>
                    )}
                    {c.ganador === "2" && (
                      <span className="inline-block bg-secondary text-secondary-foreground font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-foreground">
                        02 ✓
                      </span>
                    )}
                    {c.ganador === "empate" && (
                      <span className="inline-block bg-muted font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-foreground">
                        EMPATE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="brutal p-0 overflow-hidden relative"
      >
        <div className="stripes h-4" />
        <div className="p-6 sm:p-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-acid mb-3">
            ▸ VEREDICTO FINAL
          </div>
          <div className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[0.9] mb-5">
            <span className="text-gradient-vs">{result.veredicto_ganador}</span>
            <span className="text-foreground"> .</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed max-w-3xl text-muted-foreground">
            {result.recomendacion}
          </p>
        </div>
        <div className="stripes h-4" />
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center pt-2">
        <button
          onClick={onReset}
          className="brutal-hover px-7 py-4 font-display text-base tracking-widest bg-acid text-ink border-2 border-foreground"
          style={{ boxShadow: "var(--shadow-brutal-sm)" }}
        >
          ⚡ NUEVA COMPARACIÓN
        </button>
        <button
          onClick={handleCopy}
          className="brutal-hover px-7 py-4 font-display text-base tracking-widest bg-background text-foreground border-2 border-foreground"
          style={{ boxShadow: "var(--shadow-brutal-sm)" }}
        >
          ▸ COPIAR
        </button>
      </div>
    </motion.div>
  );
}
