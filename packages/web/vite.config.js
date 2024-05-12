/** @type {import('vite').UserConfig} */
export default {
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id, meta) {
          if (id.includes("monaco")) {
            return "monaco";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  plugins: [
    {
      name: "reload",
      handleHotUpdate({ server }) {
        server.hot.send({ type: "full-reload" });
        return [];
      },
    },
  ],
};
