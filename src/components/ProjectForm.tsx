import React, { useState } from "react";
import { X, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { Project } from "../types";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: (newProject: Project) => void;
}

const PRESET_IMAGES = [
  {
    name: "Velocity Capture",
    url: "https://i.ibb.co/XkF49cX1/ela-correndo-atras-de-alguem-202606201102.jpg"
  },
  {
    name: "Super Rebrand",
    url: "https://i.ibb.co/n8NPBPNV/troque-super-feirao-por-super-202606201105.jpg"
  },
  {
    name: "Architectural Beam",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL7h32KsXfGlKCiQ1NXt9wI7_-q0tpfPFC7s8dVUghkN-P_7KUxx8xKrcU5Lo233WfuKSo7V3WNVXIhSMDaXCszCAWog_r307bvFmGcY1KbWI85W4mkuFJI7YmGkfpZcErmEJE4M_cDEaXNh0-jwKz9I0LpL1C7zdsJAthbMha2aRvD-DeNxENDyVlxcA0zNzBWFssFdzarZH1YuwBMoD-KZMRUbb0r7bDe1oRjmCMRgP_sk5cr0aNrpjfUGz-LqeFPtWypEtX3UCq"
  },
  {
    name: "Book Print System",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu2cs_EoB2Op5dLf7m8WBS5mFlVWi-vPSHpNsK-rPaOf-3uueZW9qlubsBTufrAuE_cxMYDrGaQVn5AYG6oltPI-W-ZWJ12bewStgLx1Xc_s72CKXX4xZ6iWb9AFuIpOatFryprksQDGQer59klzf98CU6UvCtd9RjE7biX1Ktu6jhUIfCKbAT63DJlGwfY6itnyVyhq3NPIbMiTPEgsMiAATDdXOkXHZMUNEyh8WSqPsibSDxj96RHHKN6Oa1Yc7aL4e3_Nz7DsaX"
  }
];

export default function ProjectForm({ isOpen, onClose, onProjectAdded }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [year, setYear] = useState("2026");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectPreset = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !imageUrl) {
      setError("Por favor, preencha o Nome, Categoria e forneça uma URL da Imagem.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tags = techInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          subtitle: subtitle || `Apresentação de ${category}`,
          imageUrl,
          altText: altText || `Layout editorial personalizado de ${title}`,
          year,
          description: description || "Conceito criativo personalizado no painel do Andrïl.",
          tech: tags.length > 0 ? tags : [category]
        }),
      });

      if (res.ok) {
        const data: Project = await res.json();
        onProjectAdded(data);
        
        // Reset Form
        setTitle("");
        setCategory("Web");
        setSubtitle("");
        setImageUrl("");
        setAltText("");
        setYear("2026");
        setDescription("");
        setTechInput("");
        onClose();
      } else {
        const text = await res.text();
        setError(`Falha ao criar projeto: ${text}`);
      }
    } catch (err: any) {
      setError(`Erro de rede: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/35 backdrop-blur-md transition-opacity"
      ></div>

      {/* Content - Glassmorphic light mockup */}
      <div className="relative w-full max-w-xl bg-[#FAF6F0]/95 backdrop-blur-2xl border border-stone-200 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh] z-10 p-8 md:p-10 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-200">
            <h3 className="font-serif text-2.5xl font-black uppercase tracking-tight text-brand-text-primary">Adicionar Projeto</h3>
            <button 
              onClick={onClose}
              className="p-2 border border-stone-200 text-brand-text-secondary hover:text-brand-text-primary hover:bg-stone-50 transition-all rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg font-sans">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Title */}
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D6754D] font-extrabold font-sans">Nome do Projeto *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Soleil Identidade"
                  required
                  className="bg-transparent border-b border-stone-300 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans text-sm"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Categoria de Foco</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white border border-stone-200 p-3 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors font-sans text-xs mt-1 rounded-lg"
                >
                  <option value="Web">Web (Sites / Interface)</option>
                  <option value="3D">3D (Modelagem / Render)</option>
                  <option value="Motion">Motion (Animação)</option>
                  <option value="Ilustração">Ilustração (Arte Digital)</option>
                  <option value="Embalagem">Embalagem (Branding)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subtitle */}
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Subtítulo</label>
                <input 
                  type="text" 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Monografia de Marca / Design"
                  className="bg-transparent border-b border-stone-300 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans text-sm"
                />
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Ano de Lançamento</label>
                <input 
                  type="text" 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="bg-transparent border-b border-stone-300 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans text-sm"
                />
              </div>
            </div>

            {/* Image URL with Preset option */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D6754D] font-extrabold">URL da Imagem de Origem *</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Cole o link direto HTTPS da imagem"
                required
                className="bg-white border border-stone-200 p-3 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors font-sans text-xs rounded-lg shadow-sm"
              />
              <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
                <div className="font-sans text-[9px] text-brand-text-secondary uppercase tracking-[0.2em] font-extrabold mb-3 flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-brand-tangerine" />
                  Ou Use Amostras de Design Pré-carregadas
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_IMAGES.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`text-[10px] px-3 py-1.5 border transition-all rounded-lg cursor-pointer ${
                        imageUrl === preset.url 
                          ? 'border-brand-tangerine bg-brand-tangerine/10 text-brand-tangerine font-bold' 
                          : 'border-stone-200 text-brand-text-secondary hover:border-stone-300 hover:text-brand-text-primary'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Núcleo Estético (Descrição)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Detalhes do alinhamento criativo..."
                className="bg-white border border-stone-200 p-3 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans text-sm resize-none rounded-lg shadow-sm"
              />
            </div>

            {/* Tech Tags */}
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Ferramentas Criativas (Separadas por vírgula)</label>
              <input 
                type="text" 
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Ex: Blender, Figma, Tailwind"
                className="bg-transparent border-b border-stone-300 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans text-sm"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-stone-300 hover:border-stone-400 text-brand-text-secondary py-3 text-xs uppercase tracking-widest font-bold transition-all rounded-[20px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-tangerine hover:bg-brand-tangerine-hover text-white py-3 font-sans text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 transition-all rounded-[20px] shadow-lg shadow-brand-tangerine/10 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                Publicar Projeto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
