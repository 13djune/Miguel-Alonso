const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');

const importStr = "import { useEffect, useState, useRef } from 'react';";
if (!code.includes("const [show3D, setShow3D] = useState(false);")) {
  // Find project modal function start
  code = code.replace(
    'export default function ProjectModal({ project }: ProjectModalProps) {',
    `export default function ProjectModal({ project }: ProjectModalProps) {
  const [show3D, setShow3D] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow3D(true), 1200);
    return () => clearTimeout(timer);
  }, [project]);
`
  );
  
  code = code.replace(
    '<GarmentViewer modelUrl={project.modelUrl} />',
    '{show3D ? <GarmentViewer modelUrl={project.modelUrl} /> : <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-white animate-pulse">CARGANDO MODELO 3D...</div>}'
  );
  
  fs.writeFileSync('src/components/ProjectModal.tsx', code);
}
