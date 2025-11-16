import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables here
  const env = loadEnv(mode, process.cwd(), "");
  const isOffline = env.DEBUG_OFFLINE === "True";
  const target = isOffline ? "http://localhost:8000" : "http://backend:8000";
  // const target = isOffline ? "http://localhost:8001" : "http://backend:8000";

  return {
    base: '/',
    server: {
      historyApiFallback: true,
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: [
        'myflipit.live',
        'www.myflipit.live',
        'localhost',
        '127.0.0.1',
      ],
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
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

