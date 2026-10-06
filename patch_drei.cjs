const fs = require('fs');
const filePath = 'node_modules/@react-three/drei/web/Html.js';

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace createRoot instantiation so it reuses existing root on el
  content = content.replace(
    /const currentRoot = root\.current = ReactDOM\.createRoot\(el\);/g,
    'const currentRoot = root.current || (root.current = ReactDOM.createRoot(el));'
  );

  // Replace cleanup in [target, transform] effect so it doesn't unmount prematurely
  content = content.replace(
    /\/\* deferred to unmount \*\//g,
    ''
  );
  content = content.replace(
    /currentRoot\.unmount\(\);/g,
    ''
  );

  // Add the proper component unmount effect if not already added
  if (!content.includes('__drei_html_unmount_hook')) {
    const hook = `
  React.useEffect(() => {
    /* __drei_html_unmount_hook */
    return () => {
      if (root.current) {
        const r = root.current;
        root.current = null;
        setTimeout(() => {
          try { r.unmount(); } catch (e) {}
        }, 0);
      }
    };
  }, []);
`;
    const target = 'const visible = React.useRef(true);';
    if (content.includes(target)) {
      content = content.replace(target, hook + '\n  ' + target);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[patch_drei] Successfully patched @react-three/drei Html.js for React 19');
}
