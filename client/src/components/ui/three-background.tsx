import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
}

const ThreeBackground = ({ className = '' }: ThreeBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize the scene
    const initThree = () => {
      if (!containerRef.current) return;

      // Clean up previous instances
      if (rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }

      // Create scene with dark background
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111111); // Very dark gray, almost black
      sceneRef.current = scene;

      // Add subtle fog for depth
      scene.fog = new THREE.FogExp2(0x111111, 0.05);

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        70,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Create renderer with better quality
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance" 
      });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Add ambient light for base illumination
      const ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);

      // Add directional light for shadows and highlights
      const directionalLight = new THREE.DirectionalLight(0xff5577, 1);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Add a subtle point light with red tint
      const pointLight = new THREE.PointLight(0xff0033, 1, 10);
      pointLight.position.set(-2, 3, 3);
      scene.add(pointLight);

      // Add premium dark-themed particles
      addPremiumParticles(scene);

      // Add floating 3D objects
      addFloatingObjects(scene);

      // Add recycling symbols with professional look
      addRecyclingSymbols(scene);

      // Animation loop with time-based animation
      const clock = new THREE.Clock();
      const animate = () => {
        const delta = clock.getDelta();
        timeRef.current += delta;
        
        animationFrameRef.current = requestAnimationFrame(animate);

        // Rotate and move objects in scene with smooth animation
        scene.children.forEach(child => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
            // Different rotation speeds for different objects
            child.rotation.y += 0.2 * delta * (Math.sin(timeRef.current * 0.1) * 0.5 + 0.5);
            child.rotation.x += 0.1 * delta;
            
            // Subtle position animation if it has userData
            if (child.userData.floats) {
              child.position.y += Math.sin(timeRef.current + child.userData.offset) * 0.003;
            }
          }
        });

        // Slightly move camera for subtle parallax effect
        if (cameraRef.current) {
          cameraRef.current.position.x = Math.sin(timeRef.current * 0.2) * 0.2;
          cameraRef.current.position.y = Math.cos(timeRef.current * 0.1) * 0.1;
          cameraRef.current.lookAt(0, 0, 0);
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      };
    };

    initThree();
  }, []);

  const addPremiumParticles = (scene: THREE.Scene) => {
    // Create particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Professional crimson color palette
    const colorPalette = [
      new THREE.Color(0xff0033), // primary red
      new THREE.Color(0xff5577), // lighter red
      new THREE.Color(0xaa0022), // darker red
      new THREE.Color(0x550011), // very dark red
      new THREE.Color(0xffaabb), // light pink
      new THREE.Color(0x222222), // dark gray
    ];

    for (let i = 0; i < particleCount; i++) {
      // Position particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 3 + Math.random() * 5; // between 3 and 8
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random color from palette with weighting toward darker colors
      const colorIndex = Math.floor(Math.pow(Math.random(), 2) * colorPalette.length);
      const color = colorPalette[colorIndex];
      color.toArray(colors, i * 3);
      
      // Varied sizes for depth
      sizes[i] = 0.02 + Math.random() * 0.08;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create particle material with glow effect
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    // Create particle system
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.userData = { floats: true, offset: Math.random() * Math.PI * 2 };
    scene.add(particles);
  };

  const addFloatingObjects = (scene: THREE.Scene) => {
    // Add some floating 3D objects
    const geometries = [
      new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16),
      new THREE.IcosahedronGeometry(0.4, 1),
      new THREE.OctahedronGeometry(0.4, 1),
      new THREE.TetrahedronGeometry(0.5, 1)
    ];

    // Create professional materials with depth
    const createCustomMaterial = (baseColor: THREE.Color) => {
      return new THREE.MeshPhongMaterial({
        color: baseColor,
        shininess: 60,
        specular: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
    };
    
    const materials = [
      createCustomMaterial(new THREE.Color(0xff0033)),
      createCustomMaterial(new THREE.Color(0xaa0022)),
      createCustomMaterial(new THREE.Color(0xff5577)),
      createCustomMaterial(new THREE.Color(0x550011))
    ];
    
    // Add objects to scene
    for (let i = 0; i < 7; i++) {
      // Pick random geometry and material
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = materials[Math.floor(Math.random() * materials.length)];
      
      const mesh = new THREE.Mesh(geom, mat);
      
      // Random position further out from center
      const radius = 5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
      mesh.position.z = radius * Math.cos(phi);
      
      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.rotation.z = Math.random() * Math.PI;
      
      // Random scale for variety
      const scale = 0.4 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, scale);
      
      // Add float animation data
      mesh.userData = { floats: true, offset: Math.random() * Math.PI * 2 };
      
      // Cast and receive shadows for depth
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      scene.add(mesh);
    }
  };

  const addRecyclingSymbols = (scene: THREE.Scene) => {
    // Create a more detailed recycling arrow shape
    const createRecyclingArrow = () => {
      const shape = new THREE.Shape();
      
      // Draw more detailed arrow shape
      shape.moveTo(0, 0);
      shape.lineTo(0.6, 0);
      shape.lineTo(0.6, 0.2);
      shape.lineTo(1.0, -0.1);
      shape.lineTo(0.6, -0.4);
      shape.lineTo(0.6, -0.2);
      shape.lineTo(0, -0.2);
      shape.lineTo(0, 0);
      
      const extrudeSettings = {
        steps: 2,
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    };
    
    // Create three recycling arrows in a circular pattern
    const createRecyclingSymbol = () => {
      const group = new THREE.Group();
      
      for (let i = 0; i < 3; i++) {
        const arrowGeometry = createRecyclingArrow();
        const arrowMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff0033, // Using crimson red
          shininess: 80,
          specular: new THREE.Color(0xffffff),
          transparent: true,
          opacity: 0.8
        });
        
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.rotation.z = (Math.PI * 2 / 3) * i;
        arrow.position.x = 0.3 * Math.cos((Math.PI * 2 / 3) * i);
        arrow.position.y = 0.3 * Math.sin((Math.PI * 2 / 3) * i);
        
        // Enable shadows
        arrow.castShadow = true;
        arrow.receiveShadow = true;
        
        group.add(arrow);
      }
      
      return group;
    };
    
    // Add several recycling symbols to the scene
    for (let i = 0; i < 7; i++) {
      const symbol = createRecyclingSymbol();
      
      // Random position within a sphere
      const radius = 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      symbol.position.x = radius * Math.sin(phi) * Math.cos(theta);
      symbol.position.y = radius * Math.sin(phi) * Math.sin(theta);
      symbol.position.z = radius * Math.cos(phi);
      
      // Random rotation
      symbol.rotation.x = Math.random() * Math.PI;
      symbol.rotation.y = Math.random() * Math.PI;
      
      // Random scale
      const scale = 0.3 + Math.random() * 0.4;
      symbol.scale.set(scale, scale, scale);
      
      // Add custom data for animation
      symbol.userData = { floats: true, offset: Math.random() * Math.PI * 2 };
      
      scene.add(symbol);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 z-0"></div>
      <div ref={containerRef} className={`absolute inset-0 z-10 ${className}`} />
    </div>
  );
};

export default ThreeBackground;
