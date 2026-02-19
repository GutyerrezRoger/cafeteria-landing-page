import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Explicando o código: Aqui dizemos ao nosso "motor" (Vite) para usar
// o React e também para compilar o Tailwind de forma super rápida.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
