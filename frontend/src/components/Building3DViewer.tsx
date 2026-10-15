import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { BuildingPrediction } from '../types';

interface Building3DViewerProps {
  building: BuildingPrediction;
}

function ExtrudedBuilding({ building }: { building: BuildingPrediction }) {
  const damageSeverity = building.damage_severity;

  let height = 1.2;
  const color = building.color;

  if (damageSeverity === 3) {
    height = 0.35;
  } else if (damageSeverity === 2) {
    height = 0.75;
  } else if (damageSeverity === 1) {
    height = 1.0;
  }

  return (
    <group>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>

      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1.6, height, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>

      {damageSeverity < 3 && (
        <mesh position={[0, height + 0.25, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.2, 0.5, 4]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      )}

      {damageSeverity >= 2 && (
        <group position={[0.6, 0.1, 0.6]}>
          <mesh position={[0.2, 0.1, 0.1]}>
            <boxGeometry args={[0.3, 0.15, 0.3]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>
          <mesh position={[-0.4, 0.1, -0.3]}>
            <boxGeometry args={[0.4, 0.2, 0.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export const Building3DViewer: React.FC<Building3DViewerProps> = ({ building }) => {
  return (
    <div className="w-full h-48 bg-slate-100 rounded border border-slate-200 relative overflow-hidden">
      <div className="absolute top-2 left-2 z-10 bg-white/90 text-slate-800 text-[11px] px-2 py-1 rounded border border-slate-200 font-mono shadow-sm">
        3D Structural Geometry | {building.id}
      </div>

      <Canvas camera={{ position: [2.8, 2.5, 2.8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <ExtrudedBuilding building={building} />
        <OrbitControls enableZoom={true} minDistance={2} maxDistance={6} />
      </Canvas>
    </div>
  );
};
