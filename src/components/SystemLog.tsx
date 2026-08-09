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
  'CARGANDO ASSETS [98%]',
  'PROTOCOLO NEO-GRAVITY ACTIVO',
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

  return (
    <div className="fixed bottom-12 md:bottom-24 left-4 md:left-12 z-50 pointer-events-none text-[8px] md:text-[10px] max-w-[250px] md:max-w-[400px] font-mono text-[#c4ffff] opacity-70 flex flex-col gap-1 max-w-none overflow-hidden">
      {logs.map((log, index) => (
        <div key={index} className="animate-fade-in text-shadow-sm">
          <span className="opacity-50 mr-2">{'>'}</span> {log}
        </div>
      ))}
      <div className="animate-pulse opacity-50 mt-1">_</div>
    </div>
  );
}
