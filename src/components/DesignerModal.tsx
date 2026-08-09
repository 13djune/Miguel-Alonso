import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ExternalLink, Instagram, Linkedin, Mail } from 'lucide-react';
import { DesignerIcon, SkillsIcon, ExperienceIcon, EducationIcon, AwardsIcon, ToolsIcon, ContactIcon, DownloadIcon, XIcon } from './PixelIcons';
import { useLanguage } from '../context/LanguageContext';
import StarBorder from './StarBorder';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

import AsciiImage from './AsciiImage';


interface DesignerModalProps {
  onClose: () => void;
}

export default function DesignerModal({ onClose }: DesignerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { t } = useLanguage();
  const skillsData = [
    { subject: t('skill.3d'), A: 95, fullMark: 100 },
    { subject: t('skill.pattern'), A: 90, fullMark: 100 },
    { subject: t('skill.render'), A: 85, fullMark: 100 },
    { subject: t('skill.anim'), A: 75, fullMark: 100 },
    { subject: t('skill.texture'), A: 85, fullMark: 100 },
    { subject: t('skill.art'), A: 90, fullMark: 100 },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        backgroundColor: 'rgba(0,0,0,0)',
        duration: 0.5,
        ease: 'power2.inOut'
      });
      
      gsap.from('.modal-content', {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1
      });

      gsap.to('.modal-content', {
        borderColor: 'rgba(196, 255, 255, 0.6)',
        boxShadow: '4px 4px 10px rgba(196,255,255,0.1)',
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 0.5
      });

      gsap.from('.animate-stagger-item', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.5
      });
    });
    
    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.inOut',
      onComplete: onClose
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 bg-[#070707]/95 flex flex-col z-50 overflow-x-hidden overflow-y-auto backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="scanlines" />
      
      <header className="sticky top-0 z-[100] bg-[#070707]/90 backdrop-blur-md pt-4 md:pt-8 flex flex-row justify-between items-center border-b border-[#c4ffff]/30 pb-4 shrink-0 px-4 md:px-8 w-full max-w-[1200px] mx-auto gap-4 overflow-hidden">
        <div className="font-mono text-[10px] text-[#c4ffff] uppercase bg-[#c4ffff]/10 px-2 py-1 border border-[#c4ffff]/30 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
          {t('sys.viewer')}
        </div>
        <StarBorder as="button" color="#c4ffff" speed="3s" className="p-0">
          <div 
            onClick={handleClose} 
            className="font-mono text-xs text-black bg-[#c4ffff] px-4 py-2 uppercase font-bold hover:bg-white transition-colors flex items-center gap-2 cursor-crosshair"
          >
            <XIcon className="w-[14px] h-[14px]" /> {t('modal.terminate')}
          </div>
        </StarBorder>
      </header>

      <div ref={contentRef} className="w-full max-w-[1200px] mx-auto flex-1 flex flex-col gap-6 md:gap-8 pb-12 relative z-10 pt-8 px-4 md:px-8">
        
        {/* Top Row: Main Info & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Main Info */}
          <div className="lg:col-span-1 bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 md:p-8 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content flex flex-col justify-between min-w-0">
            <div>
              <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-[#c4ffff]"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-[#c4ffff]"></div>
              
              <div className="mb-6 flex flex-col md:flex-row gap-6 md:items-start">
              <div className="w-32 md:w-48 shrink-0">
                <div className="border border-[#c4ffff]/30 bg-black flex items-center justify-center overflow-hidden aspect-square">
                  <AsciiImage 
                    src="/designer.jpg" 
                    width={120} 
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold uppercase text-white mb-2 tracking-tighter shadow-[#c4ffff]/50 drop-shadow-sm flex items-center gap-4 flex-wrap">
                  <DesignerIcon className="text-[#c4ffff]" />
                  {t('overlay.designer.title')}
                </h2>
                <div className="font-mono text-xs text-[#c4ffff] bg-[#c4ffff]/10 inline-block px-3 py-1 border border-[#c4ffff]/30 mb-4">
                  {t('designer.id')}
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-gray-300 font-mono uppercase mb-8 pb-6 border-b border-[#c4ffff]/20">
                  {t('designer.desc')}
                </p>
              </div>
            </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <StarBorder as="div" color="#c4ffff" speed="3s" className="w-full sm:w-1/2 p-0 cursor-pointer">
                <div className="flex items-center justify-between w-full py-4 px-6 bg-[#c4ffff] text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors relative group overflow-hidden cursor-crosshair">
                  <span className="relative z-10">{t('overlay.btn.portfolio')}</span>
                  <ExternalLink size={16} className="relative z-10" />
                  <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                </div>
              </StarBorder>
              <StarBorder as="div" color="#c4ffff" speed="3s" className="w-full sm:w-1/2 p-0 cursor-pointer">
                <div className="flex items-center justify-between w-full py-4 px-6 bg-black border border-[#c4ffff] text-[#c4ffff] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[#c4ffff]/10 transition-colors cursor-crosshair">
                  <span>{t('overlay.btn.resume')}</span>
                  <DownloadIcon className="w-[16px] h-[16px]" />
                </div>
              </StarBorder>
            </div>
          </div>

          {/* Skills Radar */}
          <div className="lg:col-span-1 bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 md:p-8 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-[#c4ffff]/30 pb-4">
              <h3 className="text-sm md:text-base font-mono font-bold uppercase tracking-widest text-[#c4ffff] flex items-center gap-3">
                <SkillsIcon className="w-[18px] h-[18px]" />
                {t('skills.title')}
              </h3>
            </div>
            <div className="flex-1 w-full flex items-center justify-center min-h-[300px] md:min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={window.innerWidth < 768 ? "60%" : "75%"} data={skillsData}>
                  <PolarGrid stroke="#c4ffff" strokeOpacity={0.3} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#c4ffff', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#c4ffff"
                    strokeWidth={2}
                    fill="#c4ffff"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Middle Row: Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Experience */}
          <div className="bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 md:p-8 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content">
            <div className="flex justify-between items-center mb-8 border-b border-[#c4ffff]/30 pb-4">
              <h3 className="text-sm md:text-base font-mono font-bold uppercase tracking-widest text-[#c4ffff] flex items-center gap-3">
                <ExperienceIcon className="w-[18px] h-[18px]" />
                {t('overlay.exp.title')}
              </h3>
              <span className="text-[10px] text-[#c4ffff] animate-pulse">■ RECORDING</span>
            </div>
            <div className="space-y-6">
              {[
                { role: t('job.eme.role'), company: 'EME STUDIOS', period: '[24-ACTUAL]', link: 'https://emestudios.com/es/es/' },
                { role: t('job.leandro.role'), company: 'LEANDRO CANO', period: '[22-23]', link: 'https://www.leandrocano.com/' }
              ].map((job, i) => (
                <a key={i} href={job.link} target="_blank" rel="noopener noreferrer" className="cursor-target block group cursor-crosshair animate-stagger-item">
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <h4 className="text-xs md:text-sm font-bold text-white font-mono group-hover:text-[#c4ffff] transition-colors">{job.company}</h4>
                    <span className="text-[10px] text-gray-500 font-mono group-hover:text-[#c4ffff]/70 transition-colors whitespace-nowrap">{job.period}</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-400 font-mono flex items-center gap-2">
                    <span className="text-[#c4ffff] opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                    {job.role}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 md:p-8 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content">
            <div className="flex justify-between items-center mb-8 border-b border-[#c4ffff]/30 pb-4">
              <h3 className="text-sm md:text-base font-mono font-bold uppercase tracking-widest text-[#c4ffff] flex items-center gap-3">
                <EducationIcon className="w-[18px] h-[18px]" />
                {t("edu.title")}
              </h3>
            </div>
            <div className="space-y-6">
              {[
                { 
                  degree: t('edu.degree'), 
                  school: t('edu.school'), 
                  period: '[20-24]',
                  link: 'https://www.udit.es/'
                }
              ].map((edu, i) => (
                <a key={i} href={edu.link} target="_blank" rel="noopener noreferrer" className="cursor-target block group cursor-crosshair animate-stagger-item">
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <h4 className="text-[10px] md:text-xs font-bold text-white font-mono group-hover:text-[#c4ffff] transition-colors leading-tight line-clamp-2">{edu.school}</h4>
                    <span className="text-[10px] text-gray-500 font-mono group-hover:text-[#c4ffff]/70 transition-colors whitespace-nowrap shrink-0">{edu.period}</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-400 font-mono flex items-center gap-2 mt-1">
                    <span className="text-[#c4ffff] opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                    {edu.degree}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 md:p-8 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content">
            <div className="flex justify-between items-center mb-8 border-b border-[#c4ffff]/30 pb-4">
              <h3 className="text-sm md:text-base font-mono font-bold uppercase tracking-widest text-[#c4ffff] flex items-center gap-3">
                <AwardsIcon className="w-[18px] h-[18px]" />
                {t("awards.title")}
              </h3>
            </div>
            <div className="space-y-6">
              <a href="https://manteco.com/esne-manteco-academys-2023-manteco-sustainability-award/" target="_blank" rel="noopener noreferrer" className="cursor-target block group cursor-crosshair animate-stagger-item">
                <div className="flex justify-between items-baseline mb-1 gap-2">
                  <h4 className="text-xs md:text-sm font-bold text-white font-mono group-hover:text-[#c4ffff] transition-colors leading-tight">Manteco Sustainability Award</h4>
                  <span className="text-[10px] text-gray-500 font-mono group-hover:text-[#c4ffff]/70 transition-colors whitespace-nowrap">[2023]</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 font-mono flex items-start gap-2 mt-2 leading-relaxed">
                  <span className="text-[#c4ffff] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">&gt;</span>
                  <span dangerouslySetInnerHTML={{ __html: t('award.manteco') }} />
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Tools & Tech (Informative only) */}
        <div className="bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content">
          <div className="flex items-center gap-4 mb-4 border-b border-[#c4ffff]/30 pb-4">
            <h3 className="text-sm md:text-base font-mono font-bold uppercase tracking-widest text-[#c4ffff] flex items-center gap-3">
              <ToolsIcon className="w-[18px] h-[18px]" />
              {t("sys.tools")}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              'CLO 3D', 'MARVELOUS DESIGNER', 'BLENDER', 'CINEMA 4D',
              'UNREAL ENGINE', 'SUBSTANCE PAINTER', 'REACT THREE FIBER', 'TOUCHDESIGNER'
            ].map((tool, i) => (
              <div key={i} className="border border-[#c4ffff]/20 bg-[#c4ffff]/5 px-3 py-1 text-center select-none animate-stagger-item">
                <span className="font-mono text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest">{tool}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Bar (Horizontal at the bottom) */}
        <div className="bg-black/80 backdrop-blur-sm border border-[#c4ffff]/30 p-6 relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)] modal-content flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
          <h3 className="text-sm md:text-base font-mono font-bold uppercase tracking-widest text-[#c4ffff] flex items-center gap-3 whitespace-nowrap">
            <ContactIcon className="w-[18px] h-[18px]" />
            {t("contact.title")}
          </h3>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 md:gap-8 flex-1">
            <a href="mailto:design@sys.void" className="cursor-target flex items-center gap-2 font-mono text-xs text-gray-300 hover:text-[#c4ffff] transition-colors group cursor-crosshair">
              <Mail size={14} className="group-hover:text-[#c4ffff]" />
              <span className="uppercase tracking-widest">design@sys.void</span>
            </a>
            <a href="#" className="cursor-target flex items-center gap-2 font-mono text-xs text-gray-300 hover:text-[#c4ffff] transition-colors group cursor-crosshair">
              <Instagram size={14} className="group-hover:text-[#c4ffff]" />
              <span className="uppercase tracking-widest">@sys.void.design</span>
            </a>
            <a href="https://www.linkedin.com/in/miguel-alonso-frutos-b4bb55272/" target="_blank" rel="noopener noreferrer" className="cursor-target flex items-center gap-2 font-mono text-xs text-gray-300 hover:text-[#c4ffff] transition-colors group cursor-crosshair">
              <Linkedin size={14} className="group-hover:text-[#c4ffff]" />
              <span className="uppercase tracking-widest">linkedin/sys-void</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
