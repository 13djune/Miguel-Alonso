import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ExternalLink, Instagram, Linkedin, Mail } from 'lucide-react';
import {
  DesignerIcon,
  SkillsIcon,
  ExperienceIcon,
  EducationIcon,
  AwardsIcon,
  ToolsIcon,
  ContactIcon,
  DownloadIcon,
  XIcon
} from './PixelIcons';
import { useLanguage } from '../context/LanguageContext';
import StarBorder from './StarBorder';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import AsciiImage from './AsciiImage';

interface RadarVertexDotProps {
  cx?: number;
  cy?: number;
  value?: number;
  index?: number;
  isLight?: boolean;
}

function RadarVertexDot({ cx, cy, value, index, isLight = false }: RadarVertexDotProps) {
  const [hovered, setHovered] = useState(false);

  if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) {
    return null;
  }

  return (
    <g
      key={`vertex-dot-${index}`}
      className="radar-vertex-group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ pointerEvents: 'all', cursor: 'crosshair' }}
    >
      {/* Invisible hover hitbox covering vertex area */}
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill="transparent"
        className="radar-vertex-hitbox"
        style={{ pointerEvents: 'all', cursor: 'crosshair' }}
      />
      {/* Vertex dot - ONLY visible when hovering over the vertex */}
      <circle
        cx={cx}
        cy={cy}
        r={hovered ? 4.5 : 0}
        fill={isLight ? "#0055ff" : "#c4ffff"}
        stroke={isLight ? "#000000" : "#ffffff"}
        strokeWidth={1.5}
        className="transition-all duration-150"
        style={{
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
          filter: hovered ? (isLight ? 'drop-shadow(0 0 6px rgba(0, 85, 255, 0.8))' : 'drop-shadow(0 0 6px rgba(196, 255, 255, 0.95))') : 'none',
        }}
      />
      {/* Mini score HUD pill that appears with the vertex dot */}
      {hovered && (
        <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <rect
            x={cx - 16}
            y={cy - 22}
            width={32}
            height={15}
            fill={isLight ? "#ffffff" : "#000000"}
            stroke={isLight ? "#0055ff" : "#c4ffff"}
            strokeWidth={1}
            rx={1}
          />
          <text
            x={cx}
            y={cy - 11}
            textAnchor="middle"
            fill={isLight ? "#0055ff" : "#c4ffff"}
            fontSize={9}
            fontFamily="monospace"
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {typeof value === 'number' ? value.toFixed(1) : value}
          </text>
        </g>
      )}
    </g>
  );
}

interface DesignerModalProps {
  onClose: () => void;
  isLight?: boolean;
}

