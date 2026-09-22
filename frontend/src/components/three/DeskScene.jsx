import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function DeskModel(props) {
    const { scene } = useGLTF('/desk.glb');
    const group = useRef();

    useEffect(() => {
        if (!group.current) return;

        // GSAP ScrollTrigger animation
        const ctx = gsap.context(() => {
            gsap.to(group.current.rotation, {
                y: Math.PI * 2, // Rotate a full 360 degrees based on scroll
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1, // Smooth scrubbing effect
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={scene} scale={3.5} position={[0, -2, 0]} />
        </group>
    );
}

export default function DeskScene() {
    return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-80">
            <Canvas camera={{ position: [5, 2, 8], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#5B4DFB" />
                
                <DeskModel />
                <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2} far={4} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}

useGLTF.preload('/desk.glb');
