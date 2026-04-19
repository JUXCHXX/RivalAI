import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storage } from "@/lib/storage";

export function ApiKeyModal({
  open,
  onClose,
  onSaved,
  forceOpen = false,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  forceOpen?: boolean;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const envKey = storage.hasEnvKey();

  useEffect(() => {
    if (open) setValue(envKey ? "" : storage.getApiKey());
  }, [open, envKey]);

  const handleSave = () => {
    if (!value.trim()) return;
    storage.setApiKey(value);
    onSaved();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm"
          onClick={() => !forceOpen && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="brutal w-full max-w-lg p-6 sm:p-8 relative"
          >
            <div className="absolute -top-3 -left-3 bg-acid text-ink px-3 py-1 font-display text-xs tracking-widest border-2 border-foreground">
              CONFIG
            </div>

            <h2 className="font-display text-3xl sm:text-4xl mt-2">
              CONECTA<br />TU IA.
            </h2>
            <p className="text-sm text-muted-foreground mt-3 mb-5">
              {envKey ? (
                <>
                  Estás usando la key del archivo <code className="font-mono text-foreground">.env</code>.
                  Puedes sobrescribirla aquí solo en este navegador.
                </>
              ) : (
                <>
                  Pega tu API Key de Groq. Se guarda <strong className="text-foreground">solo en tu navegador</strong> (localStorage).
                </>
              )}
            </p>

            <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              ▸ GROQ API KEY
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-background border-2 border-foreground px-4 py-3 pr-20 text-sm font-mono focus:outline-none focus:bg-foreground focus:text-background transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-foreground hover:bg-foreground hover:text-background transition"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-xs font-mono uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-acid transition"
            >
              → Obtener API Key gratis
            </a>

            <div className="mt-7 flex gap-3 justify-end">
              {!forceOpen && (
                <button
                  onClick={onClose}
                  className="px-4 py-3 font-mono text-xs uppercase tracking-widest border-2 border-foreground hover:bg-foreground hover:text-background transition"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!value.trim()}
                className="brutal-hover px-6 py-3 font-display text-sm tracking-widest bg-acid text-ink border-2 border-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ boxShadow: "var(--shadow-brutal-sm)" }}
              >
                GUARDAR ▸
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