export default function DesignerModal({ onClose, isLight = false }: DesignerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const skillsData = [
    { subject: t('skill.3d'), A: 4, fullMark: 5 },
    { subject: t('skill.pattern'), A: 4.2, fullMark: 5 },
    { subject: t('skill.render'), A: 4, fullMark: 5 },
    { subject: t('skill.anim'), A: 2, fullMark: 5 },
    { subject: t('skill.texture'), A: 3.8, fullMark: 5 },
    { subject: t('skill.art'), A: 3.8, fullMark: 5 },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        backgroundColor: 'rgba(0,0,0,0)',
        duration: 0.5,
        ease: 'power2.inOut',
      });
      gsap.from('.modal-content', {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1,
      });
      gsap.from('.animate-stagger-item', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.5,
      });
    });
    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.inOut',
      onComplete: onClose,
    });
  };

  const cardBorderClass = isLight ? 'border-black' : 'border-white';
  const cardBgClass = isLight 
    ? 'bg-white border-black text-black shadow-[4px_4px_0px_rgba(0,0,0,0.9)]' 
    : 'bg-black/80 border-white text-white shadow-[4px_4px_0px_rgba(255,255,255,0.05)]';

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 flex flex-col z-50 overflow-x-hidden overflow-y-auto ${
        isLight ? 'bg-white/98 text-black' : 'bg-[#070707]/95 text-white'
      }`}
    >
      <div className={`absolute inset-0 bg-cyber-grid pointer-events-none ${isLight ? 'opacity-30' : 'opacity-20'}`} />
      <div className="scanlines" />

      {/* Header */}
      <header className={`sticky top-0 z-[100] pt-3 sm:pt-4 md:pt-8 flex flex-row justify-between items-center border-b pb-3 sm:pb-4 shrink-0 px-3 sm:px-6 md:px-8 w-full gap-2 sm:gap-4 overflow-hidden backdrop-blur-md ${
        isLight ? 'bg-white/95 border-black text-black' : 'bg-[#070707]/90 border-white text-white'
      }`}>
        <div className={`font-mono text-[9px] sm:text-[10px] uppercase px-2 py-1 border flex items-center gap-1.5 sm:gap-2 truncate ${
          isLight ? 'bg-black/5 text-black border-black' : 'bg-white/10 text-white border-white'
        }`}>
          <span className={`w-1.5 h-1.5 ${isLight ? 'bg-black' : 'bg-white'} animate-pulse shrink-0`}></span>
          <span className="truncate">{t('sys.viewer')}</span>
        </div>
        <StarBorder as="button" color={isLight ? "#000000" : "#ffffff"} speed="3s" className="p-0 shrink-0">
          <div
            onClick={handleClose}
            className={`font-mono text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 uppercase font-bold transition-colors flex items-center cursor-crosshair whitespace-nowrap ${
              isLight ? 'bg-black text-white hover:bg-[#0055ff]' : 'bg-white text-black hover:bg-white'
            }`}
          >
            <span>{t('modal.terminate')}</span>
          </div>
        </StarBorder>
      </header>

      {/* Content */}
      <div
        ref={contentRef}
        className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col gap-6 md:gap-8 pb-12 relative z-10 pt-4 sm:pt-6 md:pt-8 px-3 sm:px-6 md:px-12 lg:px-20"
      >
        {/* Top Row: Main Info & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Main Info */}
          <div className={`lg:col-span-1 border p-4 sm:p-6 md:p-8 relative modal-content flex flex-col justify-between min-w-0 ${cardBgClass}`}>
            <div>
              <div className={`absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 ${cardBorderClass}`}></div>
              <div className={`absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 ${cardBorderClass}`}></div>
              <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start">
                <div className="w-28 sm:w-36 md:w-48 shrink-0 self-center sm:self-start">
                  <div className={`border ${cardBorderClass} ${isLight ? 'bg-[#f0f0f4]' : 'bg-black'} flex items-center justify-center overflow-hidden aspect-square`}>
                    <AsciiImage src="/designer.jpg" width={120} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl sm:text-2xl md:text-4xl font-bold uppercase mb-2 tracking-tighter flex items-center gap-2 sm:gap-3 flex-wrap break-words ${
                    isLight ? 'text-black' : 'text-white shadow-[#ffffff]/50 drop-shadow-sm'
                  }`}>
                    <DesignerIcon className={`${isLight ? 'text-black' : 'text-white'} shrink-0`} />
                    <span>{t('overlay.designer.title')}</span>
                  </h2>
                  <div className={`font-mono text-[10px] sm:text-xs inline-block px-2 sm:px-3 py-1 border mb-4 whitespace-nowrap ${
                    isLight ? 'bg-black/5 text-black border-black' : 'bg-white/10 text-white border-white'
                  }`}>
                    {t('designer.id')}
                  </div>
                  <p className={`text-xs md:text-sm leading-relaxed font-mono uppercase mb-6 sm:mb-8 pb-4 sm:pb-6 border-b break-words ${
                    isLight ? 'text-black border-black/30' : 'text-white border-white'
                  }`}>
                    {t('designer.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
              <StarBorder as="div" color={isLight ? "#000000" : "#ffffff"} speed="3s" className="w-full sm:w-1/2 p-0 cursor-pointer">
                <div className={`flex items-center justify-between w-full py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest relative group overflow-hidden cursor-crosshair ${
                  isLight ? 'bg-black text-white hover:bg-[#0055ff]' : 'bg-white text-black hover:bg-white'
                }`}>
                  <span className="relative z-10 truncate">{t('overlay.btn.portfolio')}</span>
                  <ExternalLink size={14} className="relative z-10 shrink-0 ml-1" />
                </div>
              </StarBorder>
              <StarBorder as="div" color={isLight ? "#000000" : "#ffffff"} speed="3s" className="w-full sm:w-1/2 p-0 cursor-pointer">
                <div className={`flex items-center justify-between w-full py-3 sm:py-4 px-4 sm:px-6 border text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-crosshair ${
                  isLight ? 'bg-white text-black border-black hover:bg-black/10' : 'bg-black border-white text-white hover:bg-white/10'
                }`}>
                  <span className="truncate">{t('overlay.btn.resume')}</span>
                  <DownloadIcon className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] shrink-0 ml-1" />
                </div>
              </StarBorder>
            </div>
          </div>

          {/* Skills Radar */}
          <div className={`lg:col-span-1 border p-4 sm:p-6 md:p-8 relative modal-content flex flex-col min-w-0 select-none ${cardBgClass}`}>
            <div className={`flex justify-between items-center mb-4 sm:mb-6 border-b pb-3 sm:pb-4 select-none ${isLight ? 'border-black/30' : 'border-white'}`}>
              <h3 className={`text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-widest flex items-center gap-2 sm:gap-3 truncate select-none ${isLight ? 'text-black' : 'text-white'}`}>
                <SkillsIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
                <span className="truncate">{t('skills.title')}</span>
              </h3>
            </div>
            <div className="flex-1 w-full flex items-center justify-center min-h-[260px] sm:min-h-[300px] md:min-h-[340px] select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="65%"
                  data={skillsData}
                  className="select-none"
                >
                  <PolarGrid stroke={isLight ? "#000000" : "#ffffff"} strokeOpacity={isLight ? 0.2 : 0.3} style={{ pointerEvents: 'none', userSelect: 'none' }} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: isLight ? '#000000' : '#ffffff', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} tick={false} axisLine={false} style={{ pointerEvents: 'none', userSelect: 'none' }} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke={isLight ? "#0055ff" : "#ffffff"}
                    strokeWidth={2}
                    fill={isLight ? "#0055ff" : "#ffffff"}
                    fillOpacity={isLight ? 0.35 : 0.2}
                    isAnimationActive={false}
                    dot={(dotProps: any) => (
                      <RadarVertexDot key={`radar-vertex-${dotProps.index}`} isLight={isLight} {...dotProps} />
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Middle Row: Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Experience */}
          <div className={`border p-4 sm:p-6 md:p-8 relative modal-content ${cardBgClass}`}>
            <div className={`flex justify-between items-center mb-6 sm:mb-8 border-b pb-3 sm:pb-4 gap-2 ${isLight ? 'border-black/30' : 'border-white'}`}>
              <h3 className={`text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-widest flex items-center gap-2 sm:gap-3 truncate ${isLight ? 'text-black' : 'text-white'}`}>
                <ExperienceIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
                <span className="truncate">{t('overlay.exp.title')}</span>
              </h3>
              <span className={`text-[9px] sm:text-[10px] animate-pulse shrink-0 font-bold ${isLight ? 'text-[#0055ff]' : 'text-white'}`}>■ REC</span>
            </div>
            <div className="space-y-6">
              {[
                { role: t('job.eme.role'), company: 'EME STUDIOS', period: language === 'es' ? '[24-ACTUAL]' : '[24-PRESENT]', link: 'https://emestudios.com/es/es/' },
                { role: t('job.leandro.role'), company: 'LEANDRO CANO', period: '[22-23]', link: 'https://www.leandrocano.com/' },
              ].map((job, i) => (
                <a
                  key={i}
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target block group cursor-crosshair animate-stagger-item"
                >
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <h4 className={`text-xs sm:text-sm font-bold font-mono transition-colors break-words ${isLight ? 'text-black group-hover:text-[#0055ff]' : 'text-white group-hover:text-white'}`}>
                      {job.company}
                    </h4>
                    <span className={`text-[9px] sm:text-[10px] font-mono whitespace-nowrap shrink-0 ${isLight ? 'text-black/60' : 'text-white'}`}>
                      {job.period}
                    </span>
                  </div>
                  <p className={`text-[10px] sm:text-xs font-mono flex items-center gap-2 break-words ${isLight ? 'text-black/80' : 'text-white'}`}>
                    <span className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${isLight ? 'text-[#0055ff]' : 'text-white'}`}>&gt;</span>
                    <span className="break-words">{job.role}</span>
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className={`border p-4 sm:p-6 md:p-8 relative modal-content ${cardBgClass}`}>
            <div className={`flex justify-between items-center mb-6 sm:mb-8 border-b pb-3 sm:pb-4 ${isLight ? 'border-black/30' : 'border-white'}`}>
              <h3 className={`text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-widest flex items-center gap-2 sm:gap-3 truncate ${isLight ? 'text-black' : 'text-white'}`}>
                <EducationIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
                <span className="truncate">{t('edu.title')}</span>
              </h3>
            </div>
            <div className="space-y-6">
              {[
                { degree: t('edu.degree'), school: t('edu.school'), period: '[20-24]', link: 'https://www.udit.es/' },
              ].map((edu, i) => (
                <a
                  key={i}
                  href={edu.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target block group cursor-crosshair animate-stagger-item"
                >
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <h4 className={`text-[10px] sm:text-xs font-bold font-mono transition-colors leading-tight line-clamp-2 break-words ${isLight ? 'text-black group-hover:text-[#0055ff]' : 'text-white group-hover:text-white'}`}>
                      {edu.school}
                    </h4>
                    <span className={`text-[9px] sm:text-[10px] font-mono whitespace-nowrap shrink-0 ${isLight ? 'text-black/60' : 'text-white'}`}>
                      {edu.period}
                    </span>
                  </div>
                  <p className={`text-[10px] sm:text-xs font-mono flex items-center gap-2 mt-1 break-words ${isLight ? 'text-black/80' : 'text-white'}`}>
                    <span className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${isLight ? 'text-[#0055ff]' : 'text-white'}`}>&gt;</span>
                    <span className="break-words">{edu.degree}</span>
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className={`border p-4 sm:p-6 md:p-8 relative modal-content ${cardBgClass}`}>
            <div className={`flex justify-between items-center mb-6 sm:mb-8 border-b pb-3 sm:pb-4 ${isLight ? 'border-black/30' : 'border-white'}`}>
              <h3 className={`text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-widest flex items-center gap-2 sm:gap-3 truncate ${isLight ? 'text-black' : 'text-white'}`}>
                <AwardsIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
                <span className="truncate">{t('awards.title')}</span>
              </h3>
            </div>
            <div className="space-y-6">
              <a
                href="https://manteco.com/esne-manteco-academys-2023-manteco-sustainability-award/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target block group cursor-crosshair animate-stagger-item"
              >
                <div className="flex justify-between items-baseline mb-1 gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold font-mono transition-colors leading-tight break-words ${isLight ? 'text-black group-hover:text-[#0055ff]' : 'text-white group-hover:text-white'}`}>
                    Manteco Sustainability Award
                  </h4>
                  <span className={`text-[9px] sm:text-[10px] font-mono whitespace-nowrap shrink-0 ${isLight ? 'text-black/60' : 'text-white'}`}>
                    [2023]
                  </span>
                </div>
                <p className={`text-[10px] sm:text-xs font-mono flex items-start gap-2 mt-2 leading-relaxed break-words ${isLight ? 'text-black/80' : 'text-white'}`}>
                  <span className={`opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0 ${isLight ? 'text-[#0055ff]' : 'text-white'}`}>&gt;</span>
                  <span dangerouslySetInnerHTML={{ __html: t('award.manteco') }} />
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Tools & Tech */}
        <div className={`border p-4 sm:p-6 relative modal-content ${cardBgClass}`}>
          <div className={`flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 border-b pb-3 sm:pb-4 ${isLight ? 'border-black/30' : 'border-white'}`}>
            <h3 className={`text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-widest flex items-center gap-2 sm:gap-3 truncate ${isLight ? 'text-black' : 'text-white'}`}>
              <ToolsIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
              <span className="truncate">{t('sys.tools')}</span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              'CLO 3D',
              'BLENDER',
              'MARVELOUS DESIGNER',
              'ADOBE SUITE',
              'NOMAD SCULPT',
              'FIGMA WEAVY',
            ].map((tool, i) => (
              <div
                key={i}
                className={`border px-2.5 sm:px-3 py-1 text-center select-none animate-stagger-item ${
                  isLight ? 'border-black bg-black/5' : 'border-white bg-white/5'
                }`}
              >
                <span className={`font-mono text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest whitespace-nowrap font-bold ${
                  isLight ? 'text-black' : 'text-white'
                }`}>
                  {tool}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Bar */}
        <div className={`border p-4 sm:p-6 relative modal-content flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mt-auto ${cardBgClass}`}>
          <h3 className={`text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-widest flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0 ${isLight ? 'text-black' : 'text-white'}`}>
            <ContactIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
            <span>{t('contact.title')}</span>
          </h3>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 flex-1 w-full md:w-auto">
            <a
              href="mailto:design@sys.void"
              className={`cursor-target flex items-center gap-2 font-mono text-[10px] sm:text-xs transition-colors group cursor-crosshair break-all font-bold ${
                isLight ? 'text-black hover:text-[#0055ff]' : 'text-white hover:text-white'
              }`}
            >
              <Mail size={13} className="shrink-0" />
              <span className="uppercase tracking-widest">design@sys.void</span>
            </a>
            <a
              href="#"
              className={`cursor-target flex items-center gap-2 font-mono text-[10px] sm:text-xs transition-colors group cursor-crosshair whitespace-nowrap font-bold ${
                isLight ? 'text-black hover:text-[#0055ff]' : 'text-white hover:text-white'
              }`}
            >
              <Instagram size={13} className="shrink-0" />
              <span className="uppercase tracking-widest">@sys.void.design</span>
            </a>
            <a
              href="https://www.linkedin.com/in/miguel-alonso-frutos-b4bb55272/"
              target="_blank"
              rel="noopener noreferrer"
              className={`cursor-target flex items-center gap-2 font-mono text-[10px] sm:text-xs transition-colors group cursor-crosshair whitespace-nowrap font-bold ${
                isLight ? 'text-black hover:text-[#0055ff]' : 'text-white hover:text-white'
              }`}
            >
              <Linkedin size={13} className="shrink-0" />
              <span className="uppercase tracking-widest">linkedin/sys-void</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
