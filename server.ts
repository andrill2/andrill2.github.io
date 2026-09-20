import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { projects as initialProjects } from "./src/data/projects";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Fonte única dos projetos: src/data/projects.ts (embutido no build estático).
// Aqui só mantemos uma cópia mutável em memória para o dev local (aceita POST do formulário).
let projects: any[] = [...initialProjects];

// In-Memory Database for Inquiries / Project Briefs
let inquiries: any[] = [];

// Lazy initialize Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or left as placeholder in environment variables.");
      return null;
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// REST APIs
// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1.5. NVIDIA Agent Router
app.post("/api/agent/generate", async (req, res) => {
  const apiKey = process.env.NVAPI_KEY;
  if (!apiKey || apiKey === "MY_NVAPI_KEY") {
    return res.status(500).json({
      error: "NVAPI_KEY is not configured. Add your NVIDIA Integrate key to a local .env file."
    });
  }

  const { messages, model = "google/diffusiongemma-26b-a4b-it", temperature = 1.0, top_p = 0.95 } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty messages array." });
  }

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4096,
        temperature,
        top_p,
        stream: false,
        chat_template_kwargs: { enable_thinking: true },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("Error calling NVIDIA Integrate API:", error);
    res.status(500).json({ error: error.message || "NVIDIA Integrate request failed." });
  }
});

// 2. Projects Router
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

app.post("/api/projects", (req, res) => {
  const { title, category, subtitle, imageUrl, altText, year, description, tech, link } = req.body;
  if (!title || !category || !imageUrl) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes: título, categoria, imageUrl" });
  }

  const newProj = {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    category,
    subtitle: subtitle || category,
    imageUrl,
    altText: altText || `Visual conceitual do projeto ${title}`,
    year: year || new Date().getFullYear().toString(),
    description: description || "Peça de portfólio customizada criada ao vivo na plataforma STUDIO.",
    tech: Array.isArray(tech) ? tech : [category],
    link: link || undefined,
    isCustom: true
  };

  projects.push(newProj);
  res.status(201).json(newProj);
});

// 2.5. Social Media Router — lê automaticamente as imagens de public/clientes/<marca>/
// Basta o Andril jogar os posts nas pastas; elas aparecem sozinhas no site.
const SOCIAL_META: Record<string, { label: string; segment: string }> = {
  "dh-law": { label: "DH Law", segment: "Advocacia" },
  "grupo-casco": { label: "Grupo Casco", segment: "Comércio Exterior & Logística" },
  "lavoutique": { label: "Lavoutique", segment: "Lavanderia & Costura" },
  "kgd-online": { label: "KGD Online", segment: "Contabilidade Online" },
  "workplay": { label: "Workplay", segment: "Coworking & Escritórios" }
};

app.get("/api/social", (req, res) => {
  const baseDir =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "clientes")
      : path.join(process.cwd(), "public", "clientes");
  const IMG_RE = /\.(png|jpe?g|webp|gif|avif)$/i;
  const known = Object.keys(SOCIAL_META);
  const result: any[] = [];

  try {
    let extra: string[] = [];
    if (fs.existsSync(baseDir)) {
      extra = fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((d) => !known.includes(d));
    }
    for (const dir of [...known, ...extra]) {
      const meta = SOCIAL_META[dir] || { label: dir, segment: "" };
      const full = path.join(baseDir, dir);
      let images: string[] = [];
      if (fs.existsSync(full)) {
        images = fs
          .readdirSync(full)
          .filter((f) => IMG_RE.test(f))
          .sort()
          .map((f) => `/clientes/${dir}/${encodeURIComponent(f)}`);
      }
      result.push({ id: dir, label: meta.label, segment: meta.segment, images });
    }
  } catch (e) {
    console.error("Erro lendo pastas de redes sociais:", e);
  }

  res.json(result);
});

// 3. Inquiries Router
app.get("/api/inquiries", (req, res) => {
  res.json(inquiries);
});

app.post("/api/inquiries", async (req, res) => {
  const { clientName, email, service, budget, brief } = req.body;
  if (!clientName || !email || !brief) {
    return res.status(400).json({ error: "Client Name, Email, and Brief are required." });
  }

  const newInquiry: any = {
    id: `inq_${Math.random().toString(36).substr(2, 9)}`,
    clientName,
    email,
    service: service || "Editorial Architecture/Digital Design",
    budget: budget || "Not specified",
    brief,
    timestamp: new Date().toISOString(),
    status: "Pending"
  };

  // Executa análise de IA em segundo plano se a chave API estiver configurada
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analise o briefing do projeto de design a seguir para o nosso estúdio de alta costura digital e retorne SEMPRE as respostas em português do Brasil:
1. Interpretação executiva do desafio de design (em um estilo de crítica editorial refinada e elegante).
2. Paleta de Cores sugerida (3 a 4 cores refinadas com valores HEX e descrições semânticas criativas correspondentes ao minimalismo de luxo).
3. Linha do Tempo estimada de trabalho (descrição das fases de desenvolvimento do estúdio).

Detalhes do Briefing:
- Nome do Cliente: ${clientName}
- Categoria de Desconto/Orçamento: ${budget}
- Serviço Solicitado: ${service}
- Briefing do Cliente: ${brief}

Você DEVE retornar um JSON correspondente exatamente a esta estrutura:
{
  "analysis": "descrição detalhada em português sobre o desafio de design, alma do projeto e abordagem conceitual sugerida",
  "palette": [
    {"name": "Areia Terrosa", "hex": "#e5d5c5"},
    {"name": "Carvão Sutil", "hex": "#212121"}
  ],
  "timeline": "texto curto em português explicando o cronograma de fases propostas"
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              palette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING }
                  },
                  required: ["name", "hex"]
                }
              },
              timeline: { type: Type.STRING }
            },
            required: ["analysis", "palette", "timeline"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        newInquiry.aiAnalysis = parsed.analysis;
        newInquiry.aiColorPalette = parsed.palette;
        newInquiry.aiTimeline = parsed.timeline;
      }
    } catch (e: any) {
      console.error("Erro na análise do Gemini:", e);
      newInquiry.aiAnalysis = `Falha ao processar análise do Gemini: ${e.message || e}`;
    }
  } else {
    // Retorna um feedback simulado de alta fidelidade em português brasileiro se a chave estiver vazia
    newInquiry.aiAnalysis = `Analisamos seu briefing: "${brief.substring(0, 100)}..." como uma incrível oportunidade criativa. Nossos diretores de arte sugerem assimetria editorial elegante combinada com farto uso de espaços negativos. Configure sua GEMINI_API_KEY nas Secrets para obter briefings ricos processados por inteligência artificial em tempo real.`;
    newInquiry.aiColorPalette = [
      { name: "Naval Profundo", hex: "#0A1128" },
      { name: "Tangerina Líquida", hex: "#FF5E18" },
      { name: "Off-White Editorial", hex: "#FAF6F0" }
    ];
    newInquiry.aiTimeline = "Fase 1: Alinhamento Abstrato e Conceito (2 semanas) / Fase 2: Prototipagem Fluida de Alta Fidelidade (3 semanas) / Fase 3: Entrega do Brand Book (1 semana)";
  }

  inquiries.push(newInquiry);
  res.status(201).json(newInquiry);
});

// Setup Vite & Static Files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server serving on http://localhost:${PORT}`);
  });
}

startServer();
