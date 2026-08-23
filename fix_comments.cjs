const fs = require('fs');

let projectModal = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');
projectModal = projectModal.replace('// {project.images.length}', '{/* {project.images.length} */}');
fs.writeFileSync('src/components/ProjectModal.tsx', projectModal);

let universe = fs.readFileSync('src/components/Universe.tsx', 'utf8');
// Fix "// intense core"
universe = universe.replace('// intense core', '/* intense core */');
// Fix "// smooth lerp" if any (it's in TargetCursor but let's check Universe)
universe = universe.replace(/\/\/ Extra corners removed/g, '/* Extra corners removed */');
universe = universe.replace(/\/\/ Corner brackets removed/g, '/* Corner brackets removed */');
fs.writeFileSync('src/components/Universe.tsx', universe);

console.log('Fixed line comments in single-line files');
