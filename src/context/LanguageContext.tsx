import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    'overlay.title': 'MIGUEL ALONSO',
    'overlay.subtitle': 'FASHION_ENGINEER // DIR_01',
    'overlay.nav.collections': 'SYS_COLECCIONES',
    'overlay.nav.concept': 'LOG_CONCEPTOS',
    'overlay.nav.archives': 'ARCHIVO_DATOS',
    'overlay.nav.universe': 'MAPA_UNIVERSO',
    'overlay.designer.title': 'EL_DISEÑADOR',
    'overlay.designer.body': '> UBICACIÓN: MADRID\n> FOCO: SILUETAS ARQUITECTÓNICAS\n> ESTADO: ACTIVO\n\nFusionando brutalismo industrial con marcos anatómicos. Explorando la integridad estructural en entornos de alta gravedad.',
    'overlay.exp.title': 'LOG_EXPERIENCIA',
    'overlay.btn.portfolio': 'ACCESO_PORTFOLIO.PDF',
    'overlay.btn.resume': 'DESCARGAR_DATOS.TXT',
    'overlay.target.select': 'SELECCIÓN_OBJETIVO:',
    'overlay.target.inspect': 'CLICK_ESTRUCTURA_PARA_INSPECCIONAR',
    'modal.sys.viewer': 'SYS_VISOR_PROYECTO',
    'modal.terminate': '[X] TERMINAR',
    'modal.expand': 'AMPLIAR_VISTA',
    'modal.3d.mode': 'MODO_INSPECCION_3D',
    'modal.3d.controls': 'ROTACION_EJES: ARRASTRAR // ZOOM: SCROLL',
    'modal.close.view': '[X] CERRAR_VISTA',
        'loading.init': 'INICIALIZANDO NÚCLEO...',
    'loading.assets': 'CARGANDO RECURSOS //',
    'loading.complete': 'SISTEMA_LISTO',
    'job.eme.role': 'DISEÑADOR DE MODA',
    'job.leandro.role': 'EMPLEADO EN PRÁCTICAS',
    'edu.degree': 'GRADO EN DISEÑO DE MODA',
    'edu.school': 'UDIT, UNIVERSIDAD DE DISEÑO, INNOVACIÓN Y TECNOLOGÍA, MADRID',
    'award.manteco': 'Expedido por Manteco.<br/>Asociado con UDIT, Universidad de Diseño y Tecnología.',
    'designer.desc': 'Digital fashion architect. Merging generative design with functional materiality.',
    'skills.title': 'HABILIDADES_NÚCLEO',
    'exp.title': 'LOG_EXPERIENCIA',
    'edu.title': 'ENTRENAMIENTO_ACADÉMICO',
    'awards.title': 'DISTINCIONES',
    'social.title': 'ENLACES_COM',
    'sys.tags': 'SISTEMA.ETIQUETAS',
    'sys.tools': 'SISTEMA.HERRAMIENTAS',
    'sys.viewer': 'SYS.VISOR_PERFIL',
    'overlay.btn.profile': 'VER_PERFIL',
    'contact.title': 'NODOS_CONTACTO',
    'skill.3d': 'Modelado 3D',
    'skill.pattern': 'Patronaje',
    'skill.render': 'Renderizado',
    'skill.anim': 'Animación',
    'skill.texture': 'Texturizado',
    'skill.art': 'Dirección de Arte'
  },
  en: {
    'overlay.title': 'MIGUEL ALONSO',
    'overlay.subtitle': 'FASHION_ENGINEER // DIR_01',
    'overlay.nav.collections': 'SYS_COLLECTIONS',
    'overlay.nav.concept': 'CONCEPT_LOGS',
    'overlay.nav.archives': 'DATA_ARCHIVES',
    'overlay.nav.universe': 'UNIVERSE_MAP',
    'overlay.designer.title': 'THE_DESIGNER',
    'overlay.designer.body': '> LOCATION: MADRID\n> FOCUS: ARCHITECTURAL SILHOUETTES\n> STATUS: ACTIVE\n\nMerging industrial brutalism with anatomical frameworks. Exploring structural integrity in high-gravity environments.',
    'overlay.exp.title': 'LOG_EXPERIENCE',
    'overlay.btn.portfolio': 'ACCESS_PORTFOLIO.PDF',
    'overlay.btn.resume': 'DOWNLOAD_DATA.TXT',
    'overlay.target.select': 'TARGET_SELECT:',
    'overlay.target.inspect': 'CLICK_STRUCTURE_TO_INSPECT',
    'modal.sys.viewer': 'SYS_PROJECT_VIEWER',
    'modal.terminate': '[X] TERMINATE',
    'modal.expand': 'EXPAND_VIEW',
    'modal.3d.mode': '3D_INSPECTION_MODE',
    'modal.3d.controls': 'AXIS_ROTATION: DRAG // ZOOM: SCROLL',
    'modal.close.view': '[X] CLOSE_VIEW',
        'loading.init': 'INITIALIZING CORE...',
    'loading.assets': 'LOADING ASSETS //',
    'loading.complete': 'SYSTEM_READY',
    'job.eme.role': 'FASHION DESIGNER',
    'job.leandro.role': 'INTERN',
    'edu.degree': 'BACHELOR IN FASHION DESIGN',
    'edu.school': 'UDIT, UNIVERSITY OF DESIGN, INNOVATION AND TECHNOLOGY, MADRID',
    'award.manteco': 'Issued by Manteco.<br/>Associated with UDIT, University of Design and Technology.',
    'designer.desc': 'Digital fashion architect. Merging generative design with functional materiality.',
    'skills.title': 'CORE_SKILLS',
    'exp.title': 'LOG_EXPERIENCE',
    'edu.title': 'ACADEMIC_TRAINING',
    'awards.title': 'DISTINCTIONS',
    'social.title': 'COM_LINKS',
    'sys.tags': 'SYSTEM.TAGS',
    'sys.tools': 'SYSTEM.TOOLS',
    'sys.viewer': 'SYS.PROFILE_VIEWER',
    'designer.id': 'ID: 4920-A // LEAD ARCHITECT',
    'overlay.btn.profile': 'VIEW_PROFILE',
    'contact.title': 'CONTACT_NODES',
    'skill.3d': '3D Modeling',
    'skill.pattern': 'Pattern Making',
    'skill.render': 'Rendering',
    'skill.anim': 'Animation',
    'skill.texture': 'Texturing',
    'skill.art': 'Art Direction'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
