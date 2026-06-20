import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './CarViewer3D.css';

const COLOR_PALETTE = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#eab308', // Yellow
  '#111827', // Black
  '#f3f4f6', // White
  '#8b5cf6', // Purple
  '#64748b'  // Gray
];

function CarViewer3D({ carModel = null }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const carRef = useRef(null);
  const carBodyRef = useRef(null);
  const controlsRef = useRef(null);

  const ambientLightRef = useRef(null);
  const directionalLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const floorRef = useRef(null);
  const gridHelperRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [customColor, setCustomColor] = useState('');
  const [environment, setEnvironment] = useState('day');

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5);
    scene.fog = new THREE.Fog(0xf0f2f5, 10, 50); // Add fog to blend the horizon
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4, 2, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize resolution
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.3); // soft blue fill light
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Environment: Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorRef.current = floor;

    // Environment: Grid Helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
    gridHelper.material.opacity = 0.05;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Create a simple car representation
    const carGroup = new THREE.Group();

    // Car body (cube representation)
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.8, 3.8);
    const initialColor = carModel?.color ? new THREE.Color(carModel.color) : new THREE.Color(0xff0000);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: initialColor, 
      metalness: 0.6, 
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.position.y = 0.5; // raise above ground
    carBody.castShadow = true;
    carBodyRef.current = carBody;
    carGroup.add(carBody);

    // Car Cabin
    const cabinGeometry = new THREE.BoxGeometry(1.4, 0.6, 1.8);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.9 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.2, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    
    const positions = [
      { x: -0.9, z: 1.1 },
      { x: 0.9, z: 1.1 },
      { x: -0.9, z: -1.2 },
      { x: 0.9, z: -1.2 },
    ];

    positions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.35, pos.z);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    scene.add(carGroup);
    carRef.current = carGroup;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't let the camera go below ground
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      controls.update(); // Required if damping is enabled

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Cleanup Three.js resources
      scene.clear();
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle auto-rotate state change
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [autoRotate]);

  // Update environment theme (lighting, background, fog, grid, floor)
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const ambientLight = ambientLightRef.current;
    const directionalLight = directionalLightRef.current;
    const fillLight = fillLightRef.current;
    const floor = floorRef.current;
    const gridHelper = gridHelperRef.current;

    if (environment === 'day') {
      scene.background = new THREE.Color(0xf0f2f5);
      scene.fog.color.set(0xf0f2f5);
      scene.fog.near = 10;
      scene.fog.far = 50;

      if (ambientLight) {
        ambientLight.color.set(0xffffff);
        ambientLight.intensity = 0.6;
      }
      if (directionalLight) {
        directionalLight.color.set(0xffffff);
        directionalLight.intensity = 0.8;
      }
      if (fillLight) {
        fillLight.color.set(0xe0e7ff);
        fillLight.intensity = 0.3;
      }
      if (floor) {
        floor.material.color.set(0xffffff);
        floor.material.roughness = 0.1;
        floor.material.metalness = 0.2;
      }
      if (gridHelper) {
        gridHelper.visible = true;
        gridHelper.material.color.set(0x000000);
        gridHelper.material.opacity = 0.05;
      }
    } else if (environment === 'sunset') {
      scene.background = new THREE.Color(0xfdba74); // Warm light orange
      scene.fog.color.set(0xfdba74);
      scene.fog.near = 8;
      scene.fog.far = 40;

      if (ambientLight) {
        ambientLight.color.set(0xfed7aa); // Soft orange ambient
        ambientLight.intensity = 0.5;
      }
      if (directionalLight) {
        directionalLight.color.set(0xf97316); // Sun orange directional
        directionalLight.intensity = 1.0;
      }
      if (fillLight) {
        fillLight.color.set(0xec4899); // Soft pink fill
        fillLight.intensity = 0.4;
      }
      if (floor) {
        floor.material.color.set(0xffedd5); // Warm sand floor
        floor.material.roughness = 0.3;
        floor.material.metalness = 0.1;
      }
      if (gridHelper) {
        gridHelper.visible = true;
        gridHelper.material.color.set(0xd97706);
        gridHelper.material.opacity = 0.1;
      }
    } else if (environment === 'neon') {
      scene.background = new THREE.Color(0x090514); // Cyber midnight violet
      scene.fog.color.set(0x090514);
      scene.fog.near = 5;
      scene.fog.far = 30;

      if (ambientLight) {
        ambientLight.color.set(0x1e1b4b); // Dark indigo ambient
        ambientLight.intensity = 0.4;
      }
      if (directionalLight) {
        directionalLight.color.set(0xec4899); // Bright neon magenta
        directionalLight.intensity = 1.0;
      }
      if (fillLight) {
        fillLight.color.set(0x06b6d4); // Bright neon cyan
        fillLight.intensity = 0.8;
      }
      if (floor) {
        floor.material.color.set(0x111827); // Dark carbon asphalt floor
        floor.material.roughness = 0.2;
        floor.material.metalness = 0.9; // Highly reflective
      }
      if (gridHelper) {
        gridHelper.visible = true;
        gridHelper.material.color.set(0x06b6d4); // Cyan grid lines
        gridHelper.material.opacity = 0.25;
      }
    }
  }, [environment]);

  // Update color when carModel changes or customColor is picked
  useEffect(() => {
    if (carBodyRef.current) {
      const targetColor = customColor || (carModel?.color ? carModel.color : '#ff0000');
      carBodyRef.current.material.color.set(targetColor);
    }
  }, [carModel, customColor]);

  // Reset custom color and auto-rotation when a new car is selected
  useEffect(() => {
    setCustomColor('');
    setAutoRotate(true);
  }, [carModel?.id]);

  return (
    <div className="car-viewer-container">
      <div ref={containerRef} className="car-viewer-canvas" />
      
      {/* UI Overlays */}
      <div className="car-viewer-overlay">
        
        {/* Auto Rotate Toggle */}
        <div className="car-viewer-card car-viewer-rotate-row">
          <span className="car-viewer-label">Auto Rotate</span>
          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`car-viewer-toggle ${autoRotate ? 'active' : ''}`}
            aria-label="Toggle auto rotate"
          >
            <div className="car-viewer-toggle-dot" />
          </button>
        </div>

        {/* Environment Theme Selector */}
        <div className="car-viewer-card">
          <p className="car-viewer-paint-title">Environment</p>
          <div className="car-viewer-env-row">
            <button 
              onClick={() => setEnvironment('day')}
              className={`env-theme-btn ${environment === 'day' ? 'active' : ''}`}
            >
              ☀️ Day
            </button>
            <button 
              onClick={() => setEnvironment('sunset')}
              className={`env-theme-btn ${environment === 'sunset' ? 'active' : ''}`}
            >
              🌅 Sunset
            </button>
            <button 
              onClick={() => setEnvironment('neon')}
              className={`env-theme-btn ${environment === 'neon' ? 'active' : ''}`}
            >
              🌌 Cyberpunk
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="car-viewer-card">
          <p className="car-viewer-paint-title">Custom Paint</p>
          <div className="car-viewer-palette-grid">
            {COLOR_PALETTE.map(color => (
              <button
                key={color}
                onClick={() => setCustomColor(color)}
                className={`car-viewer-color-btn ${customColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                title={`Paint color ${color}`}
              />
            ))}
          </div>
          {customColor && (
            <button 
              onClick={() => setCustomColor('')}
              className="car-viewer-reset-btn"
            >
              Reset to Original
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarViewer3D;
