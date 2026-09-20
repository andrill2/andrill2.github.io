// Gera public/social.json a partir das imagens em public/clientes/<pasta>/
// Roda no build (antes do vite build) para que o site estático (Netlify) tenha a lista.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const baseDir = path.join(root, "public", "clientes");
const outFile = path.join(root, "public", "social.json");

const META = {
  "dh-law": { label: "DH Law", segment: "Advocacia" },
  "grupo-casco": { label: "Grupo Casco", segment: "Comércio Exterior & Logística" },
  "lavoutique": { label: "Lavoutique", segment: "Lavanderia & Costura" },
  "kgd-online": { label: "KGD Online", segment: "Contabilidade Online" },
  "workplay": { label: "Workplay", segment: "Coworking & Escritórios" }
};

const IMG_RE = /\.(png|jpe?g|webp|gif|avif)$/i;
const known = Object.keys(META);
const result = [];

try {
  let dirs = [];
  if (fs.existsSync(baseDir)) {
    dirs = fs
      .readdirSync(baseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }
  const ordered = [...known.filter((k) => dirs.includes(k)), ...dirs.filter((d) => !known.includes(d))];
  for (const dir of ordered) {
    const meta = META[dir] || { label: dir, segment: "" };
    const full = path.join(baseDir, dir);
    const images = fs
      .readdirSync(full)
      .filter((f) => IMG_RE.test(f))
      .sort()
      .map((f) => `/clientes/${dir}/${encodeURIComponent(f)}`);
    result.push({ id: dir, label: meta.label, segment: meta.segment, images });
  }
} catch (e) {
  console.error("gen-social: erro ao ler pastas:", e);
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2), "utf8");
const total = result.reduce((n, c) => n + c.images.length, 0);
console.log(`gen-social: ${result.length} pastas, ${total} imagens -> public/social.json`);
