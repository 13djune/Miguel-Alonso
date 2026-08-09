const fs = require('fs');

const appFile = 'src/App.tsx';
let code = fs.readFileSync(appFile, 'utf8');

// We need to replace the PROJECTS array with 8 projects.
const projectsArrayStr = `const PROJECTS: Project[] = [
  // UNIVERSO 1: CREATIVE
  {
    id: '1',
    title: '01 SYS.VOID',
    description: 'An exploration of empty space and negative volumes in modern tailoring.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-8, -4, 0],
    color: '#ff3399',
    distort: 0.2,
    tags: ['AVANT-GARDE', 'MINIMALISM', 'DECONSTRUCTION'],
    tools: ['CLO 3D', 'MARVELOUS DESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 CONCEPT', content: 'SYS.VOID explores the tension between presence and absence.' },
      { id: 'sec-2', title: '02 MATERIALITY', content: 'Utilizing next-generation memory polymers and ultra-lightweight organza.' }
    ]
  },
  {
    id: '2',
    title: '02 NEO-GRAVITY',
    description: 'A study on weightless forms and suspended silhouettes.',
    images: [
      'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-5, 4, -5],
    color: '#00ffcc',
    distort: 0.4,
    tags: ['WEIGHTLESS', 'SUSPENDED', 'FUTURISM'],
    tools: ['CINEMA 4D', 'SUBSTANCE DESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 ZERO-G DYNAMICS', content: 'Designed for environments with altered gravitational states.' },
      { id: 'sec-2', title: '02 ADAPTIVE FIBERS', content: 'Smart textiles embedded with micro-actuators.' }
    ]
  },
  {
    id: '3',
    title: '03 AURA-MESH',
    description: 'Ethereal digital meshes intersecting with human anatomy.',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-10, 2, -2],
    color: '#9933ff',
    distort: 0.3,
    tags: ['ETHEREAL', 'DIGITAL', 'MESH'],
    tools: ['BLENDER', 'MARVELOUS DESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 DIGITAL AURA', content: 'Translucent meshes acting as a second skin.' }
    ]
  },
  {
    id: '4',
    title: '04 LUMINO-WEAVE',
    description: 'Biometric responsive light-emitting textiles.',
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-6, 6, 2],
    color: '#ffcc00',
    distort: 0.5,
    tags: ['BIOMETRIC', 'LUMINOUS', 'TEXTILE'],
    tools: ['TOUCHDESIGNER', 'CLO 3D'],
    sections: [
      { id: 'sec-1', title: '01 BIO-REACTION', content: 'Fabric illuminates based on heart rate.' }
    ]
  },
  // UNIVERSO 2: INDUSTRY
  {
    id: '5',
    title: '05 MONOLITHIC',
    description: 'Structural garments inspired by brutalist architecture and geometric volumes.',
    images: [
      'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800'
    ],
    position: [8, -3, 2],
    color: '#ff3333',
    distort: 0.1,
    tags: ['BRUTALISM', 'GEOMETRY', 'URBAN'],
    tools: ['BLENDER', 'UNREAL ENGINE'],
    sections: [
      { id: 'sec-1', title: '01 BRUTALIST', content: 'Inspired by raw concrete and monolithic architecture.' }
    ]
  },
  {
    id: '6',
    title: '06 EXO-ARMOR',
    description: 'Tactical defense layering with high-tensile carbon polymers.',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800'
    ],
    position: [6, 3, -6],
    color: '#33ff33',
    distort: 0.3,
    tags: ['TACTICAL', 'DEFENSE', 'ARMOR'],
    tools: ['CLO 3D', 'TOUCHDESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 TACTICAL LAYERING', content: 'A modular defense system composed of high-tensile carbon polymers.' }
    ]
  },
  {
    id: '7',
    title: '07 MECHA-WEAR',
    description: 'Industrial-grade exoskeleton integrated streetwear.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&q=80&w=800'
    ],
    position: [10, 5, 0],
    color: '#ff9900',
    distort: 0.2,
    tags: ['MECHA', 'INDUSTRIAL', 'STREET'],
    tools: ['ZBRUSH', 'MAYA'],
    sections: [
      { id: 'sec-1', title: '01 EXOSKELETON', content: 'Mechanical supports woven into daily wear.' }
    ]
  },
  {
    id: '8',
    title: '08 SYNTH-SKIN',
    description: 'Synthetic protective layering for extreme environments.',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [5, -6, -3],
    color: '#33ccff',
    distort: 0.4,
    tags: ['SYNTHETIC', 'PROTECTIVE', 'EXTREME'],
    tools: ['MARVELOUS DESIGNER', 'KEYSHOT'],
    sections: [
      { id: 'sec-1', title: '01 ALL-WEATHER', content: 'Adapts to extreme temperatures autonomously.' }
    ]
  }
];`;

const startIdx = code.indexOf('const PROJECTS: Project[] = [');
const endIdxStr = `];\n\nfunction MovingStars() {`;
const endIdx = code.indexOf(endIdxStr);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + projectsArrayStr + '\n\nfunction MovingStars() {' + code.substring(endIdx + endIdxStr.length);
  fs.writeFileSync(appFile, code);
  console.log("Updated projects");
} else {
  console.log("Could not find projects array bounds");
}
