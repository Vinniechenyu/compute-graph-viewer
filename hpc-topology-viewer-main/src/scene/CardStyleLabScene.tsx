import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GpuCardModel, type CardVisualState, type CardVisualVariant } from './GpuCardModel';

export type StylePreviewMode = 'single' | 'stack';

function MiniStage({ showFrame }: { showFrame: boolean }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[5.8, 5.2]} />
        <meshStandardMaterial color="#06080d" roughness={0.97} metalness={0.04} />
      </mesh>
      {[-2, -1, 0, 1, 2].map((offset) => (
        <Line
          key={`grid-z-${offset}`}
          points={[
            [-2.9, -0.119, offset * 0.76],
            [2.9, -0.119, offset * 0.76],
          ]}
          color="#1d2230"
          lineWidth={0.48}
          transparent
          opacity={0.34}
        />
      ))}
      {[-2, -1, 0, 1, 2].map((offset) => (
        <Line
          key={`grid-x-${offset}`}
          points={[
            [offset * 0.92, -0.119, -2.2],
            [offset * 0.92, -0.119, 2.2],
          ]}
          color="#1d2230"
          lineWidth={0.48}
          transparent
          opacity={0.28}
        />
      ))}
      {showFrame ? (
        <>
          <mesh position={[0, 1.34, 0]}>
            <boxGeometry args={[3.7, 2.7, 2.36]} />
            <meshStandardMaterial color="#2a3242" transparent opacity={0.018} roughness={0.84} metalness={0.04} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.7, 2.7, 2.36)]} />
            <lineBasicMaterial color="#dbe3f1" transparent opacity={0.18} />
          </lineSegments>
        </>
      ) : null}
    </>
  );
}

function singleState(selected: boolean, hovered: boolean): CardVisualState {
  if (selected) {
    return 'selected';
  }
  if (hovered) {
    return 'hover';
  }
  return 'normal';
}

function multiState(index: number, selectedIndex: number | null, hoveredIndex: number | null): CardVisualState {
  if (selectedIndex === index) {
    return 'selected';
  }
  if (hoveredIndex === index) {
    return 'hover';
  }
  return 'normal';
}

function PreviewContent({ variant, mode }: { variant: CardVisualVariant; mode: StylePreviewMode }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const showFrame = mode === 'stack';
  const showLink = mode === 'stack' && selectedIndex !== null;

  const stackCards: { index: number; position: [number, number, number]; scale: number }[] = [
    { index: 0, position: [-0.66, 0.34, -0.08], scale: 0.94 },
    { index: 1, position: [-0.2, 0.86, 0.08], scale: 0.94 },
    { index: 2, position: [0.28, 1.38, -0.04], scale: 0.94 },
    { index: 3, position: [0.76, 1.9, 0.12], scale: 0.94 },
  ];

  const selectedCard = selectedIndex !== null ? stackCards[selectedIndex] : null;

  return (
    <>
      <MiniStage showFrame={showFrame} />

      {mode === 'single' ? (
        <GpuCardModel
          variant={variant}
          state={singleState(selectedIndex === 0, hoveredIndex === 0)}
          position={[0.08, 0.98, 0.2]}
          scale={1.72}
          onSelect={() => setSelectedIndex((current) => (current === 0 ? null : 0))}
          onHover={() => setHoveredIndex(0)}
          onBlur={() => setHoveredIndex(null)}
        />
      ) : (
        <>
          {stackCards.map((card) => (
            <GpuCardModel
              key={card.index}
              variant={variant}
              state={multiState(card.index, selectedIndex, hoveredIndex)}
              position={card.position}
              scale={card.scale}
              onSelect={() => setSelectedIndex((current) => (current === card.index ? null : card.index))}
              onHover={() => setHoveredIndex(card.index)}
              onBlur={() => setHoveredIndex((current) => (current === card.index ? null : current))}
            />
          ))}
          {showLink && selectedCard ? (
            <Line
              points={[
                [selectedCard.position[0] + 0.68, selectedCard.position[1] + 0.28, selectedCard.position[2] + 0.18],
                [selectedCard.position[0] + 0.92, 2.28, selectedCard.position[2] + 0.18],
                [0.92, 2.28, 0.72],
              ]}
              color="#86d9ff"
              lineWidth={1.3}
              transparent
              opacity={0.82}
            />
          ) : null}
        </>
      )}
    </>
  );
}

export function CardStylePreview({
  variant,
  mode,
}: {
  variant: CardVisualVariant;
  mode: StylePreviewMode;
}) {
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.96,
        powerPreference: 'high-performance',
      }}
    >
      <OrthographicCamera makeDefault position={[7.2, 6.5, 7.2]} zoom={94} near={0.1} far={100} onUpdate={(camera) => camera.lookAt(0, 1.02, 0)} />
      <color attach="background" args={['#0a0d13']} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[8, 12, 8]} intensity={1.14} />
      <pointLight position={[1, 2.9, 1.8]} intensity={0.46} color="#dce8ff" />
      <pointLight position={[-1.8, 1.8, -1.2]} intensity={0.24} color="#7ad0ff" />
      <PreviewContent variant={variant} mode={mode} />
    </Canvas>
  );
}
