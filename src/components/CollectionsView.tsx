import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CollectionsViewProps {
  projects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export default function CollectionsView({ projects, onClose, onSelectProject }: CollectionsViewProps) {
  const { t } = useLanguage();

  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md pointer-events-auto animate-fade-in-up"
    >
      <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col border border-[#c4ffff]/30 bg-black/90 font-mono shadow-[0_0_30px_rgba(196,255,255,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#c4ffff]/30">
          <div className="text-[#c4ffff] uppercase tracking-widest text-sm font-bold flex items-center gap-3">
            <span className="w-2 h-2 bg-[#c4ffff] animate-pulse"></span>
            {t('overlay.nav.collections')}
          </div>
          <button 
            onClick={onClose} 
            className="text-[#c4ffff] hover:text-black hover:bg-[#c4ffff] px-3 py-1 uppercase text-xs transition-colors border border-transparent hover:border-[#c4ffff]"
          >
            {t('modal.close.view')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="mb-8">
            <h2 className="text-[#ff3399] tracking-widest uppercase text-xl font-bold mb-4 border-b border-[#ff3399]/30 pb-2">[ UNIVERSO: CREATIVO ]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creativeProjects.map((project, idx) => (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group relative flex flex-col border border-white/10 hover:border-[#ff3399]/50 transition-colors cursor-crosshair bg-white/5"
                >
                  <div className="aspect-video w-full overflow-hidden border-b border-white/10 group-hover:border-[#ff3399]/30 relative">
                    <img 
                      src={project.images[0]} 
                      alt={project.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                  </div>
                  <div className="p-4 flex flex-col gap-2 relative z-10 bg-black/40 group-hover:bg-transparent transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] text-[#ff3399]/70 tracking-widest uppercase font-bold">
                        IDX_{String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] px-2 py-0.5 border border-[#ff3399]/30 text-[#ff3399] rounded-full">
                        {project.tags?.[0] || "CONCEPT"}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider mt-1">
                      {project.title.replace(/^[0-9]+ /, '')}
                    </div>
                  </div>
                  <div 
                    className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: project.color, boxShadow: `0 0 10px ${project.color}` }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-[#00ffcc] tracking-widest uppercase text-xl font-bold mb-4 border-b border-[#00ffcc]/30 pb-2">[ UNIVERSO: INDUSTRIA ]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {industryProjects.map((project, idx) => (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group relative flex flex-col border border-white/10 hover:border-[#00ffcc]/50 transition-colors cursor-crosshair bg-white/5"
                >
                  <div className="aspect-video w-full overflow-hidden border-b border-white/10 group-hover:border-[#00ffcc]/30 relative">
                    <img 
                      src={project.images[0]} 
                      alt={project.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                  </div>
                  <div className="p-4 flex flex-col gap-2 relative z-10 bg-black/40 group-hover:bg-transparent transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] text-[#00ffcc]/70 tracking-widest uppercase font-bold">
                        IDX_{String(idx + 5).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] px-2 py-0.5 border border-[#00ffcc]/30 text-[#00ffcc] rounded-full">
                        {project.tags?.[0] || "CONCEPT"}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider mt-1">
                      {project.title.replace(/^[0-9]+ /, '')}
                    </div>
                  </div>
                  <div 
                    className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: project.color, boxShadow: `0 0 10px ${project.color}` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
