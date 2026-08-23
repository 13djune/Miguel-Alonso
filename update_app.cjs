const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update CameraController signature
app = app.replace(
  "function CameraController({ selectedProject }: { selectedProject: Project | null }) {",
  "function CameraController({ selectedProject, activeUniverse }: { selectedProject: Project | null, activeUniverse: string }) {"
);

// 2. Update CameraController logic
const oldLogic = `      const isMobile = window.innerWidth < 768 || window.innerHeight > window.innerWidth;
      tl.to(camera.position, {
        x: -10.8,
        y: isMobile ? 12.6 : 7.2,
        z: isMobile ? 57.6 : 28.8,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
      
      tl.to((controls as any).target, {
        x: -6,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);`;

const newLogic = `      const isMobile = window.innerWidth < 768 || window.innerHeight > window.innerWidth;
      
      // Calculate positions based on universe mode
      let targetX = -6;
      let targetY = 0;
      let targetZ = 0;
      
      let camX, camY, camZ;
      if (activeUniverse === 'all') {
        // Initial zoom distance ~ 10, Z = 10
        camX = -7.67;
        camY = 2.50;
        camZ = 10.0;
      } else {
        // Initial zoom distance ~ 8.6, Z = 8.28
        camX = -7.38;
        camY = 2.07;
        camZ = 8.28;
      }
      
      if (isMobile) {
        camY *= 1.5;
        camZ *= 1.5;
      }

      tl.to(camera.position, {
        x: camX,
        y: camY,
        z: camZ,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
      
      tl.to((controls as any).target, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);`;

app = app.replace(oldLogic, newLogic);

// 3. Update CameraController dependency array
app = app.replace(
  "}, [selectedProject, camera, controls]);",
  "}, [selectedProject, camera, controls, activeUniverse]);"
);

// 4. Update CameraController instantiation
app = app.replace(
  "<CameraController selectedProject={selectedProject} />",
  "<CameraController selectedProject={selectedProject} activeUniverse={activeUniverse} />"
);

// 5. Update OrbitControls maxDistance
app = app.replace(
  "maxDistance={16}",
  "maxDistance={activeUniverse === 'all' ? 15 : 10}"
);

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx updated');
