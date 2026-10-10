import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Sisipkan CSS entry langsung ke HTML saat build agar tidak menjadi render-blocking request.
const inlineEntryCss = () => ({
  name: "inline-entry-css",
  apply: "build",
  enforce: "post",
  transformIndexHtml: {
    order: "post",
    handler(html, { bundle }) {
      return html.replace(
        /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
        (tag, href) => {
          const key = Object.keys(bundle).find((name) => href.endsWith(name));
          if (!key) return tag;
          const css = String(bundle[key].source);
          delete bundle[key];
          return `<style>${css}</style>`;
        }
      );
    },
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(), tailwindcss(), inlineEntryCss()],
    server: {
      port: Number(env.APP_PORT) || 3000,
    },
    preview: {
      port: Number(env.APP_PORT) || 3000,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: [
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
