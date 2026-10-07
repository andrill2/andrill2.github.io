import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Braces, Calculator, Clapperboard, Cuboid, Instagram, Layers3, Mail, MessageCircle, Play, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import FenecoLogo from "./components/FenecoLogo";
import IntroAnimation from "./components/IntroAnimation";
import HomeProjectBackground from "./components/HomeProjectBackground";
import QuotePlanner from "./components/QuotePlanner";
import ServicesPage from "./components/ServicesPage";
import { projects as legacyProjects } from "./data/projects";

type View = "home" | "work" | "skills" | "about";
type Discipline = "Todos" | "Design" | "Motion" | "3D" | "Código";
type CaseField = "context" | "concept" | "solution" | "role" | "credits";
type Work = { id?:string; title:string; discipline:Exclude<Discipline,"Todos">; kind:string; image:string; alt:string; description:string; tools:string[]; link?:string; year:string; client?:string; caseStudy?:Partial<Record<CaseField,string>> };
const cp1252: Record<number, number> = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
const repair = (value: string) => { let output=value; for(let round=0;round<2 && /[ÃÂâ]/.test(output);round++){try{const bytes=Uint8Array.from(Array.from(output,char=>{const code=char.charCodeAt(0);return code<256?code:(cp1252[code]??63)}));output=new TextDecoder("utf-8",{fatal:true}).decode(bytes)}catch{break}} return output; };
const publicAsset = (value: string) => value.startsWith("/") ? `${import.meta.env.BASE_URL}${value.slice(1)}` : value;
const WHATSAPP_URL = "https://wa.me/5541988635137?text=Oi%2C%20Andril!%20Vi%20seu%20portf%C3%B3lio%20e%20quero%20conversar%20sobre%20um%20projeto.";
/**
 * SELECTED WORK (home) — lista curada manualmente, com diversidade entre disciplinas.
 * Para trocar os projetos em destaque na página inicial, edite este array (ids/títulos).
 */
/** Curadoria inicial, deliberadamente separada do arquivo. Troque esta lista sem apagar nada. */
const legacyFeaturedWork:Work[]=[
  {title:"Grupo Casco",discipline:"Design",kind:"Direção de arte · Social",image:"/clientes/grupo-casco/CASCO POST 8_2006.png",alt:"Peça de comunicação criada para o Grupo Casco",description:"Sistema visual e desdobramentos editoriais para uma marca que fala de negócios sem perder humanidade.",tools:["Direção de arte","Design gráfico","Campanha"],year:"2026"},
  {title:"Peixe procedural",discipline:"Motion",kind:"Animação · Sistema procedural",image:"https://mir-s3-cdn-cf.behance.net/projects/404/2725b9195016255.Y3JvcCwxMzgwLDEwODAsMjcwLDA.png",alt:"Animação procedural de peixe criada por Andril Esteves",description:"Movimento construído como sistema: forma, ritmo e comportamento trabalhando juntos.",tools:["Blender","Geometry Nodes","Animação"],link:"https://www.behance.net/gallery/195016255/Peixe-Animacao-Procedural",year:"2024"},
  {title:"Frizz",discipline:"Design",kind:"Branding · Packaging",image:"/mockups/refri-01.png",alt:"Latas coloridas da identidade Frizz",description:"Uma linha de bebidas criada para ser reconhecida de longe e desejada de perto.",tools:["Identidade","Embalagem","Mockup"],year:"2026"},
  {title:"Incast Studio",discipline:"Código",kind:"Produto digital · Front-end",image:"/incast-studio.png",alt:"Interface do site Incast Studio",description:"Design e desenvolvimento de uma experiência web publicada do zero, do conceito ao deploy.",tools:["UI/UX","React","Cloud Run"],link:"https://incast-studio-978682563954.us-east1.run.app/",year:"2025"},
  {title:"Hibiscus",discipline:"3D",kind:"Arte procedural · Lookdev",image:"https://mir-s3-cdn-cf.behance.net/projects/404/c8a8f6163795319.Y3JvcCwxMzgwLDEwODAsMjcwLDA.png",alt:"Flor de hibisco criada proceduralmente em 3D",description:"Uma flor digital construída por regras, detalhe e experimentação visual.",tools:["Blender","Procedural","Render"],link:"https://www.behance.net/gallery/163795319/Procedural-Hibiscus",year:"2023"},
  {title:"KGD Online",discipline:"Design",kind:"Social · Direção de arte",image:"/clientes/kgd-online/thumb video.png",alt:"Peça de conteúdo para KGD Online",description:"Conteúdo que traduz informação em ritmo, clareza e presença de marca.",tools:["Social","Direção de arte","Edição"],year:"2026"},
  {title:"Aurélia",discipline:"3D",kind:"Packaging · Visualização",image:"/mockups/cosmeticos-01.png",alt:"Visualização de cosméticos da marca Aurélia",description:"Direção de arte, embalagem e visualização de produto em uma linguagem delicada e tátil.",tools:["3D","Lookdev","Direção de arte"],year:"2026"},
  {title:"Uniterapy",discipline:"Código",kind:"UX/UI · Prototipação",image:"https://mir-s3-cdn-cf.behance.net/projects/404/80dbd591877299.Y3JvcCwxOTIwLDE1MDEsMCww.png",alt:"Protótipo de interface do projeto Uniterapy",description:"Interface pensada para tornar uma jornada sensível mais simples, calma e compreensível.",tools:["UX","Interface","Protótipo"],link:"https://www.behance.net/gallery/91877299/Prototipo-Uniterapy",year:"2019"}
];
const disciplines:Discipline[]=["Todos","Design","Motion","3D","Código"];
/**
 * Segmentos atendidos (sem citar marca): boa parte desse trabalho foi produzido via
 * agência, então os clientes finais nem sempre sabem/autorizam que Andril é o autor.
 * Edite esta lista apenas trocando os segmentos, nunca adicionando nomes de marca.
 */
