import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LOG_MESSAGES_EN = [
  'INITIALIZING SYSTEM KERNEL...',
  'CALIBRATING VERTICES [OK]',
  'SYNCING ORBITAL DATA...',
  'ESTABLISHING CONNECTION TO MAIN.SYS',
  'LOADING ASSETS [98%]',
  'NEO-GRAVITY PROTOCOL ACTIVE',
  'AWAITING USER INPUT...'
];

const LOG_MESSAGES_ES = [
  'INICIALIZANDO KERNEL DEL SISTEMA...',
  'CALIBRANDO VÉRTICES [OK]',
  'SINCRONIZANDO DATOS ORBITALES...',
  'ESTABLECIENDO CONEXIÓN CON MAIN.SYS',
  'CARGANDO RECURSOS [98%]',
  'PROTOCOLO NEO-GRAVEDAD ACTIVO',
  'ESPERANDO ENTRADA DE USUARIO...'
];

export default function SystemLog() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const messages = language === 'es' ? LOG_MESSAGES_ES : LOG_MESSAGES_EN;
    let currentIndex = 0;
    
    setLogs([messages[0]]);
    currentIndex++;
    
    const interval = setInterval(() => {
      if (currentIndex < messages.length) {
        setLogs(prev => [...prev, messages[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, [language]);

  // Keep the latest 4 log entries so it remains active and compact on both mobile and desktop
  const displayedLogs = logs.slice(-4);

  return (
    <div className="flex fixed bottom-11 sm:bottom-12 md:bottom-14 left-2.5 sm:left-4 md:left-8 z-30 pointer-events-none text-[8px] sm:text-[9px] md:text-[10px] max-w-[240px] sm:max-w-[320px] md:max-w-[420px] font-mono text-[#ffffff] opacity-80 flex-col gap-0.5 overflow-hidden justify-end">
      {displayedLogs.map((log, index) => (
        <div key={index} className="animate-fade-in text-shadow-sm truncate">
          <span className="opacity-50 mr-1.5">{'>'}</span> {log}
        </div>
      ))}
      <div className="animate-pulse opacity-50">_</div>
    </div>
  );
}
