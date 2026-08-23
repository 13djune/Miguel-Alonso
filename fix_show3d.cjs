const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');

code = code.replace(
  'export default function ProjectModal({ project, onClose, onNextProject, onPrevProject, currentProjectIndex = 0, totalProjects = 1 }: ProjectModalProps) {',
  `export default function ProjectModal({ project, onClose, onNextProject, onPrevProject, currentProjectIndex = 0, totalProjects = 1 }: ProjectModalProps) {
  const [show3D, setShow3D] = useState(false);
  useEffect(() => {
    setShow3D(false);
    const timer = setTimeout(() => setShow3D(true), 1200);
    return () => clearTimeout(timer);
  }, [project]);
`
);

fs.writeFileSync('src/components/ProjectModal.tsx', code);
