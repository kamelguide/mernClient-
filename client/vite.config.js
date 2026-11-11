import { defineConfig } from "vite";

// Let Vite's built-in esbuild transform JSX using React 18's automatic runtime.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
});
