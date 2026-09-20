import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Calendar, ClipboardCheck, Palette } from "lucide-react";
import { Inquiry } from "../types";

interface InquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInquirySubmitted?: (newInquiry: Inquiry) => void;
}

export default function InquiryDrawer({ isOpen, onClose, onInquirySubmitted }: InquiryDrawerProps) {
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Layout Editorial de E-Commerce");
  const [budget, setBudget] = useState("$25K - $50K");
  const [brief, setBrief] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [latestReport, setLatestReport] = useState<Inquiry | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Clear state on open
  useEffect(() => {
    if (isOpen) {
      setCopySuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !email || !brief) return;

    setLoading(true);
    setLatestReport(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          email,
          service,
          budget,
          brief
        })
      });

      if (res.ok) {
        const data: Inquiry = await res.json();
        setLatestReport(data);
        if (onInquirySubmitted) {
          onInquirySubmitted(data);
        }
        // Save to client's temporary brief list too
        const history = JSON.parse(localStorage.getItem("studio_brief_history") || "[]");
        localStorage.setItem("studio_brief_history", JSON.stringify([data, ...history]));
      } else {
        console.error("Submission failed");
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!latestReport) return;
    const shareText = `
Relatório de Consultoria Criativa · Andrïl Esteves
=====================================
Cliente: ${latestReport.clientName}
Serviço Solicitado: ${latestReport.service}
Estratégia Proposta:
${latestReport.aiAnalysis}

Paleta de Cores Sugerida:
${latestReport.aiColorPalette?.map(c => `- ${c.name}: ${c.hex}`).join("\n")}

Cronograma de Produção Estimado:
${latestReport.aiTimeline}
=====================================
    `;
    navigator.clipboard.writeText(shareText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-md transition-opacity"
      ></div>

      {/* Drawer Body - Glassmorphic light theme */}
      <div className="relative w-full max-w-2xl bg-[#F9F7F2]/95 backdrop-blur-2xl h-full border-l border-stone-200/50 shadow-[rgba(13,13,13,0.15)_0px_0px_50px_10px] flex flex-col justify-between z-10 overflow-y-auto">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-10 pb-6 border-b border-stone-200">
            <div>
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-tangerine font-bold">Andrïl &bull; IA</span>
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-brand-text-primary mt-1">Iniciar Projeto</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-3 border border-stone-300 hover:bg-stone-100 text-brand-text-secondary hover:text-brand-text-primary transition-all rounded-full cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {!latestReport ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <p className="font-sans text-sm text-brand-text-secondary leading-relaxed font-light">
                Esboce sua visão criativa. A consultoria em IA analisará seus conceitos instantaneamente para propor estratégias de marca, layouts editoriais e uma paleta de cores exclusiva.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D6754D] font-extrabold font-sans">Seu Nome / Empresa</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    placeholder="Ex: Carlota de Vlieger"
                    className="bg-transparent border-b border-stone-300 py-3 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D6754D] font-extrabold font-sans">Endereço de Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ex: contato@carlota.design"
                    className="bg-transparent border-b border-stone-300 py-3 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Service Type */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Foco Sob Medida</label>
                  <select 
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="bg-white border border-stone-200 p-3.5 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors font-sans mt-2 rounded-lg text-sm"
                  >
                    <option value="Identidade Visual & Branding">Identidade Visual &amp; Branding</option>
                    <option value="Embalagem / Packaging">Embalagem / Packaging</option>
                    <option value="Motion & Animação">Motion &amp; Animação</option>
                    <option value="Modelagem & Render 3D">Modelagem &amp; Render 3D</option>
                    <option value="Site / Interface Web">Site / Interface Web</option>
                    <option value="Ilustração / Arte Digital">Ilustração / Arte Digital</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Outro / Projeto Especial">Outro / Projeto Especial</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-text-secondary font-bold font-sans">Escala Aprox. (Orçamento)</label>
                  <select 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-white border border-stone-200 p-3.5 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors font-sans mt-2 rounded-lg text-sm"
                  >
                    <option value="Até R$ 1.000">Até R$ 1.000</option>
                    <option value="R$ 1.000 - R$ 3.000">R$ 1.000 - R$ 3.000</option>
                    <option value="R$ 3.000 - R$ 8.000">R$ 3.000 - R$ 8.000</option>
                    <option value="R$ 8.000+">R$ 8.000+</option>
                  </select>
                </div>
              </div>

              {/* Brief Description */}
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D6754D] font-extrabold font-sans">Conceito Central (Seu Briefing)</label>
                <textarea 
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  required
                  rows={4}
                  placeholder="Descreva sua estética. Mencione cores, sentimentos, objetivos espaciais ou referências..."
                  className="bg-white border border-stone-200 p-4 text-brand-text-primary focus:outline-none focus:border-brand-tangerine transition-colors placeholder:text-stone-400 font-sans mt-2 rounded-lg resize-none text-sm"
                />
              </div>

              {/* Submit button with flowing animation and colors */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-tangerine to-orange-500 hover:from-orange-600 hover:to-brand-tangerine text-white py-4 font-sans text-xs uppercase tracking-[0.25em] font-extrabold flex items-center justify-center gap-3 transition-all rounded-[20px] shadow-lg shadow-brand-tangerine/20 disabled:opacity-50 hover:shadow-xl hover:translate-y-[-1px] duration-150 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    Consultando diretor de design...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-white animate-pulse" />
                    Avaliar Briefing com IA
                  </>
                )}
              </button>
            </form>
          ) : (
            /* AI Results View with Glass and light gradients */
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-brand-tangerine/10 border border-brand-tangerine/30 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 text-brand-tangerine">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="font-sans text-xs font-bold uppercase tracking-widest font-sans">
                    Relatório de Design da IA Gemini Carregado
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-black uppercase tracking-tight text-brand-text-primary">
                  RELATÓRIO &bull; {latestReport.clientName}
                </h4>
                <p className="font-sans text-xs text-brand-text-secondary leading-relaxed font-light font-sans">
                  Seu briefing foi analisado utilizando moldes de inteligência estética ajustados. Traçamos uma proposta exclusiva de alinhamento de paleta.
                </p>
              </div>

              {/* Strategy */}
              <div>
                <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#D6754D] font-extrabold mb-3 font-sans">1. Estratégia de Alinhamento de Direção de Arte</h5>
                <div className="bg-white border border-stone-200 p-5 rounded-xl font-sans text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap font-light shadow-sm">
                  {latestReport.aiAnalysis}
                </div>
              </div>

              {/* Palette */}
              {latestReport.aiColorPalette && latestReport.aiColorPalette.length > 0 && (
                <div>
                  <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#1C1613] font-extrabold mb-3 flex items-center gap-1.5 font-sans">
                    <Palette size={14} className="text-brand-tangerine" />
                    2. Configuração de Cores Exclusiva
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                    {latestReport.aiColorPalette.map((color, idx) => (
                      <div key={idx} className="bg-white border border-stone-200 p-4 flex items-center gap-3 rounded-xl shadow-sm">
                        <div 
                          className="w-10 h-10 rounded-lg border border-stone-200 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <div className="font-sans text-xs font-bold text-brand-text-primary truncate">{color.name}</div>
                          <div className="font-mono text-[10px] text-brand-text-secondary uppercase">{color.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {latestReport.aiTimeline && (
                <div>
                  <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-text-primary font-extrabold mb-3 flex items-center gap-1.5 font-sans">
                    <Calendar size={14} className="text-brand-tangerine" />
                    3. Ritmo Estimado da Produção
                  </h5>
                  <div className="bg-white border border-stone-200 p-5 rounded-xl font-mono text-xs text-brand-text-secondary leading-relaxed shadow-sm">
                    {latestReport.aiTimeline}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-200">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-white border border-stone-300 text-brand-text-primary py-3.5 font-sans text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 hover:bg-stone-50 transition-all rounded-[20px] cursor-pointer"
                >
                  <ClipboardCheck size={16} />
                  {copySuccess ? "Especificações Copiadas!" : "Copiar Relatório"}
                </button>
                <button
                  onClick={() => setLatestReport(null)}
                  className="bg-brand-tangerine hover:bg-brand-tangerine-hover text-white py-3.5 px-6 font-sans text-xs uppercase tracking-widest font-extrabold transition-all rounded-[20px] shadow-lg shadow-brand-tangerine/10 cursor-pointer"
                >
                  Enviar Novo Briefing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
