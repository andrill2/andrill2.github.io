import React from "react";
import { Project } from "../types";
import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  key?: string | number;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <motion.article 
      onClick={() => onSelect(project)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="work-card group cursor-pointer flex flex-col justify-between h-full p-4 liquid-glass rounded-2xl hover:bg-white/60 transition-all duration-500"
    >
      <div className="img-reveal-container aspect-[4/3] w-full rounded-xl border border-white/50 mb-5 relative overflow-hidden bg-[#FAF6F0] shadow-md group-hover:shadow-xl transition-shadow duration-500">
        <img 
          className="w-full h-full object-cover transition-all duration-1000 ease-out grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105" 
          src={project.imageUrl} 
          alt={project.altText || project.title}
          referrerPolicy="no-referrer"
        />
        
        {/* Soft Glass liquid orange overlay on hover */}
        <div className="absolute inset-0 bg-brand-tangerine/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute inset-0 bg-[#FAF6F0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[3px]">
          <div className="liquid-glass px-6 py-3 border border-white text-xs font-semibold uppercase tracking-widest flex items-center gap-2 rounded-full text-brand-text-primary shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500">
            Ver Projeto
            <ExternalLink size={12} className="text-brand-tangerine" />
          </div>
        </div>

        {project.isCustom && (
          <div className="absolute top-4 left-4 bg-brand-tangerine text-white text-[9px] uppercase font-extrabold tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            Customizado
          </div>
        )}
      </div>
      
      {/* Editorial Progress Accent - turns orange and grows */}
      <div className="progress-line mb-4 rounded-full"></div>
      
      <div className="flex justify-between items-start pt-1">
        <div>
          <h3 className="font-serif text-2xl font-black uppercase tracking-tight text-brand-text-primary group-hover:text-brand-tangerine transition-colors duration-300">
            {project.title}
          </h3>
          <p className="font-sans text-xs text-brand-text-secondary mt-1 font-light tracking-wide">
            {project.subtitle}
          </p>
        </div>
        
        <span className="font-sans text-[10px] uppercase tracking-widest font-extrabold text-brand-tangerine bg-brand-tangerine/10 border border-brand-tangerine/20 px-3 py-1 rounded-full">
          {project.category}
        </span>
      </div>
    </motion.article>
  );
}
