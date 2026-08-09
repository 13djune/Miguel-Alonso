const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

code = code.replace(
  'function OrbitGroup({ project, radius, onClick, index, isSelected }: { project: Project, radius: number, onClick: () => void, index: number, isSelected?: boolean }) {',
  'function OrbitGroup({ project, radius, onClick, index, isSelected, isFocused, selectedProjectId }: { project: Project, radius: number, onClick: () => void, index: number, isSelected?: boolean, isFocused?: boolean, selectedProjectId?: string }) {'
);

code = code.replace(
  '<ProjectNode project={project} onClick={onClick} index={index} />',
  '<ProjectNode project={project} onClick={onClick} index={index} isSelected={isSelected} selectedProjectId={selectedProjectId} />'
);

code = code.replace(
  'function ProjectNode({ project, onClick, index }: { project: Project, onClick: () => void, index: number }) {',
  'function ProjectNode({ project, onClick, index, isSelected, selectedProjectId }: { project: Project, onClick: () => void, index: number, isSelected?: boolean, selectedProjectId?: string }) {'
);

// We need to change ProjectNode so that if selectedProjectId is set and it's NOT this project, we lower opacity and disable pointer events
// Let's check how ProjectNode renders Html

fs.writeFileSync('src/components/Universe.tsx', code);
