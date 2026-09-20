import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // Ignora a pasta de posts de clientes: são assets soltos (imagens grandes que o Andril
      // copia manualmente) e não precisam de HMR. Vigiá-los quebrava o server com EBUSY
      // quando um arquivo ainda estava sendo copiado.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : { ignored: ['**/public/clientes/**'] },
    },
  };
});
