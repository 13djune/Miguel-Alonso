const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace CustomCursor with TargetCursor
code = code.replace("import CustomCursor from './components/CustomCursor';", "import TargetCursor from './components/TargetCursor';");

// Insert CameraController
const cameraControllerCode = `
function CameraController({ selectedProject }: { selectedProject: Project | null }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!controls) return;
    const tl = gsap.timeline();
    
    if (selectedProject) {
      const targetPos = new THREE.Vector3(
        -6 + selectedProject.position[0],
        0,
        selectedProject.position[2]
      );
      const camOffset = new THREE.Vector3(0, 0, 5);
      const finalCamPos = targetPos.clone().add(camOffset);
      
      tl.to(camera.position, {
        x: finalCamPos.x,
        y: finalCamPos.y,
        z: finalCamPos.z,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
      
      tl.to((controls as any).target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
    } else {
      tl.to(camera.position, {
        x: 0,
        y: 8,
        z: 20,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
      
      tl.to((controls as any).target, {
        x: -6,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
    }
  }, [selectedProject, camera, controls]);
  
  return null;
}
`;

// Make sure useThree is imported
code = code.replace("import { Canvas, useFrame } from '@react-three/fiber';", "import { Canvas, useFrame, useThree } from '@react-three/fiber';");

code = code.replace("function DynamicBloom() {", cameraControllerCode + "\nfunction DynamicBloom() {");

// Now update App component
const newApp = `export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalActive, setModalActive] = useState(false);
  const [designerModalActive, setDesignerModalActive] = useState(false);
  
  const universeContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handlePlanetClick = (project: Project) => {
    setModalActive(true);
    setSelectedProject(project);
    
    if (modalContainerRef.current) {
      gsap.fromTo(modalContainerRef.current, 
        { opacity: 0, rotationX: 10 },
        { opacity: 1, rotationX: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }
      );
    }
  };

  const handleCloseModal = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setModalActive(false);
        setSelectedProject(null);
      }
    });

    if (modalContainerRef.current) {
      tl.to(modalContainerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      }, 0);
    }
  };

  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % PROJECTS.length;
    setSelectedProject(PROJECTS[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
    setSelectedProject(PROJECTS[prevIndex]);
  };

  return (
    <LanguageProvider>
      <div className="w-full h-screen bg-black overflow-hidden relative font-sans text-white cursor-target">
        <TargetCursor cursorColor="#ccff00" cursorColorOnTarget="#ffffff" />
        
        {/* Scanlines Effect */}
        <div className="scanlines"></div>

        {/* Cyber Brutalist Grid */}
        <div className="absolute inset-0 bg-cyber-grid z-0 pointer-events-none"></div>

        {/* 3D Scene Wrapper for Animation */}
        <div ref={universeContainerRef} className="absolute inset-0 z-0 origin-center will-change-transform">
          <Canvas 
            camera={{ position: [0, 8, 20], fov: 45 }} 
            style={{ width: '100vw', height: '100vh' }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <CameraController selectedProject={selectedProject} />
            
            <MovingStars />
            <group position={[-6, 0, 0]}>
              <Universe projects={PROJECTS} onPlanetClick={handlePlanetClick} />
            </group>
            
            <EffectComposer>
              <DynamicBloom />
            </EffectComposer>
            <OrbitControls 
              enablePan={false}
              enableZoom={!modalActive}
              maxDistance={40}
              minDistance={3}
              makeDefault
              autoRotate={!selectedProject}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Overlay UI */}
        <div className={\`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 \${modalActive ? 'opacity-0' : 'opacity-100'}\`}>
          <Overlay onOpenDesigner={() => setDesignerModalActive(true)} />
        </div>

        {/* Project Modal */}
        <div 
          ref={modalContainerRef} 
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          style={{ opacity: 0, visibility: modalActive ? 'visible' : 'hidden' }}
        >
          <div className="w-full h-full pointer-events-auto">
            {selectedProject && (
              <ProjectModal 
                project={selectedProject} 
                onClose={handleCloseModal}
                onNextProject={handleNextProject}
                onPrevProject={handlePrevProject}
                currentProjectIndex={PROJECTS.findIndex(p => p.id === selectedProject.id)}
                totalProjects={PROJECTS.length}
              />
            )}
          </div>
        </div>

        {/* Designer Modal */}
        {designerModalActive && (
          <DesignerModal onClose={() => setDesignerModalActive(false)} />
        )}
      </div>
    </LanguageProvider>
  );
}`;

const startIndex = code.indexOf("export default function App() {");
code = code.substring(0, startIndex) + newApp;

fs.writeFileSync('src/App.tsx', code);
