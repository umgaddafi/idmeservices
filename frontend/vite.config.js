import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = (env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000").replace(/\/$/, "");

  return {
    base: "/app/",
    plugins: [react()],
    build: {
      outDir: "../app",
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
    },
  };
});