const experienceSegments=["Advocacia","Comércio exterior & logística","Lavanderia & costura","Contabilidade online","Coworking & escritórios"];
const QUOTE_OPTIONS=[
  {id:"mascot-concept",group:"mascot",pt:"Mascote — conceito visual",en:"Mascot — visual concept",hours:6},
  {id:"mascot-3d",group:"mascot",pt:"Mascote — modelagem 3D",en:"Mascot — 3D modelling",hours:20},
  {id:"animation-simple",group:"animation",pt:"Animação — ajuste simples",en:"Animation — simple adjustment",hours:1},
  {id:"animation-piece",group:"animation",pt:"Animação — peça completa",en:"Animation — full piece",hours:10},
  {id:"rig-2d",group:"rig",pt:"Rig 2D",en:"2D rig",hours:5},
  {id:"rig-3d",group:"rig",pt:"Rig 3D",en:"3D rig",hours:12},
  {id:"ae-adjustment",group:"after",pt:"After Effects — ajuste de arquivo",en:"After Effects — file adjustment",hours:1},
  {id:"ae-edit",group:"after",pt:"After Effects — edição de projeto",en:"After Effects — project edit",hours:4},
  {id:"ae-build",group:"after",pt:"After Effects — montagem / organização",en:"After Effects — build / organisation",hours:8},
  {id:"logo-adjustment",group:"logo",pt:"Logo — ajuste",en:"Logo — adjustment",hours:2},
  {id:"logo-creation",group:"logo",pt:"Logo — criação",en:"Logo — creation",hours:10},
];
const QUOTE_GROUPS=[{id:"mascot",pt:"Mascote",en:"Mascot"},{id:"animation",pt:"Animação",en:"Animation"},{id:"rig",pt:"Rig",en:"Rig"},{id:"after",pt:"After Effects & arquivos",en:"After Effects & files"},{id:"logo",pt:"Logo",en:"Logo"}];
const QUOTE_LEVELS=[
  {id:"essential",pt:"Essencial",en:"Essential",multiplier:.5},
  {id:"standard",pt:"Intermediário",en:"Standard",multiplier:1},
  {id:"complex",pt:"Complexo",en:"Complex",multiplier:1.5},
];
const HOURLY_RATE=150;
/**
 * Eventos semânticos prontos para conexão futura com GA4 (ou outra ferramenta).
 * Nenhum analytics está instalado hoje: os eventos só populam window.dataLayer,
 * para o GA4 (ou similar) ser plugado depois sem alterar os componentes.
 */
