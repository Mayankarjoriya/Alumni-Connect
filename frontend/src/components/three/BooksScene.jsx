import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function BooksModel(props) {
    // Note: useGLTF handles Draco decompression automatically if the file uses it
    const { scene } = useGLTF('/books.glb');
    
    // Auto-center and scale the model
    const group = useRef();
    
    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={scene} scale={6} position={[0, -1, 0]} />
        </group>
    );
}

export default function BooksScene() {
    return (
        <div className="w-full h-[500px] md:h-[600px] absolute right-0 top-1/2 -translate-y-1/2 md:translate-x-12 z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#5B4DFB" />
                
                <OrbitControls enableZoom={false} enablePan={false} />
                <Float rotationIntensity={0.4} floatIntensity={2} speed={1.5}>
                    <BooksModel />
                </Float>

                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}

// Preload the model
useGLTF.preload('/books.glb');
