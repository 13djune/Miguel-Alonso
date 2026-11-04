import { Project } from '../types';
const regnum5 = '/assets/img/REGNUM/regnum_1.png';
const regnum4 = '/assets/img/REGNUM/regnum_2.png';
const regnum7 = '/assets/img/REGNUM/regnum_3.png';
const regnum3 = '/assets/img/REGNUM/regnum_4.png';
const regnum1 = '/assets/img/REGNUM/regnum_5.png';
const regnum6 = '/assets/img/REGNUM/regnum_6.png';
const regnum2 = '/assets/img/REGNUM/regnum_7.png';
const regnum8 = '/assets/img/REGNUM/regnum_8.png';


import p3rmfrst1 from '../assets/img/P3RMFRST/p3rmfrst_1.png';
import p3rmfrst3 from '../assets/img/P3RMFRST/p3rmfrst_2.png';
import p3rmfrst4 from '../assets/img/P3RMFRST/p3rmfrst_3.png';
import p3rmfrst2 from '../assets/img/P3RMFRST/p3rmfrst_4.png';
import p3rmfrst5 from '../assets/img/P3RMFRST/p3rmfrst_5.png';

export const CREATIVE_PROJECTS: Project[] = [
  // 01 REGNUM (Planet 1)
  {
    id: "1",
    title: "01 REGNUM",
    description:
      "Siluetas escultóricas en canvas pesado y lona técnica estructurada. Una exploración de proporciones de armadura medieval fusionadas con sastrería brutalista, ojales metálicos sobredimensionados y drapeados arquitectónicos con marcado claroscuro.",
    images: [
      regnum4,
      regnum1,
      regnum2,
      regnum3,
      regnum5,
      regnum6,
      regnum7,
      regnum8,
    ],
    position: [-8, -4, 0],
    color: "#ff3399",
    distort: 0.2,
    tags: ["CANVAS 650GSM", "OJALES METÁLICOS", "AVANT-GARDE", "CLAROSCURO", "ARMADURA MEDIEVAL"],
    tools: ["CLO 3D", "MARVELOUS DESIGNER", "BLENDER", "SUBSTANCE 3D PAINTER"],
    universe: "creative",
    sections: [
      {
        id: "sec-1",
        title: "01 DRAPEADO MONOLÍTICO",
        content:
          "REGNUM equilibra las proporciones de una coraza medieval con patrones contemporáneos de caída rígida. El volumen se construye a partir de planos geométricos tensados que responden a la gravedad con pliegues angulares y estáticos.",
      },
      {
        id: "sec-2",
        title: "02 HARDWARE & VENTILACIÓN",
        content:
          "Filas de ojales reforzados de aleación oscura recorren las líneas de costura estructurales. Funcionan tanto como moduladores de ventilación pasiva como anclajes para suspensiones mecánicas de las mangas articuladas.",
      },
      {
        id: "sec-3",
        title: "03 TEXTURIZADO Y PÁTINA",
        content:
          "Lona de algodón crudo de alto gramaje tratada con pátinas minerales para generar un contraste lumínico teatral. La luz incide acentuando la rugosidad de la fibra frente al brillo pulido del metal bruñido.",
      },
      {
        id: "sec-4",
        title: "04 GEOMETRÍA DEL PATRÓN",
        content:
          "Desarrollo de moldería sin costuras estándar: el ensamblaje se resuelve a través de superposiciones solapadas con remaches dobles, creando una silueta autoportante que no requiere fornitura tradicional.",
      },
    ],
    hotspots: {
      0: [
        { x: 35, y: 30, title: "Canesú Articulado", description: "Construcción en capas solapadas que emula las defensas de hombro medievales." },
        { x: 62, y: 55, title: "Ojales Métricos", description: "Refuerzos pasantes de 18mm con anillo de estanqueidad para amarre modulable." }
      ],
      1: [
        { x: 50, y: 40, title: "Drapeado Dorsal", description: "Lona compactada con memoria de pliegue que mantiene la silueta arquitectónica." }
      ]
    }
  },

  // 02 P3RMFRST (Planet 2)
  {
    id: "2",
    title: "02 P3RMFRST",
    description:
      "Sistema de indumentaria técnica concebido bajo la crisis del permafrost ártico y la capacidad biológica y cultural de adaptación extrema. La pieza traduce la cosmología inuit —la división de la existencia en cuerpo, alma y espíritu— en un dispositivo textil modular. El cuerpo humano actúa como anclaje físico, mientras las capas exteriores completan la estructura de supervivencia ante un entorno en colapso geológico.",
    descriptionEn:
      "Technical outerwear system conceived amidst the Arctic permafrost crisis and the biological and cultural capacity for extreme adaptation. The piece translates Inuit cosmology—the division of existence into body, soul, and spirit—into a modular textile apparatus. The human body functions as a physical anchor, while the outer layers complete the survival architecture confronting an environment in geological collapse.",
    images: [
      "/assets/aistudio/LOOK_COMPLETO_920c88d9.png",
      p3rmfrst1,
      p3rmfrst2,
      p3rmfrst3,
      p3rmfrst4,
      p3rmfrst5,
    ],
    position: [-5, 4, -5],
    color: "#00ffcc",
    distort: 0.4,
    tags: [
      "PERMAFROST DEGRADATION",
      "INUIT ONTOLOGY",
      "TRIPARTITE HOOD",
      "RESILIENCE ARCHITECTURE",
    ],
    tagsEn: [
      "PERMAFROST DEGRADATION",
      "INUIT ONTOLOGY",
      "TRIPARTITE HOOD",
      "RESILIENCE ARCHITECTURE",
    ],
    tools: ["CLO3D", "BLENDER", "NOMAD SCULPT", "FIGMA WEAVY"],
    universe: "creative",
    sections: [
      {
        id: "sec-1",
        title: "01 ESTRATIFICACIÓN BICAPA",
        titleEn: "01 DUAL-LAYER STRATIFICATION",
        content:
          "Abrigo modular dividido en dos capas técnicas superpuestas que simbolizan el plano anímico y espiritual de la materia viva. Ambas membranas aíslan térmicamente el núcleo mientras dejan que el propio cuerpo del usuario opere como el tercer componente: el contenedor biológico necesario para cerrar el ciclo.",
        contentEn:
          "Modular coat divided into two overlapping technical layers symbolizing the animic and spiritual planes of living matter. Both membranes thermally insulate the core while allowing the wearer's body to operate as the third component: the biological vessel required to close the cycle.",
      },
      {
        id: "sec-2",
        title: "02 CAPUCHA TRIPARTITA",
        titleEn: "02 TRIPARTITE HOOD",
        content:
          "Estructura cefálica compuesta por tres hojas textiles independientes que convergen en una unidad hermética. Cada panel responde a una fracción del pensamiento inuit —cuerpo, alma y espíritu—, resolviendo el sellado facial contra el viento blanco mediante la unión de las tres partes.",
        contentEn:
          "Cephalic structure composed of three independent textile panels that converge into a hermetic unit. Each panel corresponds to a fraction of Inuit thought—body, soul, and spirit—achieving facial sealing against the whiteout wind through the convergence of all three parts.",
      },
      {
        id: "sec-3",
        title: "03 RESPUESTA AL DESHIELO",
        titleEn: "03 THAW RESPONSE",
        content:
          "Membrana exterior diseñada para transiciones térmicas inestables provocadas por la fractura del permafrost. Combina impermeabilidad a la humedad líquida de superficie con protección cortavientos para ventiscas secas, optimizando la resistencia a la abrasión contra roca y hielo.",
        contentEn:
          "Outer membrane engineered for unstable thermal transitions induced by permafrost degradation. It combines impermeability to surface liquid moisture with windproof shielding for dry blizzards, optimizing abrasion resistance against rock and ice.",
      },
      {
        id: "sec-4",
        title: "04 MODULARIDAD ERGONÓMICA",
        titleEn: "04 ERGONOMIC MODULARITY",
        content:
          "Patronaje de volumen adaptable que permite la reconfiguración rápida de las capas según el esfuerzo metabólico. El sistema distribuye los puntos de retención de calor y escape de condensación para garantizar la autonomía térmica en desplazamientos prolongados.",
        contentEn:
          "Adaptive volume patterning enabling rapid reconfiguration of layers according to metabolic output. The system distributes thermal retention nodes and condensation venting zones to guarantee thermal autonomy across prolonged expeditions.",
      },
    ],
    hotspots: {
      0: [
        { x: 48, y: 22, title: "Capucha Túnel Antiventisca", description: "Borde rígido deformable para mantener el campo visual bajo ráfagas intensas." },
        { x: 30, y: 68, title: "Guantes de Aislamiento Dual", description: "Forro interior de lana merina con exterior en piel hidrofugada de 1.8mm." }
      ]
    }
  },

  // 03 ALPHEGOR 0.1 (Planet 3)
  {
    id: "3",
    title: "03 ALPHEGOR 0.1",
    description:
      "Mallas digitales etéreas que intersectan con la anatomía humana. Un estudio sobre siluetas traslúcidas que reaccionan a la luz volumétrica creando una segunda piel bio-computacional.",
    images: [
      "/assets/aistudio/IMG_0244_a4ea2f72.PNG",
    ],
    position: [-10, 2, -2],
    color: "#9933ff",
    distort: 0.3,
    tags: ["ETÉREO", "DIGITAL MESH", "BIO-COMPUTACIÓN", "VOLUMÉTRICO"],
    tools: ["BLENDER", "MARVELOUS DESIGNER", "HOUDINI", "UNREAL ENGINE 5"],
    universe: "creative",
    sections: [
      {
        id: "sec-1",
        title: "01 AURA DIGITAL",
        content:
          "Tramas semitransparentes generadas mediante algoritmos de crecimiento celular que envuelven la forma anatómica con densidades variables.",
      },
      {
        id: "sec-2",
        title: "02 REFRACCIÓN DEGRADADA",
        content:
          "Capas poliméricas ultraligeras con propiedades dicroicas que transforman el color de la silueta según el ángulo de observación y la fuente de luz ambiental.",
      },
      {
        id: "sec-3",
        title: "03 CINÉTICA FLOTANTE",
        content:
          "Simulaciones de dinámica de fluidos aplicadas al tejido para conseguir caídas que desafían la gravedad terrestre, simulando atmósferas de baja densidad.",
      },
    ],
  },

  // 04 ALPHEGOR 0.2 (Planet 4)
  {
    id: "4",
    title: "04 ALPHEGOR 0.2",
    description:
      "Textiles biométricos inteligentes con emisión de luz adaptativa. Circuitos flexibles y filamentos electroluminiscentes entretejidos que traducen parámetros fisiológicos en pulsaciones luminosas dinámicas.",
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200",
    ],
    position: [-6, 6, 2],
    color: "#ffcc00",
    distort: 0.5,
    tags: ["BIOMÉTRICO", "LUMINISCENTE", "E-TEXTILE", "WEARABLE TECH"],
    tools: ["TOUCHDESIGNER", "CLO 3D", "RHINOCEROS", "KEYSHOT"],
    universe: "creative",
    sections: [
      {
        id: "sec-1",
        title: "01 BIO-REACCIÓN",
        content:
          "Los filamentos integrados se iluminan y cambian de frecuencia de pulso en sincronía con el ritmo cardíaco y la temperatura corporal del usuario.",
      },
      {
        id: "sec-2",
        title: "02 TEJIDO FOTO-ELECTRÓNICO",
        content:
          "Matriz híbrida de hilo de cobre esmaltado ultrafino y poliamida de alta resistencia que permite plegabilidad completa sin fractura de la conductividad.",
      },
      {
        id: "sec-3",
        title: "03 PATRÓN DE INTERFERENCIA",
        content:
          "Composiciones geométricas grabadas en la superficie que refractan la luz interna creando halos y patrones de moiré visualmente hipnóticos.",
      },
    ],
  },
];
