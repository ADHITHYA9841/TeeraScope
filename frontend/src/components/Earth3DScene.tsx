import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import earthTextureUrl from '../assets/earth_blue_marble.jpg';
import cloudsTextureUrl from '../assets/earth_clouds.png';

function SatelliteOrbit() {
  const satelliteRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.35;
    if (satelliteRef.current) {
      satelliteRef.current.position.x = Math.cos(t) * 3.3;
      satelliteRef.current.position.z = Math.sin(t) * 3.3;
      satelliteRef.current.position.y = Math.sin(t * 0.7) * 1.0;
      satelliteRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={satelliteRef}>
      {/* Main Satellite Body (Golden Thermal Foil Bus) */}
      <mesh>
        <boxGeometry args={[0.22, 0.22, 0.35]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Optical Sensor Aperture */}
      <mesh position={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Solar Panel Array Left */}
      <mesh position={[0.65, 0, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.28]} />
        <meshStandardMaterial color="#0369A1" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Solar Panel Array Right */}
      <mesh position={[-0.65, 0, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.28]} />
        <meshStandardMaterial color="#0369A1" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Parabolic Antenna Dish */}
      <mesh position={[0, 0.18, 0]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.02, 0.05, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

function GlobeInner() {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [earthMap, cloudsMap] = useTexture([earthTextureUrl, cloudsTextureUrl]);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0015;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0022;
    }
  });

  return (
    <group>
      {/* Real NASA Blue Marble Earth Sphere */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          map={earthMap}
          roughness={0.65}
          metalness={0.1}
        />
      </Sphere>

      {/* Real Earth Clouds Mesh Layer */}
      <Sphere ref={cloudsRef} args={[2.03, 64, 64]}>
        <meshStandardMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Blue Atmosphere Halo Shell */}
      <Sphere args={[2.08, 32, 32]}>
        <meshBasicMaterial
          color="#38bdf8"
          transparent={true}
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

    </group>
  );
}

function FallbackGlobe() {
  return (
    <Sphere args={[2, 32, 32]}>
      <meshStandardMaterial color="#0f2942" />
    </Sphere>
  );
}

export const Earth3DScene: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[380px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl">
      <div className="absolute top-3 left-3 z-10 bg-slate-950/90 backdrop-blur text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-800 font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Orbital Observation Stream (xView2 Benchmark Coverage)
      </div>

      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[12, 6, 8]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-10, -5, -6]} intensity={0.4} color="#0284c7" />
        <Suspense fallback={<FallbackGlobe />}>
          <GlobeInner />
          <SatelliteOrbit />
        </Suspense>
        <OrbitControls enableZoom={true} minDistance={3.5} maxDistance={7} autoRotate={false} />
      </Canvas>
    </div>
  );
};

