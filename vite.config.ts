import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables here
  const env = loadEnv(mode, process.cwd(), "");
  const isOffline = env.DEBUG_OFFLINE === "True";
  const target = isOffline ? "http://localhost:8000" : "http://backend:8000";

  return {
    base: '/app/',
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/auth': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});