import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

// Types
export interface Asteroid3DProps {
  type?: 'iron' | 'rocky' | 'cometary';
  size?: number; // relative scale
  className?: string;
  fallbackImage?: string;
}

// Procedural Asteroid Mesh Component
function AsteroidMesh({ type = 'rocky', size = 1 }: { type?: 'iron' | 'rocky' | 'cometary', size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Auto-rotate
  useFrame((_state, delta) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  // Generate procedural geometry based on type
  const geometry = useMemo(() => {
    // Base icosahedron with high detail for displacement
    const geo = new THREE.IcosahedronGeometry(1, 16);
    const posAttribute = geo.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Seeded noise for deterministic shape
    const noise3D = createNoise3D(() => 0.5); // Fixed seed for consistency
    
    // Type-specific parameters
    let noiseScale = 1.5;
    let displacementStrength = 0.2;
    let craterStrength = 0.1;
    
    if (type === 'iron') {
      noiseScale = 0.8;
      displacementStrength = 0.1; // Smoother, regmaglypts
      craterStrength = 0.05;
    } else if (type === 'cometary') {
      noiseScale = 2.5;
      displacementStrength = 0.3; // Very irregular, lumpy
      craterStrength = 0.15;
    }

    // Apply displacement
    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      
      // Base shape noise
      const n1 = noise3D(vertex.x * noiseScale, vertex.y * noiseScale, vertex.z * noiseScale);
      
      // High frequency detail
      const n2 = noise3D(vertex.x * noiseScale * 4, vertex.y * noiseScale * 4, vertex.z * noiseScale * 4) * 0.2;
      
      // Craters (inverted noise)
      let craters = 0;
      if (type !== 'iron') {
        const n3 = noise3D(vertex.x * noiseScale * 2 + 10, vertex.y * noiseScale * 2 + 10, vertex.z * noiseScale * 2 + 10);
        craters = Math.max(0, n3 - 0.5) * 2 * craterStrength; // Only deep pits
      }
      
      const displacement = 1 + (n1 + n2) * displacementStrength - craters;
      vertex.multiplyScalar(displacement);
      
      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [type]);

  // Material based on type
  const materialProps = useMemo(() => {
    if (type === 'iron') {
      return {
        color: '#4a4a4a',
        roughness: 0.4,
        metalness: 0.8,
      };
    } else if (type === 'cometary') {
      return {
        color: '#d2dce6',
        roughness: 0.9,
        metalness: 0.1,
      };
    }
    // Default rocky
    return {
      color: '#807460',
      roughness: 0.8,
      metalness: 0.2,
    };
  }, [type]);

  return (
    <mesh ref={meshRef} geometry={geometry} scale={size}>
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}

// Fallback SVG for Suspense
function AsteroidFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-void text-ink-muted">
      <svg width="100" height="100" viewBox="0 0 100 100" className="animate-pulse">
        <path 
          d="M50 10 C30 10 15 25 10 45 C5 65 20 85 40 90 C60 95 85 80 90 60 C95 40 70 10 50 10 Z" 
          fill="#1a2035" 
          stroke="#3a4566" 
          strokeWidth="2"
        />
        <circle cx="35" cy="40" r="8" fill="#0d1424" />
        <circle cx="65" cy="55" r="12" fill="#0d1424" />
        <circle cx="45" cy="75" r="6" fill="#0d1424" />
      </svg>
    </div>
  );
}

// Main Component
export default function Asteroid3D({ 
  type = 'rocky', 
  size = 1, 
  className = '',
  fallbackImage = '/assets/asteroid-rocky@1x.png'
}: Asteroid3DProps) {
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  if (!webGLSupported) {
    return (
      <div className={`relative w-full h-full min-h-[300px] flex items-center justify-center bg-void rounded-lg overflow-hidden ${className}`} aria-label={`3D ${type} asteroid fallback image`}>
        <img 
          src={fallbackImage} 
          alt={`${type} asteroid`} 
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-void ${className}`} aria-label={`Interactive 3D ${type} asteroid`}>
      <React.Suspense fallback={<AsteroidFallback />}>
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} color="#b4c8dc" />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#ffaa3d" />
          
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <AsteroidMesh type={type} size={size} />
          </Float>
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minDistance={2} 
            maxDistance={10}
            autoRotate={false} // Handled manually for prefers-reduced-motion
          />
        </Canvas>
      </React.Suspense>
    </div>
  );
}