const track=(event:string,data:Record<string,unknown>={})=>{if(typeof window==="undefined")return;(window as any).dataLayer=(window as any).dataLayer||[];(window as any).dataLayer.push({event,...data})};
const portfolioWork: Work[] = [
  ...legacyProjects.map((project) => ({
    id: project.id,
    title: project.id === "lua-skincare" ? "L\u00faa Skincare" : repair(project.title),
    discipline: (project.id === "lua-skincare" || project.category === "3D" ? "3D" : project.category === "Motion" ? "Motion" : project.category === "Web" ? "C\u00f3digo" : "Design") as Exclude<Discipline, "Todos">,
    kind: project.id === "lua-skincare" ? "Mockup 3D · Skincare" : repair(project.subtitle),
    image: project.imageUrl,
    alt: repair(project.altText || project.title),
    description: repair(project.description),
    tools: project.tech.map(repair),
    link: project.link,
    year: project.year,
    client: project.client,
    caseStudy: project.caseStudy,
  })),
  { title: "DH Law", discipline: "Design", kind: "ColeÃ§Ã£o de conteÃºdo · Advocacia", image: "/clientes/dh-law/DH%20POST%20BLOG.png", alt: "ColeÃ§Ã£o de peÃ§as para DH Law", description: "ColeÃ§Ã£o de comunicaÃ§Ã£o visual para uma atuaÃ§Ã£o jurÃ­dica contemporÃ¢nea.", tools: ["Social", "DireÃ§Ã£o de arte", "Sistema visual"], year: "2026" },
  { title: "Grupo Casco", discipline: "Design", kind: "ColeÃ§Ã£o de conteÃºdo · LogÃ­stica", image: "/clientes/grupo-casco/CASCO%20POST%208_2006.png", alt: "ColeÃ§Ã£o de peÃ§as para Grupo Casco", description: "ComunicaÃ§Ã£o editorial e institucional para comÃ©rcio exterior e logÃ­stica.", tools: ["Social", "Editorial", "DireÃ§Ã£o de arte"], year: "2026" },
  { title: "Lavoutique", discipline: "Design", kind: "ColeÃ§Ã£o de conteÃºdo · Varejo", image: "/clientes/lavoutique/POST%2007.png", alt: "ColeÃ§Ã£o de peÃ§as para Lavoutique", description: "PeÃ§as de campanha e conteÃºdo para uma marca de cuidado tÃªxtil.", tools: ["Campanha", "Social", "Varejo"], year: "2026" },
  { title: "KGD Online", discipline: "Design", kind: "Coleção de conteúdo · Contabilidade", image: "/clientes/kgd-online/thumb%20video.png", alt: "Coleção de peças para KGD Online", description: "Conteúdo visual e social para uma marca de contabilidade digital.", tools: ["Social", "Direção de arte", "Conteúdo"], year: "2026" },
  { title: "EstÃºdio", discipline: "Design", kind: "ColeÃ§Ã£o de estudos · DireÃ§Ã£o de arte", image: "/clientes/estudio/post-moda.png", alt: "Estudos visuais do estÃºdio", description: "Estudos de linguagem para segmentos de moda, cafÃ©, fitness e corporativo.", tools: ["Art direction", "Social", "Estudos"], year: "2026" },
];
/** Curadoria reversÃ­vel: altere somente esta lista; o acervo jamais Ã© reduzido. */
const FEATURED_WORK_KEYS = ["runtrip", "ksenia", "jobster", "procedural-hibiscus", "peixe-procedural", "lata", "incast-studio", "uniterapy"];
const featuredWork = FEATURED_WORK_KEYS.map(key => portfolioWork.find(work => work.id === key || work.title === key)).filter((work): work is Work => Boolean(work));
const baseSkills=[
  {icon:Layers3,name:"Design gráfico",desc:"Identidade, campanha, editorial, social e embalagem.",tools:"Photoshop · Illustrator · InDesign · Figma"},
  {icon:Clapperboard,name:"Motion design",desc:"Animação 2D e 3D, vinhetas, vídeos e sistemas de movimento.",tools:"After Effects · Premiere · Remotion"},
  {icon:Cuboid,name:"3D & procedural",desc:"Modelagem, lookdev, render e peças baseadas em regras.",tools:"Blender · Geometry Nodes · Unreal"},
  {icon:Braces,name:"Código criativo",desc:"Interfaces, sites, automações e ferramentas feitas para funcionar.",tools:"React · TypeScript · Python · Node"}
];
// Para a home, Motion e 3D lideram (posicionamento principal); não altera a ordem 01-04 da página Skills.
const homeCapacities=[baseSkills[1],baseSkills[2],baseSkills[0],baseSkills[3]];
const FOX_ICONS=["fox_489994.svg","fox_3975050.svg","fox_2477621.svg","fox_2153090.svg"];

