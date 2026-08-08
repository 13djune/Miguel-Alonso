import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Download, Eye, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LineSidebar from './LineSidebar';
import StarBorder from './StarBorder';
import AsciiTree from './AsciiTree';

interface OverlayProps {
  onOpenDesigner?: () => void;
  onSelectProject?: (index: number) => void;
}

export default function Overlay({ onOpenDesigner, onSelectProject }: OverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, language, toggleLanguage } = useLanguage();
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-item', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5,
        onComplete: () => {
          gsap.to('.pulse-border', {
            borderColor: 'rgba(204, 255, 0, 0.6)',
            boxShadow: '0 0 15px rgba(204, 255, 0, 0.15)',
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            stagger: 0.2
          });
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col p-4 md:p-12 pointer-events-none relative z-10 overflow-hidden">
      
      {/* Header / Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center animate-item w-full border-b border-[#ccff00]/30 pb-3 md:pb-6 gap-3 md:gap-0">
        <div className="space-y-1 relative pl-2 md:pl-4 border-l-2 border-[#ccff00]">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white shadow-[#ccff00]/50 drop-shadow-md leading-none max-w-[280px] sm:max-w-none break-words">
            {t('overlay.title')}
          </h1>
          <p className="text-[9px] md:text-xs font-mono text-[#ccff00] tracking-widest uppercase bg-[#ccff00]/10 inline-block px-1.5 py-0.5 md:px-2 md:py-1">
            {t('overlay.subtitle')}
          </p>
          <div className="mt-4 pointer-events-auto">
            <StarBorder as="button" color="#ccff00" speed="3s" className="cursor-target p-0 shrink-0 inline-block">
              <div 
                onClick={onOpenDesigner}
                className="font-mono text-[10px] font-bold px-4 py-2 text-black bg-[#ccff00] hover:bg-white transition-colors uppercase cursor-crosshair flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-black animate-pulse"></span>
                {t('overlay.btn.profile')}
              </div>
            </StarBorder>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center w-full md:w-auto gap-4 md:gap-8 pt-2 md:pt-0">
          <nav className="flex gap-3 md:gap-8 text-[9px] md:text-xs font-mono uppercase tracking-widest text-gray-500 pointer-events-auto overflow-x-auto scrollbar-hide flex-1">
            <a href="#" className="cursor-target hover:text-[#ccff00] hover:bg-[#ccff00]/10 px-2 py-1 border border-transparent hover:border-[#ccff00]/50 transition-all whitespace-nowrap">{t('overlay.nav.collections')}</a>
            <a href="#" className="cursor-target hover:text-[#ccff00] hover:bg-[#ccff00]/10 px-2 py-1 border border-transparent hover:border-[#ccff00]/50 transition-all whitespace-nowrap">{t('overlay.nav.concept')}</a>
            <a href="#" className="cursor-target hover:text-[#ccff00] hover:bg-[#ccff00]/10 px-2 py-1 border border-transparent hover:border-[#ccff00]/50 transition-all whitespace-nowrap">{t('overlay.nav.archives')}</a>
            <a href="#" className="cursor-target text-black bg-[#ccff00] px-2 py-1 font-bold whitespace-nowrap">{t('overlay.nav.universe')}</a>
          </nav>

          <StarBorder as="button" color="#ccff00" speed="3s" className="cursor-target p-0 pointer-events-auto shrink-0">
            <div 
              onClick={toggleLanguage}
              className="font-mono text-[9px] md:text-[10px] font-bold px-3 py-1.5 md:px-4 md:py-2 text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-colors uppercase cursor-crosshair bg-black"
            >
              {language === 'es' ? 'EN' : 'ES'}
            </div>
          </StarBorder>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex items-end md:items-center justify-end mt-4 md:mt-8 w-full pb-4 md:pb-0 pointer-events-none">
        <div className="hidden md:block animate-item mr-12 bg-black/40 backdrop-blur-sm border border-[#ccff00]/30 p-4 shadow-[4px_4px_0px_rgba(204,255,0,0.15)] pointer-events-auto">
          <AsciiTree />
        </div>
      </main>

      {/* Footer Timeline / Selection */}
      <footer className="mt-4 md:mt-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-[#ccff00]/30 pt-4 animate-item relative">
        <div className="hidden md:block absolute top-0 left-1/4 w-px h-2 bg-[#ccff00]"></div>
        <div className="hidden md:block absolute top-0 left-2/4 w-px h-2 bg-[#ccff00]"></div>
        <div className="hidden md:block absolute top-0 left-3/4 w-px h-2 bg-[#ccff00]"></div>
        
        <div className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest text-black bg-[#ccff00] px-3 py-1.5 flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></span>
          {t('overlay.target.select')}
        </div>

        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 md:pb-0 pointer-events-auto scrollbar-hide font-mono w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div onClick={() => onSelectProject?.(0)} className="cursor-target flex items-center gap-2 md:gap-3 text-[#ccff00] cursor-pointer hover:bg-[#ccff00]/10 px-2 py-1 border border-[#ccff00] transition-colors group shrink-0 pulse-border">
            <span className="text-[9px] md:text-[10px] font-bold group-hover:animate-pulse">01</span>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase whitespace-nowrap">SYS.VOID</span>
          </div>
          <div onClick={() => onSelectProject?.(1)} className="cursor-target flex items-center gap-2 md:gap-3 text-gray-500 cursor-pointer hover:text-[#ccff00] px-2 py-1 border border-transparent hover:border-[#ccff00]/50 transition-colors group shrink-0">
            <span className="text-[9px] md:text-[10px] font-bold">02</span>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase whitespace-nowrap">NEO-GRAVITY</span>
          </div>
          <div onClick={() => onSelectProject?.(2)} className="cursor-target flex items-center gap-2 md:gap-3 text-gray-500 cursor-pointer hover:text-[#ccff00] px-2 py-1 border border-transparent hover:border-[#ccff00]/50 transition-colors group shrink-0">
            <span className="text-[9px] md:text-[10px] font-bold">03</span>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase whitespace-nowrap">MONOLITHIC</span>
          </div>
          <div onClick={() => onSelectProject?.(3)} className="cursor-target flex items-center gap-2 md:gap-3 text-gray-500 cursor-pointer hover:text-[#ccff00] px-2 py-1 border border-transparent hover:border-[#ccff00]/50 transition-colors group shrink-0">
            <span className="text-[9px] md:text-[10px] font-bold">04</span>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase whitespace-nowrap">EXO-ARMOR</span>
          </div>
        </div>

        <div className="hidden md:flex ml-auto text-[10px] tracking-widest uppercase text-[#ccff00] font-mono items-center gap-2 bg-[#ccff00]/10 px-3 py-1 border border-[#ccff00]/30 shrink-0">
          <span className="animate-pulse">_</span>
          <span>{t('overlay.target.inspect')}</span>
          <ArrowRight size={12} />
        </div>
      </footer>
    </div>
  );
}
