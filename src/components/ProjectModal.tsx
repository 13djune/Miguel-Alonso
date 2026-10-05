import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, ChevronLeft, ChevronRight, Info, ZoomIn, Maximize2 } from "lucide-react";
import { Project } from "../types";
import GarmentViewer from "./GarmentViewer";
import { useLanguage } from "../context/LanguageContext";
import StarBorder from "./StarBorder";
import IndustryBentoGallery from "./IndustryBentoGallery";
interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onNextProject?: () => void;
  onPrevProject?: () => void;
  currentProjectIndex?: number;
  totalProjects?: number;
}
export default function ProjectModal({
  project,
  onClose,
  onNextProject,
  onPrevProject,
  currentProjectIndex = 0,
  totalProjects = 1,
}: ProjectModalProps) {
  const isIndustry = Boolean(project.garments && project.garments.length > 0);
  const [show3D, setShow3D] = useState(false);
  useEffect(() => {
    setShow3D(false);
    if (isIndustry) return;
    const timer = setTimeout(() => setShow3D(true), 1600);
    return () => clearTimeout(timer);
  }, [project, isIndustry]);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Interactive Zoom & Pan state for the Popup Lightbox
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel === 1) {
      setZoomLevel(2.5);
    } else {
      resetZoom();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomLevel <= 1) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Reset zoom whenever user changes image
  useEffect(() => {
    resetZoom();
  }, [selectedImageIndex]);

  // Keyboard navigation & zoom in popup
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeGallery();
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev + 1) % project.images.length : 0
        );
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev - 1 + project.images.length) % project.images.length : 0
        );
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((prev) => Math.min(prev + 0.5, 4));
      } else if (e.key === "-") {
        setZoomLevel((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPanOffset({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        resetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, project.images.length]);

  const { t, language } = useLanguage();
  const isES = language === 'es';
  const sections =
    project.sections && project.sections.length > 0
      ? project.sections
      : [{ id: "default", title: language === 'es' ? "DESCRIPCIÓN" : "DESCRIPTION", content: project.description }];
  useEffect(() => {
    setActiveSectionIndex(0);
    setSelectedImageIndex(null);
    setActiveHotspot(null);
    setActiveHeroIndex(0);
    resetZoom();
  }, [project.id]);
  const currentSection = sections[activeSectionIndex] || sections[0];
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        backgroundColor: "rgba(0,0,0,0)",
        duration: 0.5,
        ease: "power2.inOut",
      });
      gsap.from(".modal-content", {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.1,
        clearProps: "transform",
        onComplete: () => {},
      });
    });
    return () => ctx.revert();
  }, []);
  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.inOut",
      onComplete: onClose,
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
      setSelectedImageIndex(
        (selectedImageIndex - 1 + project.images.length) %
          project.images.length,
      );
    }
  };

  const nextHeroLook = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHeroIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevHeroLook = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHeroIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-[#070707]/50 flex flex-col z-50 overflow-y-auto scroll-smooth"
    >
      {" "}
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />{" "}
      <div className="scanlines" />{" "}
      <header className="sticky top-0 z-[100] bg-[#070707]/90 pt-2 sm:pt-4 md:pt-8 flex justify-between items-center border-b border-white pb-2 sm:pb-4 shrink-0 px-2 sm:px-4 md:px-8 gap-1.5 sm:gap-4 overflow-hidden">
        <div className="font-mono text-[8px] sm:text-[10px] text-white uppercase bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 border border-white flex items-center gap-1 sm:gap-2 truncate shrink-0">
          <span className="w-1.5 h-1.5 bg-white animate-pulse shrink-0"></span>
          <span className="hidden sm:inline truncate">{t("modal.sys.viewer")}</span>
          <span className="sm:hidden">{language === 'es' ? 'VISOR' : 'VIEWER'}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {onPrevProject && onNextProject && (
            <div
              tabIndex={-1}
              className="flex items-center gap-1 sm:gap-3 font-mono text-[9px] sm:text-xs text-white bg-black/50 border border-white px-1.5 sm:px-3 py-0.5 sm:py-1 shadow-[2px_2px_0px_rgba(255,255,255,0.2)] outline-none focus:outline-none select-none cursor-default"
            >
              <button
                type="button"
                onClick={onPrevProject}
                aria-label="Previous project"
                className="cursor-target bg-white/10 hover:bg-[#c4ffff] hover:text-black border border-white transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_10px_rgba(255,255,255,0.4)] active:scale-95 active:opacity-80 cursor-crosshair text-[10px] sm:text-sm md:text-base font-bold flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 leading-none focus:outline-none focus:ring-1 focus:ring-[#c4ffff]"
                style={{ textShadow: "0 0 8px rgba(255, 255, 255,0)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textShadow = "0 0 8px #ffffff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textShadow =
                    "0 0 8px rgba(255, 255, 255,0)")
                }
              >
                &lt;
              </button>
              <span className="whitespace-nowrap px-0.5 select-none pointer-events-none">
                {currentProjectIndex + 1} / {totalProjects}
              </span>
              <button
                type="button"
                onClick={onNextProject}
                aria-label="Next project"
                className="cursor-target bg-white/10 hover:bg-[#c4ffff] hover:text-black border border-white transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_10px_rgba(255,255,255,0.4)] active:scale-95 active:opacity-80 cursor-crosshair text-[10px] sm:text-sm md:text-base font-bold flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 leading-none focus:outline-none focus:ring-1 focus:ring-[#c4ffff]"
                style={{ textShadow: "0 0 8px rgba(255, 255, 255,0)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textShadow = "0 0 8px #ffffff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textShadow =
                    "0 0 8px rgba(255, 255, 255,0)")
                }
              >
                &gt;
              </button>
            </div>
          )}
          <StarBorder as="button" color="#ffffff" speed="3s" className="p-0 shrink-0">
            <div
              onClick={handleClose}
              className="font-mono text-[9px] sm:text-xs text-black bg-white px-2.5 sm:px-4 py-1 sm:py-2 uppercase font-bold hover:bg-white transition-colors cursor-crosshair flex items-center whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t("modal.terminate")}</span>
              <span className="sm:hidden">{language === 'es' ? 'SALIR' : 'EXIT'}</span>
            </div>
          </StarBorder>
        </div>
      </header>
      <div
        ref={contentRef}
        className="w-full flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 pb-12 relative z-10 pt-4 md:pt-8 px-3 sm:px-4 md:px-8"
      >
        {/* 3D Garment Viewer: Only for Creative Universe projects, NEVER for Industry */}
        {!isIndustry && (
          <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 relative lg:sticky lg:top-28 xl:top-32 self-start h-[42vh] sm:h-[50vh] lg:h-[75vh] min-h-[280px] max-h-[800px] z-20 order-1 lg:order-2 shadow-lg lg:shadow-none">
            <div className="w-full h-full">
              <div className="modal-content relative w-full h-full border border-white bg-black/90 flex flex-col shadow-[4px_4px_0px_rgba(255,255,255,0.15)] lg:shadow-[8px_8px_0px_rgba(255,255,255,0.15)] overflow-hidden">
                <div className="absolute top-0 left-0 z-20 bg-white text-black font-mono text-[9px] sm:text-[10px] md:text-xs font-bold px-3 sm:px-4 py-1.5 uppercase tracking-widest">
                  {t("modal.3d.mode")}
                </div>
                <div className="absolute inset-0 pt-8 pb-8 sm:pt-10 sm:pb-10 cursor-crosshair transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] group">
                  {show3D ? (
                    <GarmentViewer modelUrl={project.modelUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-white animate-pulse">
                      {language === 'es' ? 'CARGANDO MODELO 3D...' : 'LOADING 3D MODEL...'}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 z-20 bg-black/90 border-t border-l border-white text-white font-mono text-[8px] sm:text-[9px] md:text-[10px] px-2.5 py-1 sm:px-3 sm:py-1.5 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white animate-pulse"></span>
                  {t("modal.3d.controls")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left Col: Info & Gallery (Takes full width in Industry projects) */}
        <div className={`flex flex-col w-full ${!isIndustry ? 'lg:flex-1 min-w-0' : ''} space-y-6 md:space-y-8 modal-content order-2 lg:order-1`}>
          <div className="border border-white p-3 sm:p-6 md:p-8 bg-black/85 relative shadow-[4px_4px_0px_rgba(255,255,255,0.08)]">
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-t-2 border-r-2 border-white"></div>
            
            {/* Category / System pill */}
            <div className="font-mono text-[9px] sm:text-[10px] text-[#c4ffff] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
              <span>{isIndustry ? (isES ? "// SISTEMA INDUSTRIA // CATÁLOGO TÉCNICO" : "// INDUSTRY SYSTEM // TECHNICAL CATALOG") : (isES ? "// SISTEMA CREATIVO // ARCHIVO EXPERIMENTAL" : "// CREATIVE SYSTEM // EXPERIMENTAL ARCHIVE")}</span>
            </div>

            <h2
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-4 sm:mb-6 tracking-tighter drop-shadow-sm break-words"
              style={{ color: "#ffffff", textShadow: `0 0 20px rgba(255,255,255,0.3)` }}
            >
              {project.title}
            </h2>

            {/* Prominent Project Description Block */}
            {project.description && (
              <div className="border-l-2 border-[#c4ffff] bg-white/[0.03] p-3.5 sm:p-5 mb-6 relative">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#c4ffff] mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>{isES ? "// MANIFIESTO CONCEPTUAL & SILUETA" : "// CONCEPT STATEMENT & SILHOUETTE"}</span>
                  </span>
                  <span className="text-white/40 text-[8px] font-mono">[SYS.MEM]</span>
                </div>
                <p className="font-mono text-xs sm:text-sm md:text-[15px] text-white/95 leading-relaxed md:leading-loose">
                  {project.description}
                </p>
              </div>
            )}

            {/* Tech Specs & Tools Grid (Hide generic tags if industry project has dedicated tag filter below) */}
            <div className={`grid ${project.garments && project.garments.length > 0 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3 sm:gap-4 mb-6`}>
              {(!project.garments || project.garments.length === 0) && (
                <div className="border border-white/40 bg-black/60 p-3 sm:p-4">
                  <h4 className="font-mono text-[9px] sm:text-[10px] text-[#c4ffff] uppercase tracking-widest mb-2.5 border-b border-white/20 pb-1.5 flex items-center justify-between">
                    <span>{isES ? "// ESPECIFICACIONES & TAGS" : "// SPECIFICATIONS & TAGS"}</span>
                    <span className="text-[8px] text-white/40 font-mono">[TAGS]</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags?.map((tag, i) => (
                      <span
                        key={`tag-${i}`}
                        className="font-mono text-[9px] sm:text-[10px] text-white/90 border border-white/30 px-2 py-0.5 sm:py-1 uppercase tracking-wider bg-white/[0.04]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="border border-white/40 bg-black/60 p-3 sm:p-4">
                <h4 className="font-mono text-[9px] sm:text-[10px] text-[#c4ffff] uppercase tracking-widest mb-2.5 border-b border-white/20 pb-1.5 flex items-center justify-between">
                  <span>{isES ? "// SOFTWARE & MÉTODOS 3D" : "// 3D PIPELINE & TOOLING"}</span>
                  <span className="text-[8px] text-white/40 font-mono">[PIPELINE]</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools?.map((tool, i) => (
                    <span
                      key={`tool-${i}`}
                      className="font-mono text-[9px] sm:text-[10px] text-white/90 border border-white/30 px-2 py-0.5 sm:py-1 uppercase tracking-wider bg-white/[0.04]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modular Structural Sections */}
            {sections && sections.length > 0 && (
              <div className="border border-white/40 bg-black/60 p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/25 pb-2.5 mb-3.5">
                  <div className="font-mono text-[10px] sm:text-xs text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
                    <span className="font-bold text-[#c4ffff]">
                      {isES ? "// DESGLOSE TÉCNICO & PATRONAJE" : "// TECHNICAL BREAKDOWN & PATTERN"}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] sm:text-[10px] text-white/50">
                    [ {activeSectionIndex + 1} / {sections.length} ]
                  </span>
                </div>

                {/* Tab buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {sections.map((s, idx) => {
                    const isActive = activeSectionIndex === idx;
                    return (
                      <button
                        key={s.id || idx}
                        type="button"
                        onClick={() => setActiveSectionIndex(idx)}
                        className={`font-mono text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1.5 border transition-all uppercase flex items-center gap-1.5 cursor-crosshair ${
                          isActive
                            ? "bg-white text-black font-bold border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                            : "bg-black/60 text-white/70 border-white/30 hover:border-white hover:text-white"
                        }`}
                      >
                        {isActive && <span className="text-[10px] text-black">►</span>}
                        <span>{s.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Section Content */}
                <div className="border-t border-white/20 pt-3.5 bg-white/[0.02] p-3 sm:p-4">
                  <h3 className="text-white text-sm sm:text-base md:text-lg font-bold font-mono mb-2 flex items-center gap-2">
                    <span className="text-[#c4ffff] font-mono">&gt;</span>
                    <span>{currentSection.title}</span>
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm md:text-base font-mono leading-relaxed md:leading-loose">
                    {currentSection.content}
                  </p>
                </div>
              </div>
            )}
          </div>
          {project.garments && project.garments.length > 0 ? (
            <div className="w-full mt-2">
              <IndustryBentoGallery
                garments={project.garments}
                availableFilterTags={project.filterTags}
                projectTitle={project.title}
              />
            </div>
          ) : (
            <div>
              <div className="border border-white/30 bg-black/60 p-2.5 sm:p-3 flex justify-between items-center mb-3">
                <span className="font-mono text-[9px] sm:text-[10px] text-[#c4ffff] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
                  <span>{isES ? "// REGISTRO FOTOGRÁFICO Y RENDERIZADO COMPLETO" : "// COMPLETE PHOTOGRAPHIC & RENDER ARCHIVE"}</span>
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] text-white/50">
                  [{project.images.length} {isES ? "ARCHIVOS" : "FILES"}]
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {project.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveHeroIndex(idx);
                      openGallery(idx);
                    }}
                    className={`border transition-all cursor-crosshair group relative overflow-hidden bg-black/90 p-1.5 sm:p-2 ${
                      activeHeroIndex === idx
                        ? "border-[#c4ffff] shadow-[0_0_12px_rgba(196,255,255,0.4)]"
                        : "border-white/50 hover:border-white"
                    } ${idx === 0 ? "col-span-2 aspect-video" : "aspect-[3/4]"}`}
                  >
                    <div className="w-full h-full relative overflow-hidden bg-black/80 flex items-center justify-center">
                      {/* Top-left: Look index badge */}
                      <div className="absolute top-2 left-2 z-20 font-mono text-[8px] sm:text-[9px] bg-black/90 text-[#c4ffff] border border-[#c4ffff]/60 px-1.5 py-0.5 uppercase tracking-wider font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                        LOOK {(idx + 1).toString().padStart(2, '0')}
                      </div>

                      {/* Top-right: Subtle expand / corner indicator */}
                      <div className="absolute top-2 right-2 z-20 bg-black/80 border border-white/40 group-hover:border-[#c4ffff] text-white/70 group-hover:text-[#c4ffff] p-1 transition-all pointer-events-none shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                        <Maximize2 size={11} />
                      </div>

                      {/* Bottom-right: Subtle 'click-to-zoom' / 'pinch-to-zoom' indicator badge */}
                      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-black/85 border border-white/40 group-hover:border-[#c4ffff] px-1.5 sm:px-2 py-0.5 text-white/80 group-hover:text-[#c4ffff] transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-none">
                        <ZoomIn size={11} className="text-[#c4ffff] shrink-0 animate-pulse" />
                        <span className="font-mono text-[7.5px] sm:text-[8.5px] uppercase tracking-wider font-bold">
                          {isES ? "CLICK // ZOOM" : "CLICK // ZOOM"}
                        </span>
                      </div>

                      {/* Hover overlay hint */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                        <span className="font-mono text-[9px] sm:text-[10px] md:text-xs font-bold text-white bg-black/95 border border-[#c4ffff] text-[#c4ffff] px-3 py-1.5 uppercase tracking-widest shadow-[0_0_12px_rgba(196,255,255,0.6)] flex items-center gap-1.5">
                          <ZoomIn size={12} />
                          <span>{t("modal.expand")} [ZOOM]</span>
                        </span>
                      </div>

                      <img
                        src={img}
                        alt={`${project.title} - look ${idx + 1}`}
                        className="w-full h-full object-contain sm:object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.dataset.triedFallback) return;
                          target.dataset.triedFallback = "true";
                          const num = idx + 1;
                          if (project.title.includes('REGNUM') || project.id === '1') {
                            target.src = `/assets/img/REGNUM/regnum_${num}.png`;
                          } else if (project.title.includes('P3RMFRST') || project.id === '2') {
                            target.src = `/assets/img/P3RMFRST/p3rmfrst_${num}.png`;
                          }
                        }}
                      />
                      {/* Hotspots mini view */}
                      {project.hotspots &&
                        project.hotspots[idx] &&
                        project.hotspots[idx].map((hotspot, hIdx) => (
                          <div
                            key={hIdx}
                            className="absolute z-20 w-3 h-3 md:w-4 md:h-4 border border-[#c4ffff] bg-black/80 shadow-[0_0_10px_rgba(196,255,255,0.8)]"
                            style={{
                              top: `${hotspot.y}%`,
                              left: `${hotspot.x}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          ></div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>{" "}
      {/* High-Tech Interactive Zoom & Pan Lightbox Popup */}
      {selectedImageIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-[#050505]/98 flex flex-col justify-between overflow-hidden select-none animate-fadeIn"
            onClick={closeGallery}
          >
            {/* Ambient Background Grid & Scanlines */}
            <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />
            <div className="scanlines pointer-events-none" />

            {/* Top Tactical Control Header */}
            <div
              className="relative z-[120] w-full bg-black/90 border-b border-white/30 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Look Identifier */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="w-2 h-2 bg-[#c4ffff] animate-pulse"></span>
                <span className="font-mono text-[9px] sm:text-xs font-bold text-white uppercase tracking-widest">
                  {isES
                    ? `LOOKBOOK HD // LOOK ${(selectedImageIndex + 1).toString().padStart(2, '0')} / ${project.images.length.toString().padStart(2, '0')}`
                    : `HD LOOKBOOK // LOOK ${(selectedImageIndex + 1).toString().padStart(2, '0')} / ${project.images.length.toString().padStart(2, '0')}`}
                </span>
                <span className="hidden md:inline font-mono text-[9px] text-[#c4ffff]/80 border border-[#c4ffff]/30 px-1.5 py-0.5 uppercase">
                  {project.title}
                </span>
              </div>

              {/* Center: Zoom Controls Toolbar */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.05] border border-white/30 px-2 py-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  title={isES ? "Alejar zoom (-)" : "Zoom out (-)"}
                  className="font-mono text-xs sm:text-sm px-2 py-0.5 text-white hover:text-[#c4ffff] disabled:opacity-30 disabled:hover:text-white cursor-crosshair font-bold transition-colors"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  title={isES ? "Restablecer zoom 100% (0)" : "Reset zoom 100% (0)"}
                  className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 bg-black border border-white/40 text-[#c4ffff] font-bold tracking-wider hover:bg-white hover:text-black transition-colors"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 4}
                  title={isES ? "Acercar zoom (+)" : "Zoom in (+)"}
                  className="font-mono text-xs sm:text-sm px-2 py-0.5 text-white hover:text-[#c4ffff] disabled:opacity-30 disabled:hover:text-white cursor-crosshair font-bold transition-colors"
                >
                  +
                </button>
                <span className="hidden lg:inline-block font-mono text-[8px] text-white/40 border-l border-white/20 pl-2 ml-1">
                  {isES ? "RUEDA / DOBLE CLICK / ARRASTRAR" : "WHEEL / DOUBLE CLICK / DRAG"}
                </span>
              </div>

              {/* Right: Close Button */}
              <div className="shrink-0">
                <StarBorder as="button" color="#ffffff" speed="3s" className="p-0">
                  <div
                    onClick={closeGallery}
                    className="font-mono text-[10px] sm:text-xs text-black bg-white px-3 sm:px-4 py-1 sm:py-1.5 uppercase font-bold hover:bg-[#c4ffff] transition-colors cursor-crosshair flex items-center gap-1.5"
                  >
                    <span>{isES ? "CERRAR" : "CLOSE"}</span>
                    <span>✕</span>
                  </div>
                </StarBorder>
              </div>
            </div>

            {/* Central Interactive Zoom Viewport */}
            <div
              className={`relative flex-1 w-full h-full flex items-center justify-center overflow-hidden ${
                zoomLevel > 1 ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
              }`}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous / Next Arrow Controls */}
              {project.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Previous look"
                    className="cursor-target absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/85 border border-white hover:border-[#c4ffff] hover:bg-[#c4ffff] hover:text-black text-white font-mono text-sm sm:text-base font-bold flex items-center justify-center transition-all z-[115] shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-crosshair"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next look"
                    className="cursor-target absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/85 border border-white hover:border-[#c4ffff] hover:bg-[#c4ffff] hover:text-black text-white font-mono text-sm sm:text-base font-bold flex items-center justify-center transition-all z-[115] shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-crosshair"
                  >
                    &gt;
                  </button>
                </>
              )}

              {/* Scalable and Pannable Image Container */}
              <div
                className="relative inline-block max-w-[90vw] max-h-[72vh] flex items-center justify-center will-change-transform"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transition: isPanning ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <img
                  src={project.images[selectedImageIndex]}
                  alt={`${project.title} - Look ${selectedImageIndex + 1}`}
                  className="max-w-[90vw] max-h-[72vh] object-contain border border-white/60 shadow-[0_0_50px_rgba(0,0,0,0.95)] pointer-events-none select-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.dataset.triedFallback) return;
                    target.dataset.triedFallback = "true";
                    const num = selectedImageIndex + 1;
                    if (project.title.includes('REGNUM') || project.id === '1') {
                      target.src = `/assets/img/REGNUM/regnum_${num}.png`;
                    } else if (project.title.includes('P3RMFRST') || project.id === '2') {
                      target.src = `/assets/img/P3RMFRST/p3rmfrst_${num}.png`;
                    }
                  }}
                />

                {/* Hotspots overlay */}
                {project.hotspots &&
                  project.hotspots[selectedImageIndex] &&
                  project.hotspots[selectedImageIndex].map((hotspot, hIdx) => {
                    const hotspotId = `${selectedImageIndex}-${hIdx}`;
                    const isActive = activeHotspot === hotspotId;
                    return (
                      <div
                        key={hIdx}
                        className="absolute z-20 pointer-events-auto"
                        style={{
                          top: `${hotspot.y}%`,
                          left: `${hotspot.x}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspot(isActive ? null : hotspotId);
                        }}
                      >
                        <div className="relative group cursor-crosshair">
                          <div
                            className={`w-6 h-6 border-2 ${
                              isActive ? "border-[#c4ffff] bg-[#c4ffff]/30" : "border-white bg-black/70"
                            } rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(196,255,255,0.7)] transition-colors`}
                          >
                            <span className="w-2 h-2 bg-[#c4ffff] rounded-full animate-ping"></span>
                          </div>
                          {isActive && (
                            <div
                              className="absolute top-1/2 left-8 -translate-y-1/2 w-64 bg-black/95 border border-[#c4ffff] p-3 shadow-2xl pointer-events-auto z-30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-1.5 border-b border-white/30 pb-1">
                                <h4 className="font-mono text-xs font-bold text-[#c4ffff] uppercase pr-2">
                                  {hotspot.title}
                                </h4>
                                <button
                                  type="button"
                                  className="text-white/60 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveHotspot(null);
                                  }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <p className="font-mono text-[10px] text-white/90 leading-relaxed">
                                {hotspot.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Thumbnails Strip Bar */}
            <div
              className="relative z-[120] w-full bg-black/95 border-t border-white/30 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto shadow-[0_-4px_20px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                {project.images.map((img, idx) => {
                  const isActive = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 border transition-all shrink-0 cursor-crosshair overflow-hidden bg-black/80 ${
                        isActive
                          ? "border-[#c4ffff] shadow-[0_0_10px_#c4ffff] scale-105"
                          : "border-white/30 hover:border-white opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Look ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.dataset.triedFallback) return;
                          target.dataset.triedFallback = "true";
                          const num = idx + 1;
                          if (project.title.includes('REGNUM') || project.id === '1') {
                            target.src = `/assets/img/REGNUM/regnum_${num}.png`;
                          } else if (project.title.includes('P3RMFRST') || project.id === '2') {
                            target.src = `/assets/img/P3RMFRST/p3rmfrst_${num}.png`;
                          }
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] font-mono text-white px-1">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="font-mono text-[9px] text-[#c4ffff] uppercase tracking-wider shrink-0 hidden sm:block">
                [ {selectedImageIndex + 1} / {project.images.length} ARCHIVOS ]
              </div>
            </div>
          </div>,
          document.body,
        )}{" "}
    </div>
  );
}
