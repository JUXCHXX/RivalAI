# RivalAI ⚡

Comparador universal potenciado por Google Gemini. Dos opciones, una IA, un veredicto.

## 🚀 Stack

- React 19 + TanStack Start (Vite 7)
- Tailwind CSS v4
- Framer Motion
- Google Gemini 2.0 Flash

## 🔧 Setup local

```bash
# 1. Instala dependencias
npm install      # o bun install / pnpm install

# 2. Crea tu .env (copia el ejemplo)
cp .env.example .env

# 3. Añade tu GEMINI API KEY (https://aistudio.google.com/app/apikey)
#    Edita .env y pega la key en VITE_GEMINI_API_KEY

# 4. Arranca el dev server
npm run dev
```

Abre http://localhost:3000

## 🔐 Sobre la API Key

La app soporta DOS fuentes de key (en este orden de prioridad):

1. **`VITE_GEMINI_API_KEY`** del archivo `.env` — usada automáticamente si está definida.
2. **localStorage del navegador** — el usuario la introduce desde el botón ⚙ de la cabecera.

> ⚠️ **Importante para producción**: Las variables `VITE_*` se incluyen en el bundle del navegador, por lo que **cualquier visitante puede leerlas en DevTools**. Para una app pública real, deberías:
>
> - Crear una serverless function (en Vercel: `/api/compare.ts`) que reciba la petición del cliente.
> - Llamar a Gemini desde el server con la key como variable de entorno **sin prefijo VITE_** (ej. `GEMINI_API_KEY`).
> - Devolver la respuesta al cliente.
>
> El `.env` del repo está ignorado por git para que tu key nunca se suba.

## 🚢 Deploy en Vercel

1. Sube el repo a GitHub.
2. Importa el proyecto en Vercel.
3. En **Settings → Environment Variables**, añade:
   - `VITE_GEMINI_API_KEY` = tu key
4. Deploy.

## 📦 Scripts

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run start` — sirve el build

## 📝 Licencia

MIT
