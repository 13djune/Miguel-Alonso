const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Fix handlePlanetClick animation
app = app.replace(
  "gsap.fromTo(modalContainerRef.current, \n        { opacity: 0, rotationX: 10 },\n        { opacity: 1, rotationX: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }\n      );",
  "gsap.fromTo(modalContainerRef.current, \n        { opacity: 0, y: 30, scale: 0.95 },\n        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }\n      );"
);

// Fallback if formatting was slightly different
app = app.replace(
  "{ opacity: 0, rotationX: 10 },\n        { opacity: 1, rotationX: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }",
  "{ opacity: 0, y: 30, scale: 0.95 },\n        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }"
);

// Fix handleCloseModal animation
const oldClose = `tl.to(modalContainerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      }, 0);`;
      
const newClose = `tl.to(modalContainerRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.6,
        ease: 'power3.inOut'
      }, 0);`;

app = app.replace(oldClose, newClose);

// Also let's make sure modal container has will-change
app = app.replace(
  'className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"',
  'className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center will-change-[opacity,transform]"'
);

fs.writeFileSync('src/App.tsx', app);
