import { motion } from "framer-motion";

export function VsBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "lg"
      ? "h-28 w-28 text-5xl"
      : size === "sm"
        ? "h-12 w-12 text-xl"
        : "h-20 w-20 text-3xl";
  return (
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 220, damping: 12 }}
      className={`${dim} relative shrink-0 flex items-center justify-center font-display text-ink animate-vs-throb`}
      style={{
        background: "var(--acid)",
        border: "3px solid var(--foreground)",
        boxShadow: "var(--shadow-brutal)",
      }}
      aria-hidden
    >
      <span className="relative z-10 leading-none">VS</span>
    </motion.div>
  );
}
