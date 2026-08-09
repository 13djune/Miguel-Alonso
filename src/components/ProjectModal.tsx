import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Project } from '../types';
import GarmentViewer from './GarmentViewer';
import { useLanguage } from '../context/LanguageContext';
import LineSidebar from './LineSidebar';
import StarBorder from './StarBorder';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onNextProject?: () => void;
  onPrevProject?: () => void;
  currentProjectIndex?: number;
  totalProjects?: number;
}

export default function ProjectModal({ project, onClose, onNextProject, onPrevProject, currentProjectIndex = 0, totalProjects = 1 }: ProjectModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  
  const { t } = useLanguage();
  
  const sections = project.sections && project.sections.length > 0 
    ? project.sections 
    : [{ id: 'default', title: 'DESCRIPTION', content: project.description }];

  useEffect(() => {
    setActiveSectionIndex(0);
    setSelectedImageIndex(null);
    setActiveHotspot(null);
  }, [project.id]);
  
  const currentSection = sections[activeSectionIndex] || sections[0];

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
        delay: 0.1, clearProps: 'transform',
        onComplete: () => {
          gsap.to('.modal-content', {
            borderColor: 'rgba(196, 255, 255, 0.5)',
            boxShadow: '4px 4px 0px rgba(196,255,255,0.15)',
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            stagger: 0.1
          });
        }
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

  const openGallery = (index: number) => setSelectedImageIndex(index);
  const closeGallery = () => setSelectedImageIndex(null);
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % project.images.length);
    }
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + project.images.length) % project.images.length);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 bg-[#070707]/50 backdrop-blur-sm flex flex-col z-50 overflow-y-auto"
    >
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="scanlines" />
      
      <header className="sticky top-0 z-[100] bg-[#070707]/90 backdrop-blur-md pt-4 md:pt-8 flex justify-between items-center border-b border-[#c4ffff]/30 pb-4 shrink-0 px-4 md:px-8 gap-4 overflow-hidden">
        <div className="font-mono text-[10px] text-[#c4ffff] uppercase bg-[#c4ffff]/10 px-2 py-1 border border-[#c4ffff]/30 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
          {t('modal.sys.viewer')}
        </div>
                <div className="flex items-center gap-4">
          {onPrevProject && onNextProject && (
            <div className="flex items-center gap-3 font-mono text-xs text-[#c4ffff] bg-black/50 border border-[#c4ffff]/30 px-3 py-1 shadow-[2px_2px_0px_rgba(196,255,255,0.2)] hover:shadow-[0_0_8px_rgba(196,255,255,0.4)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 active:opacity-90 cursor-target">
              <button onClick={onPrevProject} className="cursor-target bg-[#c4ffff]/10 hover:bg-[#c4ffff] hover:text-black border border-[#c4ffff]/50 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_10px_rgba(196,255,255,0.4)] active:scale-95 active:opacity-80 cursor-crosshair text-sm md:text-base font-bold flex items-center justify-center w-6 h-6 md:w-7 md:h-7 leading-none" style={{ textShadow: "0 0 8px rgba(196,255,255,0)" }} onMouseEnter={(e) => e.currentTarget.style.textShadow = "0 0 8px #c4ffff"} onMouseLeave={(e) => e.currentTarget.style.textShadow = "0 0 8px rgba(196,255,255,0)"}>
                &lt;
              </button>
              <span>{currentProjectIndex + 1} / {totalProjects}</span>
              <button onClick={onNextProject} className="cursor-target bg-[#c4ffff]/10 hover:bg-[#c4ffff] hover:text-black border border-[#c4ffff]/50 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_10px_rgba(196,255,255,0.4)] active:scale-95 active:opacity-80 cursor-crosshair text-sm md:text-base font-bold flex items-center justify-center w-6 h-6 md:w-7 md:h-7 leading-none" style={{ textShadow: "0 0 8px rgba(196,255,255,0)" }} onMouseEnter={(e) => e.currentTarget.style.textShadow = "0 0 8px #c4ffff"} onMouseLeave={(e) => e.currentTarget.style.textShadow = "0 0 8px rgba(196,255,255,0)"}>
                &gt;
              </button>
            </div>
          )}
          <StarBorder as="button" color="#c4ffff" speed="3s" className="p-0">
          <div 
            onClick={handleClose} 
            className="font-mono text-xs text-black bg-[#c4ffff] px-4 py-2 uppercase font-bold hover:bg-white transition-colors cursor-crosshair flex items-center gap-2"
          >
            <X size={14} /> {t('modal.terminate')}
          </div>
        </StarBorder>
        </div>

      </header>

      <div ref={contentRef} className="w-full flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 pb-12 relative z-10 pt-8 max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Left Col: Info & Gallery */}
        <div className="flex flex-col w-full lg:flex-1 shrink-0 space-y-6 md:space-y-8 modal-content">
          <div className="border border-[#c4ffff]/30 p-5 md:p-10 bg-black/80 backdrop-blur-sm relative shadow-[4px_4px_0px_rgba(196,255,255,0.05)]">
            <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-[#c4ffff]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-[#c4ffff]"></div>
            
            <h2 
              className="text-4xl md:text-6xl font-bold uppercase mb-8 tracking-tighter drop-shadow-sm break-words"
              style={{ color: project.color, textShadow: `0 0 20px ${project.color}60` }}
            >
              {project.title}
            </h2>
            
            {/* Tech Specs & Tags Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="border border-[#c4ffff]/30 bg-black/50 p-4">
                <h4 className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-[#c4ffff]/30 pb-2">{t('sys.tags')}</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((tag, i) => (
                    <span key={`tag-${i}`} className="font-mono text-[10px] text-[#c4ffff] border border-[#c4ffff]/30 px-2 py-1 uppercase tracking-widest bg-black/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-[#c4ffff]/30 bg-black/50 p-4">
                <h4 className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-[#c4ffff]/30 pb-2">{t('sys.tools')}</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tools?.map((tool, i) => (
                    <span key={`tool-${i}`} className="font-mono text-[10px] text-gray-300 border border-gray-600 px-2 py-1 uppercase tracking-widest bg-black/80">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">
              <div className="w-full xl:w-1/3 border-b xl:border-b-0 xl:border-r border-[#c4ffff]/20 pb-6 xl:pb-0 xl:pr-6 flex flex-col justify-center h-full min-h-[250px]">
                <LineSidebar 
                  items={sections.map(s => s.title)} 
                  defaultActive={activeSectionIndex}
                  onItemClick={(index) => setActiveSectionIndex(index)}
                  showIndex={false}
                  itemGap={45}
                  fontSize={0.9}
                />
              </div>
              <div className="w-full xl:w-2/3">
                <div className="min-h-[140px]">
                  <h3 className="text-[#c4ffff] text-lg md:text-xl font-bold font-mono mb-4 flex items-center">
                    <span className="text-[#c4ffff] mr-3 opacity-50 text-sm">&gt;</span>
                    {currentSection.title}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base font-mono leading-relaxed md:leading-loose">
                    {currentSection.content}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {project.images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => openGallery(idx)}
                className={`border border-[#c4ffff]/30 bg-black/80 p-1 md:p-2 cursor-crosshair group relative overflow-hidden shadow-[4px_4px_0px_rgba(196,255,255,0.05)] ${idx === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}
              >
                <div className="w-full h-full relative overflow-hidden bg-black/50">
                  <div className="absolute inset-0 bg-[#c4ffff]/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-sm">
                    <span className="font-mono text-[10px] md:text-xs font-bold text-[#c4ffff] bg-black border border-[#c4ffff] px-3 py-1.5 uppercase tracking-widest">{t('modal.expand')}</span>
                  </div>
                  <img src={img} alt={`${project.title} - view ${idx}`} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" />
                  
                  {/* Hotspots mini view */}
                  {project.hotspots && project.hotspots[idx] && project.hotspots[idx].map((hotspot, hIdx) => (
                    <div 
                      key={hIdx}
                      className="absolute z-20 w-3 h-3 md:w-4 md:h-4 border border-[#c4ffff] bg-black/80 shadow-[0_0_10px_rgba(196,255,255,0.5)]"
                      style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%`, transform: 'translate(-50%, -50%)' }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: 3D Garment Viewer */}
        <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 mt-4 lg:mt-0 sticky top-20 md:top-24 lg:top-32 self-start h-[50vh] lg:h-[75vh] min-h-[300px] max-h-[800px] z-[50] order-first lg:order-none shadow-2xl lg:shadow-none">
          <div className="w-full h-full">
            <div className="modal-content relative w-full h-full border border-[#c4ffff]/30 bg-black/90 flex flex-col shadow-[4px_4px_0px_rgba(196,255,255,0.15)] lg:shadow-[8px_8px_0px_rgba(196,255,255,0.15)] overflow-hidden">
          <div className="absolute top-0 left-0 z-20 bg-[#c4ffff] text-black font-mono text-[10px] md:text-xs font-bold px-4 py-1.5 uppercase tracking-widest">
            {t('modal.3d.mode')}
          </div>
          <div className="absolute inset-0 pt-10 pb-10 cursor-crosshair transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_20px_rgba(196,255,255,0.6)] hover:drop-shadow-[0_0_8px_rgba(196,255,255,0.8)] active:scale-95 active:opacity-90 group">
            <GarmentViewer modelUrl={project.modelUrl} />
          </div>
          <div className="absolute bottom-0 right-0 z-20 bg-black/90 border-t border-l border-[#c4ffff]/30 text-[#c4ffff] font-mono text-[9px] md:text-[10px] px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-widest flex items-center gap-3 backdrop-blur-md">
            <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span> {t('modal.3d.controls')}
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* Fullscreen Image Gallery */}
      {selectedImageIndex !== null && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#070707]/95 flex flex-col justify-center items-center backdrop-blur-sm" onClick={closeGallery}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2ZmMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>
          
          <div className="absolute top-4 md:top-8 right-4 md:right-8 z-[110]">
            <StarBorder as="button" color="#c4ffff" speed="3s" className="p-0">
              <div 
                onClick={closeGallery}
                className="font-mono text-xs text-black bg-[#c4ffff] px-4 py-2 uppercase font-bold hover:bg-white transition-colors cursor-crosshair"
              >
                {t('modal.close.view')}
              </div>
            </StarBorder>
          </div>
          
          <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-[110]">
            <StarBorder as="button" color="#c4ffff" speed="3s" className="p-0">
              <div 
                onClick={prevImage}
                className="bg-black p-2 md:p-4 text-[#c4ffff] hover:bg-white hover:text-black transition-colors cursor-crosshair"
              >
                <ChevronLeft size={32} />
              </div>
            </StarBorder>
          </div>
          
          <div className="w-full max-w-5xl px-16 max-h-[80vh] flex items-center justify-center relative z-[105]" onClick={e => e.stopPropagation()}>
            <div className="relative inline-block max-w-full max-h-[80vh]">
              <img 
                src={project.images[selectedImageIndex]} 
                alt="Expanded view" 
                className="max-w-full max-h-[80vh] object-contain border border-[#c4ffff]/30 shadow-[0_0_30px_rgba(196,255,255,0.1)]"
              />
              
              {/* Hotspots overlay */}
              {project.hotspots && project.hotspots[selectedImageIndex] && project.hotspots[selectedImageIndex].map((hotspot, hIdx) => {
                const hotspotId = `${selectedImageIndex}-${hIdx}`;
                const isActive = activeHotspot === hotspotId;
                
                return (
                  <div 
                    key={hIdx}
                    className="absolute z-20"
                    style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(isActive ? null : hotspotId);
                    }}
                  >
                    <div className="relative group cursor-crosshair">
                      <div className={`w-6 h-6 border-2 ${isActive ? 'border-white bg-[#c4ffff]/20' : 'border-[#c4ffff] bg-black/60'} rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(196,255,255,0.5)] transition-colors`}>
                        <span className={`w-2 h-2 ${isActive ? 'bg-white' : 'bg-[#c4ffff]'} rounded-full animate-ping`}></span>
                      </div>
                      
                      {isActive && (
                        <div className="absolute top-1/2 left-8 -translate-y-1/2 w-64 bg-black/90 border border-[#c4ffff] p-4 shadow-2xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                          <div className="absolute top-0 right-0 w-2 h-2 border-b border-l border-[#c4ffff]"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-t border-r border-[#c4ffff]"></div>
                          <button 
                            className="absolute top-1 right-1 text-[#c4ffff] hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot(null);
                            }}
                          >
                            <X size={12} />
                          </button>
                          <h4 className="font-mono text-xs font-bold text-[#c4ffff] uppercase mb-2 border-b border-[#c4ffff]/30 pb-2 pr-4">{hotspot.title}</h4>
                          <p className="font-mono text-[10px] text-gray-300 leading-relaxed">{hotspot.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute bottom-[-3rem] left-0 w-full text-center font-mono text-[10px] text-[#c4ffff] bg-[#c4ffff]/10 border border-[#c4ffff]/30 py-1 inline-block mx-auto max-w-fit px-4">
              <span className="animate-pulse mr-2">_</span>
              IMG_{selectedImageIndex + 1} // {project.images.length}
            </div>
          </div>
          
          <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-[110]">
            <StarBorder as="button" color="#c4ffff" speed="3s" className="p-0">
              <div 
                onClick={nextImage}
                className="bg-black p-2 md:p-4 text-[#c4ffff] hover:bg-white hover:text-black transition-colors cursor-crosshair"
              >
                <ChevronRight size={32} />
              </div>
            </StarBorder>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
