import { Project } from '../types';

export const CREATIVE_PROJECTS: Project[] = [
  // 01 REGNUM (Planet 1)
  {
    id: "1",
    title: "01 REGNUM",
    description:
      "Siluetas escultóricas en canvas pesado y lona técnica estructurada. Una exploración de proporciones de armadura medieval fusionadas con sastrería brutalista, ojales metálicos sobredimensionados y drapeados arquitectónicos con marcado claroscuro.",
    images: [
      "/src/assets/img/REGNUM/Regnum_1.PNG",
      "/src/assets/img/REGNUM/Regnum_2.PNG",
      "/src/assets/img/REGNUM/Regnum_3.PNG",
      "/src/assets/img/REGNUM/Regnum_4.PNG",
      "/src/assets/img/REGNUM/Regnum_5.PNG",
      "/src/assets/img/REGNUM/Regnum_6.PNG",
      "/src/assets/img/REGNUM/Regnum_7.PNG",
      "/src/assets/img/REGNUM/Regnum_8.PNG",
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
      "Indumentaria expedicionaria subcero bajo estética brutalista. Abrigos gabardina envolventes con cuello pasamontañas sobredimensionado, guantes de piel táctil reforzados y membranas termoselladas concebidas para condiciones extremas de permafrost.",
    images: [
      "/src/assets/img/P3RMFRST/P3RMFRST_1.PNG",
      "/src/assets/img/P3RMFRST/P3RMFRST_2.PNG",
      "/src/assets/img/P3RMFRST/P3RMFRST_3.PNG",
      "/src/assets/img/P3RMFRST/P3RMFRST_4.PNG",
      "/src/assets/img/P3RMFRST/P3RMFRST_5.PNG",
    ],
    position: [-5, 4, -5],
    color: "#00ffcc",
    distort: 0.4,
    tags: ["SUB-ZERO", "BRUTALISMO", "PERMAFROST", "OUTERWEAR EXPEDICIONARIO", "PIEL TÁCTIL"],
    tools: ["CINEMA 4D", "SUBSTANCE DESIGNER", "CLO 3D", "OCTANE RENDER"],
    universe: "creative",
    sections: [
      {
        id: "sec-1",
        title: "01 DINÁMICA GLACIAR",
        content:
          "Diseñado para soportar ventiscas extremas y aislamiento térmico en expediciones polares. La superficie exterior repele escarcha y cristales de hielo mediante nanorrevestimiento hidrofóbico texturizado.",
      },
      {
        id: "sec-2",
        title: "02 ESCUDO PERMAFROST",
        content:
          "Abrigo de membrana multicapa con solapa envolvente facial y cuello túnel articulado. Protege las vías respiratorias mientras canaliza el flujo térmico corporal hacia el núcleo central de la prenda.",
      },
      {
        id: "sec-3",
        title: "03 GUANTES DE CONTROL",
        content:
          "Guantes táctiles en piel curtida al cromo con inserciones de goma de alto agarre y nudillos de polímero termoplástico para interacción precisa con interfaces en temperaturas bajo cero.",
      },
      {
        id: "sec-4",
        title: "04 ARNESES Y AJUSTE TÁCTICO",
        content:
          "Sistema de cinchas dorsales en cinta mil-spec con hebillas de liberación rápida que permiten comprimir el volumen de la prenda según la intensidad del viento o anclar material de escalada en hielo.",
      },
    ],
    hotspots: {
      0: [
        { x: 48, y: 22, title: "Capucha Túnel Antiventisca", description: "Borde rígido deformable para mantener el campo visual bajo ráfagas intensas." },
        { x: 30, y: 68, title: "Guantes de Aislamiento Dual", description: "Forro interior de lana merina con exterior en piel hidrofugada de 1.8mm." }
      ]
    }
  },

  // 03 AURA-MESH (Planet 3)
  {
    id: "3",
    title: "03 AURA-MESH",
    description:
      "Mallas digitales etéreas que intersectan con la anatomía humana. Un estudio sobre siluetas traslúcidas que reaccionan a la luz volumétrica creando una segunda piel bio-computacional.",
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
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

  // 04 LUMINO-WEAVE (Planet 4)
  {
    id: "4",
    title: "04 LUMINO-WEAVE",
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
