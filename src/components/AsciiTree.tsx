import { useLanguage } from '../context/LanguageContext';

const treeES = `         [SYS.VOID NÚCLEO]
          /  |  \\
   [15%] /   |   \\ [85%]
        /    |    \\
>NEO-GRAVITY<    ->EXO-ARMOR
      |      |      [ARMADURA]
[20%] |      | [80%]
      |      |
[MONOLITH]-  |      % RENDER FLUIDO
      |      |      % (SIN ERRORES)
[10%] |      |
      |      L - - - - VISOR DE PRENDAS
*CLO 3D*             [12% de runtime]
      |
[5%]  |      [95%]
      L_ _ _ _ _     ~ DISEÑO CONTINUO ~
      |              [MODO_CREATIVO]
      ↓↦↦↦↦↦               LA MALLA
      ||||||||
      ||||||||       | = 1000 vértices
                     [MALLA_POLIGONAL]`;

const treeEN = `         [SYS.VOID CORE]
          /  |  \\
   [15%] /   |   \\ [85%]
        /    |    \\
>NEO-GRAVITY<    ->EXO-ARMOR
      |      |      [ARMOR]
[20%] |      | [80%]
      |      |
[MONOLITH]-  |      % SEAMLESS RENDER
      |      |      % (NO GLITCHES)
[10%] |      |
      |      L - - - - GARMENT VIEWER
*CLO 3D*             [12% of runtime]
      |
[5%]  |      [95%]
      L_ _ _ _ _     ~ KEEP DESIGNING ~
      |              [CREATIVE_MODE]
      ↓↦↦↦↦↦               THE MESH
      ||||||||
      ||||||||       | = 1000 vertices
                     [POLYGON_MESH]`;

export default function AsciiTree() {
  const { language } = useLanguage();
  return (
    <div className="font-mono text-[8px] md:text-[10px] leading-tight text-[#ccff00] opacity-80 whitespace-pre pointer-events-none">
      {language === 'es' ? treeES : treeEN}
    </div>
  );
}
