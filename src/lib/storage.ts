export type ComparisonResult = {
  resumen: string;
  criterios: Array<{
    nombre: string;
    opcion1: string;
    opcion2: string;
    ganador: "1" | "2" | "empate";
  }>;
  pros_opcion1: string[];
  contras_opcion1: string[];
  pros_opcion2: string[];
  contras_opcion2: string[];
  puntuacion_opcion1: number;
  puntuacion_opcion2: number;
  recomendacion: string;
  veredicto_ganador: string;
};

export type HistoryEntry = {
  id: string;
  opcion1: string;
  opcion2: string;
  category: string;
  createdAt: number;
  result: ComparisonResult;
};

const KEY_HISTORY = "rivalai.history";

export const storage = {
  getHistory(): HistoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KEY_HISTORY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
    } catch {
      return [];
    }
  },
  pushHistory(entry: HistoryEntry) {
    const list = storage.getHistory();
    const next = [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, 20);
    localStorage.setItem(KEY_HISTORY, JSON.stringify(next));
  },
  clearHistory() {
    localStorage.removeItem(KEY_HISTORY);
  },
};
