import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'path';
import {defineConfig} from 'vite';

const servicePages = [
  {path: '/servicos/', title: 'Serviços — Andrïl Esteves', description: 'Motion, direção de arte, identidade visual, 3D, CGI e criação de sites para marcas, agências e estúdios.'},
  {path: '/servicos/motion-video/', title: 'Motion & Vídeo — Andrïl Esteves', description: 'Motion design, edição, pós-produção, VFX e vídeos de campanha para marcas, agências e estúdios.'},
  {path: '/servicos/branding-identidade/', title: 'Branding & Identidade — Andrïl Esteves', description: 'Identidade visual, direção de arte, sistemas de marca e campanhas construídos com presença e consistência.'},
  {path: '/servicos/3d-cgi/', title: '3D & CGI — Andrïl Esteves', description: 'CGI, animação 3D e sistemas procedurais para produtos, campanhas e experiências visuais.'},
  {path: '/servicos/criacao-de-sites/', title: 'Criação de Sites — Andrïl Esteves', description: 'Sites, landing pages e experiências digitais que combinam design, movimento e código.'},
];

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const staticServicePagesPlugin = {
  name: 'static-service-pages',
  apply: 'build' as const,
  async closeBundle() {
    const outputDir = path.resolve(__dirname, 'dist');
    const template = await readFile(path.join(outputDir, 'index.html'), 'utf8');

    for (const page of servicePages) {
      const canonical = `https://andril.space${page.path}`;
      const title = escapeHtml(page.title);
      const description = escapeHtml(page.description);
      const html = template
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
        .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
        .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
        .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
        .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
        .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);
      const routeDir = path.join(outputDir, ...page.path.split('/').filter(Boolean));
      await mkdir(routeDir, {recursive: true});
      await writeFile(path.join(routeDir, 'index.html'), html);
    }
  },
};

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), staticServicePagesPlugin],
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
          : { ignored: ['**/public/clientes/**', '**/dist-qa/**', '**/dist-qa-*/**'] },
    },
  };
});
