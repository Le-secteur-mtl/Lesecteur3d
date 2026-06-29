import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
    cors: true
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          react: ["react", "react-dom"]
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei", "gsap"]
  }
});