export default function App(){
  const [pathname,setPathname]=useState(()=>window.location.pathname);
  useEffect(()=>{const update=()=>setPathname(window.location.pathname);window.addEventListener("popstate",update);return()=>window.removeEventListener("popstate",update)},[]);
  if(pathname==="/servicos"||pathname.startsWith("/servicos/"))return <ServicesPage/>;
  return <PortfolioApp/>;
}

function PortfolioApp(){
  const [introDone,setIntroDone]=useState(false),[opened,setOpened]=useState(false),[view,setView]=useState<View>("home"),[filter,setFilter]=useState<Discipline>("Todos"),[selected,setSelected]=useState<Work|null>(null),[clientWork,setClientWork]=useState<Work[]>([]),[locale,setLocale]=useState<"pt-BR"|"en">("pt-BR"),[quoteOpen,setQuoteOpen]=useState(false),[quoteItems,setQuoteItems]=useState<string[]>([]),[quoteLevels,setQuoteLevels]=useState<Record<string,string>>({});
  const dialogRef=useRef<HTMLDivElement>(null); const reduceMotion=useReducedMotion(); const archiveWork=[...portfolioWork.slice(0,legacyProjects.length),...clientWork]; const visible=filter==="Todos"?archiveWork:archiveWork.filter(x=>x.discipline===filter);
  const scrollToId=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:reduceMotion?"auto":"smooth",block:"start"});
  useEffect(()=>{fetch(`${import.meta.env.BASE_URL}social.json`).then(response=>response.json()).then((groups:{id:string;label:string;segment:string;images:string[]}[])=>setClientWork(groups.flatMap(group=>group.images.map((image,index)=>({title:`${repair(group.label)} — ${String(index+1).padStart(2,"0")}`,discipline:"Design" as Exclude<Discipline,"Todos">,kind:`Cliente · ${repair(group.segment||"Direção de arte")}`,image,alt:`Peça ${index+1} criada para ${repair(group.label)}`,description:`Peça ${index+1} da coleção visual desenvolvida para ${repair(group.label)}.`,tools:["Cliente","Direção de arte","Conteúdo"],year:"2026"}))))).catch(()=>setClientWork([]))},[]);
  useEffect(()=>{if(!selected)return; const close=(e:KeyboardEvent)=>e.key==="Escape"&&setSelected(null);document.body.classList.add("modal-open");window.addEventListener("keydown",close);dialogRef.current?.focus();return()=>{document.body.classList.remove("modal-open");window.removeEventListener("keydown",close)}},[selected]);
  useEffect(()=>{document.documentElement.lang=locale;document.title=locale==="en"?"Andrïl Esteves — Motion Designer & 3D Generalist":"Andrïl Esteves — Motion Designer e 3D Generalist"},[locale]);
  const chooseView=(next:View)=>{setView(next);setOpened(true)};
  const tr=(pt:string,en:string)=>locale==="en"?en:pt;
  const translatedDiscipline=(discipline:Discipline)=>locale==="en"?({Todos:"All",Design:"Design",Motion:"Motion","3D":"3D","Código":"Code"}[discipline]):discipline;
  const selectedLevel=(id:string)=>QUOTE_LEVELS.find(level=>level.id===(quoteLevels[id]||"standard"))||QUOTE_LEVELS[1];
  const quoteHours=QUOTE_OPTIONS.filter(option=>quoteItems.includes(option.id)).reduce((total,option)=>total+option.hours*selectedLevel(option.id).multiplier,0);
  const quoteValue=new Intl.NumberFormat(locale==="en"?"en-US":"pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(quoteHours*HOURLY_RATE);
  const quoteSummary=`${tr("Olá, Andrïl! Gostaria de solicitar este orçamento:","Hello, Andrïl! I would like to request this quote:")}\n\n${QUOTE_OPTIONS.filter(option=>quoteItems.includes(option.id)).map(option=>`• ${locale==="en"?option.en:option.pt} (${locale==="en"?selectedLevel(option.id).en:selectedLevel(option.id).pt}) — ${new Intl.NumberFormat(locale==="en"?"en-US":"pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(option.hours*selectedLevel(option.id).multiplier*HOURLY_RATE)}`).join("\n") || tr("Nenhum serviço selecionado.","No services selected.")}\n\n${tr("Total estimado","Estimated total")}: ${quoteValue}`;
  const quoteEmail=`https://mail.google.com/mail/?view=cm&fs=1&to=andrilesteves%40gmail.com&su=${encodeURIComponent(tr("Pedido de orçamento","Quote request"))}&body=${encodeURIComponent(quoteSummary)}`;
  const quoteWhatsapp=`https://wa.me/5541988635137?text=${encodeURIComponent(quoteSummary)}`;
  const skills=locale==="en"?[
    {...homeCapacities[2],name:"Graphic design",desc:"Identity, campaigns, editorial, social and packaging."},
    {...homeCapacities[0],name:"Motion design",desc:"2D and 3D animation, title sequences, video and movement systems."},
    {...homeCapacities[1],name:"3D & procedural",desc:"Modelling, lookdev, rendering and rule-based visual work."},
    {...homeCapacities[3],name:"Creative coding",desc:"Interfaces, websites, automations and tools built to work."}
  ]:baseSkills;
  return <><AnimatePresence>{!introDone&&<motion.div exit={{opacity:0}} transition={{duration:.55}}><IntroAnimation onReveal={()=>setIntroDone(true)}/></motion.div>}</AnimatePresence><div className={`app-shell ${opened?"app-shell--open":"app-shell--cover"}`}>{!opened&&<HomeProjectBackground works={featuredWork}/>}
    <a className="skip-link" href="#content">{tr("Pular para o conteúdo","Skip to content")}</a>
    <header className="app-header"><a className="brand" href="#" onClick={e=>{e.preventDefault();chooseView("home")}}><FenecoLogo className="brand-mark" fill="currentColor"/><span>ANDRIL<br/>ESTEVES</span></a><p className="brand-role">{tr("Designer multidisciplinar","Multidisciplinary designer")}<br/>Curitiba · {tr("Brasil","Brazil")}</p><nav role="tablist" aria-label={tr("Seções do portfólio","Portfolio sections")}>{([['work',tr('Trabalhos','Work')],['skills','Skills'],['about',tr('Sobre','About')]] as [View,string][]).map(([id,label])=><button key={id} role="tab" aria-selected={view===id} aria-controls={`panel-${id}`} onClick={()=>chooseView(id)}>{label}</button>)}</nav><a className="header-contact" href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={()=>track("click_whatsapp",{from:"header"})}>{tr("Contato","Contact")} <ArrowUpRight/></a></header>
    {!opened&&<aside className="cover-context" aria-label="Posicionamento"><p>{locale==="en"?"ONE PERSON.":"UMA PESSOA."}</p><em>{locale==="en"?"MANY LANGUAGES.":"VÁRIAS LINGUAGENS."}</em><span>DESIGN · MOTION · 3D · CODE</span></aside>}
    <div className="site-tools" aria-label="Links e idioma"><button type="button" onClick={()=>setLocale(value=>value==="pt-BR"?"en":"pt-BR")} aria-label={locale==="pt-BR"?"Switch to English":"Mudar para português"}>{locale==="pt-BR"?"EN":"PT"}</button><a href="https://www.instagram.com/andrilesteves/" target="_blank" rel="noreferrer" aria-label="Instagram de Andrïl Esteves" onClick={()=>track("click_instagram",{from:"site-tools"})}><Instagram/></a><a href="https://mail.google.com/mail/?view=cm&fs=1&to=andrilesteves%40gmail.com" target="_blank" rel="noreferrer" aria-label="Enviar e-mail para Andrïl Esteves" onClick={()=>track("click_email",{from:"site-tools"})}><Mail/></a></div>
    <button className="quote-prompt" type="button" onClick={()=>setQuoteOpen(true)}><span>{tr("Orçamento","Quote")}</span><Calculator/></button>
    <main id="content" className="app-main">
      {opened&&<AnimatePresence mode="wait">
        {view==="home"&&<motion.section key="home" id="panel-home" role="tabpanel" aria-label="Início" className="panel home-panel" initial={reduceMotion?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:-8}}>
          <section className="hero">
            <p className="code-label">/ remote · worldwide</p>
            <h1>ANDRIL<br/><em>ESTEVES</em></h1>
            <p className="hero__role">Motion Designer <span>&amp;</span> 3D Generalist</p>
            <p className="hero__disciplines">Art Direction · Motion · CGI · VFX · Procedural · Creative Coding</p>
            <p className="hero__base">Curitiba, Brazil — <strong>REMOTE / WORLDWIDE</strong></p>
            <div className="hero__ctas">
              <button type="button" onClick={()=>{track("play_showreel",{from:"hero"});scrollToId("showreel")}}><Play/> Play reel</button>
              <button type="button" onClick={()=>scrollToId("selected-work")}>Selected work</button>
              <a className="hero__cta-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={()=>track("click_whatsapp",{from:"hero"})}>Conversar</a>
            </div>
          </section>
          <section className="showreel" id="showreel">
            <p className="code-label">/ showreel</p>
            <h2>Ver em <em>movimento.</em></h2>
            {/*
              TODO: inserir o showreel final aqui.
              Opção A — arquivo local: coloque o vídeo em /public/showreel.mp4 e troque o bloco
              abaixo por <video src={publicAsset("/showreel.mp4")} controls playsInline poster="..."/>.
              Opção B — Vimeo/YouTube: troque pelo <iframe> de embed correspondente.
              Nenhum vídeo placeholder/stock foi adicionado propositalmente.
            */}
            <div className="showreel__placeholder"><Play/><p>Showreel em produção — em breve.</p></div>
          </section>
          <section className="selected-work" id="selected-work">
            <p className="code-label">/ selected work</p>
            <h2>{tr("Trabalhos","Selected")}<br/><em>{tr("selecionados.","work.")}</em></h2>
            <div className="project-grid project-grid--home">{featuredWork.map((item,index)=><button key={item.title} type="button" className="project" onClick={()=>{track("view_project",{title:item.title});setSelected(item)}}><span className="project-thumb"><img src={publicAsset(item.image)} alt={item.alt} loading={index<3?"eager":"lazy"}/><i><ArrowUpRight/></i></span><span className="project-info"><strong>{item.title}</strong><small>{item.kind}</small><b>{item.year}</b></span></button>)}</div>
            <button type="button" className="home-link-all" onClick={()=>chooseView("work")}>{tr("Ver todos os trabalhos","View all work")} <ArrowUpRight/></button>
          </section>
          <section className="home-capacities">
            <p className="code-label">/ capacidades</p>
            <h2>Uma pessoa.<br/><em>Várias linguagens.</em></h2>
            <div className="home-capacities__grid">{homeCapacities.map(({icon:Icon,name,desc})=><article key={name}><Icon/><h3>{name}</h3><p>{desc}</p></article>)}</div>
          </section>
          <section className="home-clients">
            <p className="code-label">/ experiência em agência</p>
            <p className="home-clients__intro">Parte dos projetos foi produzida em agência, atendendo marcas dos segmentos:</p>
            <ul>{experienceSegments.map(segment=><li key={segment}>{segment}</li>)}</ul>
          </section>
          <section className="home-cta">
            <h2>Vamos criar<br/><em>algo juntos?</em></h2>
            <div className="home-cta__actions">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={()=>track("click_whatsapp",{from:"home-cta"})}>Conversar no WhatsApp <ArrowUpRight/></a>
              <a href="mailto:andrilesteves@gmail.com" onClick={()=>track("click_email",{from:"home-cta"})}>andrilesteves@gmail.com <ArrowUpRight/></a>
            </div>
          </section>
        </motion.section>}
        {view==="work"&&<motion.section key="work" id="panel-work" role="tabpanel" aria-label={tr("Trabalhos","Work")} className="panel work-panel" initial={reduceMotion?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:-8}}><div className="panel-intro"><p className="code-label">{tr("/ arquivo completo","/ full archive")}</p><h1>{tr("Arquivo","Work")}<br/><em>{tr("de trabalhos.","archive.")}</em></h1><p>{tr("Projetos autorais e cada peça de cliente, sem cortes. Os filtros organizam o acervo — não eliminam trabalhos.","Personal projects and every client piece, without cuts. Filters organize the archive — they do not remove work.")}</p></div><div className="work-controls" role="tablist" aria-label={tr("Filtrar trabalhos","Filter work")}>{disciplines.map(x=><button type="button" role="tab" aria-selected={filter===x} key={x} onClick={()=>setFilter(x)}>{translatedDiscipline(x)}<sup>{x==="Todos"?archiveWork.length:archiveWork.filter(w=>w.discipline===x).length}</sup></button>)}</div><div className="project-grid">{visible.map((item,index)=><motion.button layout={!reduceMotion} className="project" key={`${item.title}-${index}`} type="button" onClick={()=>{track("view_project",{title:item.title});setSelected(item)}} initial={reduceMotion?false:{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:index*.04}}><span className="project-thumb"><img src={publicAsset(item.image)} alt={item.alt} loading={index>2?"lazy":"eager"}/><i><ArrowUpRight/></i></span><span className="project-info"><strong>{item.title}</strong><small>{item.kind}</small><b>{item.year}</b></span></motion.button>)}</div></motion.section>}
        {view==="skills"&&<motion.section key="skills" id="panel-skills" role="tabpanel" aria-label="Skills" className="panel skills-panel" initial={reduceMotion?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:-8}}><div className="panel-intro"><p className="code-label">{tr("/ capacidades","/ capabilities")}</p><h1>{tr("Uma pessoa.","One person.")}<br/><em>{tr("Várias linguagens.","Many languages.")}</em></h1><p>{tr("Eu conecto direção de arte, movimento, tridimensional e tecnologia para a ideia chegar inteira ao outro lado.","I connect art direction, motion, 3D and technology so an idea reaches the other side intact.")}</p></div><div className="skills-grid">{skills.map(({name,desc,tools},i)=><article key={name}><span>0{i+1}</span><img className="skill-fox" src={`/icons/raposa/${FOX_ICONS[i]}`} alt=""/><h2>{name}</h2><p>{desc}</p><small>{tools}</small></article>)}</div></motion.section>}
        {view==="about"&&<motion.section key="about" id="panel-about" role="tabpanel" aria-label={tr("Sobre","About")} className="panel about-panel" initial={reduceMotion?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:-8}}><div className="about-statement"><p className="code-label">/ {tr("manifesto","manifesto")}</p><h1>{tr("Eu não escolhi","I did not choose")}<br/>{tr("entre fazer a ideia","between making the idea")}<br/><em>{tr("e fazer ela funcionar.","and making it work.")}</em></h1></div><div className="about-details"><p>{tr("Sou Andrïl Esteves — Motion Designer e artista 3D com background em direção de arte, design e creative coding. Trabalho onde linguagem visual, movimento e tecnologia se encontram.","I am Andrïl Esteves — a Motion Designer and 3D artist with a background in art direction, design and creative coding. I work where visual language, motion and technology meet.")}</p><p>{tr("Gosto de participar do começo ao fim: entender o problema, encontrar um ponto de vista, criar o sistema e transformar isso numa experiência concreta.","I like being part of a project from start to finish: understanding the problem, finding a point of view, creating the system and turning it into a concrete experience.")}</p><dl><div><dt>{tr("Base","Based in")}</dt><dd>Curitiba, {tr("Paraná","Brazil")}</dd></div><div><dt>{tr("Trabalho","Work")}</dt><dd>{tr("Remoto / Worldwide","Remote / Worldwide")}</dd></div><div><dt>{tr("Agora","Now")}</dt><dd>{tr("Disponível para freela & contratos remotos","Available for freelance & remote contracts")}</dd></div></dl><a href="mailto:andrilesteves@gmail.com" onClick={()=>track("click_email",{from:"about"})}>andrilesteves@gmail.com <ArrowUpRight/></a><a href="https://www.instagram.com/andrilesteves/" target="_blank" rel="noreferrer" onClick={()=>track("click_instagram",{from:"about"})}>Instagram <ArrowUpRight/></a>{/* TODO: confirmar URL oficial do LinkedIn antes de publicar este link.
            <a href="#" target="_blank" rel="noreferrer" onClick={()=>track("click_linkedin",{from:"about"})}>LinkedIn <ArrowUpRight/></a> */}</div></motion.section>}
      </AnimatePresence>}
    </main>
    <footer><span>© {new Date().getFullYear()} ANDRIL ESTEVES</span><a href="https://www.behance.net/andrilesteves" target="_blank" rel="noreferrer" onClick={()=>track("click_behance",{from:"footer"})}>Behance <ArrowUpRight/></a><a href="https://www.instagram.com/andrilesteves/" target="_blank" rel="noreferrer" onClick={()=>track("click_instagram",{from:"footer"})}>Instagram <ArrowUpRight/></a>{/* TODO: confirmar URL oficial do LinkedIn antes de publicar este link.
    <a href="#" target="_blank" rel="noreferrer" onClick={()=>track("click_linkedin",{from:"footer"})}>LinkedIn <ArrowUpRight/></a> */}<a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={()=>track("click_whatsapp",{from:"footer"})}>WhatsApp <ArrowUpRight/></a></footer>
    <a className="whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Conversar com Andril no WhatsApp" onClick={()=>track("click_whatsapp",{from:"floating-button"})}><MessageCircle/><span>Conversar</span></a><QuotePlanner open={quoteOpen} onClose={()=>setQuoteOpen(false)} locale={locale}/>
    <AnimatePresence>{quoteOpen&&<motion.div className="modal-backdrop quote-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setQuoteOpen(false)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title" initial={reduceMotion?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:16}}><button className="modal-close" type="button" onClick={()=>setQuoteOpen(false)} aria-label={tr("Fechar","Close")}><X/></button><p className="code-label">/ {tr("orçamento","quote")}</p><h2 id="quote-title">{tr("Monte seu","Build your")}<br/><em>{tr("orçamento.","quote.")}</em></h2><p>{tr("Escolha um nível de complexidade e os blocos do projeto para montar a estimativa.","Choose a complexity level and the project blocks to build your estimate.")}</p><div className="quote-levels">{QUOTE_LEVELS.map(level=><button type="button" key={level.id} className={Object.values(quoteLevels).every(value=>value===(level.id||"standard"))?"is-active":""} onClick={()=>setQuoteLevels(Object.fromEntries(QUOTE_OPTIONS.map(option=>[option.id,level.id])))}>{locale==="en"?level.en:level.pt}</button>)}</div><div className="quote-options">{QUOTE_OPTIONS.map(option=><label key={option.id}><input type="checkbox" checked={quoteItems.includes(option.id)} onChange={()=>setQuoteItems(items=>items.includes(option.id)?items.filter(id=>id!==option.id):[...items,option.id])}/><span><strong>{locale==="en"?option.en:option.pt}</strong><small>{new Intl.NumberFormat(locale==="en"?"en-US":"pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(option.hours*selectedLevel(option.id).multiplier*HOURLY_RATE)}</small></span></label>)}</div><div className="quote-total"><span>{tr("Estimativa","Estimate")}</span><strong>{quoteValue}</strong></div><div className="quote-actions"><a href={quoteEmail} target="_blank" rel="noreferrer" onClick={()=>track("send_quote_email",{hours:quoteHours})}><Mail/>{tr("Enviar por e-mail","Send by email")}</a><a href={quoteWhatsapp} target="_blank" rel="noreferrer" onClick={()=>track("send_quote_whatsapp",{hours:quoteHours})}><MessageCircle/>{tr("Enviar por WhatsApp","Send by WhatsApp")}</a></div></motion.section></motion.div>}</AnimatePresence>
    <AnimatePresence>{selected&&<motion.div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef} initial={reduceMotion?false:{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:15}}><button className="modal-close" type="button" onClick={()=>setSelected(null)} aria-label="Fechar"><X/></button><img src={selected.image} alt={selected.alt}/><div><p className="code-label">{selected.kind} · {selected.year}</p><h2 id="modal-title">{selected.title}</h2><p>{selected.description}</p><dl className="case-details">{([['context','Contexto'],['concept','Ideia / conceito'],['solution','Solução'],['role','Meu papel'],['credits','Créditos']] as [CaseField,string][]).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{selected.caseStudy?.[key] || "A preencher"}</dd></div>)}</dl><ul>{selected.tools.map(x=><li key={x}>{x}</li>)}</ul>{selected.link&&<a href={selected.link} target="_blank" rel="noreferrer">Ver projeto completo <ArrowUpRight/></a>}</div></motion.div></motion.div>}</AnimatePresence>
  </div></>;
}
