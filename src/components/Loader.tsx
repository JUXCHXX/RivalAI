import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = [
  "ANALIZANDO OPCIONES",
  "CONSULTANDO IA",
  "PROCESANDO DATOS",
  "PESANDO CRITERIOS",
  "DICTANDO VEREDICTO",
];

export function Loader() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 1300);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="brutal p-8 sm:p-12 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 stripes" />
      <div className="absolute bottom-0 left-0 right-0 h-2 stripes" />

      <div className="flex items-center gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-4 w-4 bg-foreground"
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="font-mono text-xs sm:text-sm tracking-[0.3em] text-foreground"
      >
        {phrases[idx]}…
      </motion.p>
    </div>
  );
}
