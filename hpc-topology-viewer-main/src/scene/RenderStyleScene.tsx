import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Grid,
  Lightformer,
  OrthographicCamera,
} from '@react-three/drei';
import * as THREE from 'three';
import { Card910B, type CardState, type ClayTheme, type RenderStyle } from './Card910B';

function backgroundFor(style: RenderStyle, theme: ClayTheme): string {
  switch (style) {
    case 'pbr':
      return '#0a0d13';
    case 'flat':
      return '#eef1f5';
    case 'blueprint':
      return '#0a1830';
    case 'clay':
    default:
      return theme === 'dark' ? '#0e1116' : '#f1f3f6';
  }
}

function Lighting({ style }: { style: RenderStyle }) {
  switch (style) {
    case 'pbr':
      return (
        <>
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 9, 5]} intensity={1.1} />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={2.2} position={[3, 4, 3]} scale={6} color="#dfeaff" />
            <Lightformer form="rect" intensity={1.1} position={[-4, 2, -2]} scale={5} color="#8fbcff" />
            <Lightformer form="ring" intensity={1.4} position={[0, 5, -4]} scale={4} color="#ffffff" />
          </Environment>
        </>
      );
    case 'flat':
      return (
        <>
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 8, 4]} intensity={0.55} />
          <directionalLight position={[-4, 4, -3]} intensity={0.25} />
        </>
      );
    case 'blueprint':
      return <ambientLight intensity={1} />;
    case 'clay':
    default:
      return (
        <>
          <hemisphereLight args={['#ffffff', '#c4cad4', 1.05]} />
          <directionalLight position={[5, 8, 4]} intensity={0.85} />
          <directionalLight position={[-5, 4, -2]} intensity={0.35} />
        </>
      );
  }
}

function Ground({ style, theme }: { style: RenderStyle; theme: ClayTheme }) {
  if (style === 'blueprint') {
    return (
      <Grid
        position={[0, 0, 0]}
        args={[14, 14]}
        cellSize={0.4}
        cellColor="#1d4a7a"
        sectionSize={1.6}
        sectionColor="#2f6ca8"
        fadeDistance={11}
        fadeStrength={1.4}
        infiniteGrid
      />
    );
  }
  if (style === 'flat') {
    return null;
  }
  // pbr + clay: soft grounded contact shadow
  const clayShadow = theme === 'dark' ? { opacity: 0.22, color: '#000000' } : { opacity: 0.32, color: '#6b7280' };
  return (
    <ContactShadows
      position={[0, 0.001, 0]}
      scale={5}
      blur={2.4}
      opacity={style === 'clay' ? clayShadow.opacity : 0.5}
      far={3}
      color={style === 'clay' ? clayShadow.color : '#000000'}
    />
  );
}

export function RenderStyleCanvas({
  style,
  state,
  theme = 'light',
  onSelect,
  onHover,
  onBlur,
}: {
  style: RenderStyle;
  state: CardState;
  theme?: ClayTheme;
  onSelect: () => void;
  onHover: () => void;
  onBlur: () => void;
}) {
  const shadows = style === 'pbr' || style === 'clay';

  return (
    <Canvas
      shadows={shadows}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: style === 'pbr' ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping,
        toneMappingExposure: 1,
        powerPreference: 'high-performance',
      }}
      onPointerMissed={() => onBlur()}
    >
      <OrthographicCamera
        makeDefault
        position={[6, 5.2, 6]}
        zoom={172}
        near={0.1}
        far={100}
        onUpdate={(camera) => camera.lookAt(0, 0.16, 0)}
      />
      <color attach="background" args={[backgroundFor(style, theme)]} />
      <Lighting style={style} />
      <Card910B style={style} state={state} theme={theme} onSelect={onSelect} onHover={onHover} onBlur={onBlur} />
      <Ground style={style} theme={theme} />
    </Canvas>
  );
}
