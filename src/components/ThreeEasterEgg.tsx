import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X } from 'lucide-react';

export type EasterEggMode = 'none' | 'pink-flowers' | 'ocean-fish';

interface ThreeEasterEggProps {
  mode: EasterEggMode;
  onDismiss: () => void;
}

export const ThreeEasterEgg: React.FC<ThreeEasterEggProps> = ({ mode, onDismiss }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'none' || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.6);
    fillLight.position.set(-5, -6, 5);
    scene.add(fillLight);

    let animationFrameId = 0;
    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material }[] = [];

    // ─────────────────────────────────────────────────────────────
    // SCENE 1: PINK FLOWERS & PETALS ("asude" / "açuçi" / "asoude")
    // ─────────────────────────────────────────────────────────────
    if (mode === 'pink-flowers') {
      const flowersGroup = new THREE.Group();
      scene.add(flowersGroup);

      const petalGeo = new THREE.SphereGeometry(0.7, 12, 12);
      petalGeo.scale(0.38, 1.15, 0.14);
      disposables.push({ geometry: petalGeo });

      const centerGeo = new THREE.SphereGeometry(0.3, 12, 12);
      disposables.push({ geometry: centerGeo });

      const centerMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.4
      });
      disposables.push({ material: centerMat });

      const pinkTones = [0xff69b4, 0xf43f5e, 0xfb7185, 0xf472b6, 0xfbcfe8];

      const flowers: { group: THREE.Group; rotSpeed: number; swaySpeed: number; baseScale: number }[] = [];
      const flowerPositions = [
        [-5, 3, -1],
        [5, 2.5, -2],
        [-3.5, -3, 0],
        [4, -3.5, 1],
        [0, 0, -3]
      ];

      flowerPositions.forEach((pos, fIdx) => {
        const flower = new THREE.Group();
        flower.position.set(pos[0], pos[1], pos[2]);

        const mat = new THREE.MeshStandardMaterial({
          color: pinkTones[fIdx % pinkTones.length],
          roughness: 0.35,
          side: THREE.DoubleSide
        });
        disposables.push({ material: mat });

        const center = new THREE.Mesh(centerGeo, centerMat);
        flower.add(center);

        const petalCount = 6;
        for (let i = 0; i < petalCount; i++) {
          const petalMesh = new THREE.Mesh(petalGeo, mat);
          const angle = (i / petalCount) * Math.PI * 2;
          petalMesh.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0);
          petalMesh.rotation.z = angle - Math.PI / 2;
          petalMesh.rotation.x = 0.22;
          flower.add(petalMesh);
        }

        flower.scale.set(0, 0, 0);
        flowersGroup.add(flower);
        flowers.push({
          group: flower,
          rotSpeed: 0.2 + Math.random() * 0.2,
          swaySpeed: 1.2 + Math.random() * 0.5,
          baseScale: 0.9 + Math.random() * 0.35
        });
      });

      const fallingPetals: {
        mesh: THREE.Mesh;
        speedY: number;
        swaySpeed: number;
        rotSpeedX: number;
        rotSpeedY: number;
        rotSpeedZ: number;
        offset: number;
      }[] = [];

      const petalSingleGeo = new THREE.PlaneGeometry(0.45, 0.65);
      disposables.push({ geometry: petalSingleGeo });

      for (let i = 0; i < 45; i++) {
        const color = pinkTones[i % pinkTones.length];
        const petalMat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88
        });
        disposables.push({ material: petalMat });

        const mesh = new THREE.Mesh(petalSingleGeo, petalMat);
        mesh.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 8
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(mesh);

        fallingPetals.push({
          mesh,
          speedY: 0.8 + Math.random() * 1.2,
          swaySpeed: 1.5 + Math.random() * 2,
          rotSpeedX: (Math.random() - 0.5) * 2,
          rotSpeedY: (Math.random() - 0.5) * 2.5,
          rotSpeedZ: (Math.random() - 0.5) * 1.5,
          offset: Math.random() * 10
        });
      }

      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        flowers.forEach(f => {
          const targetScale = f.baseScale;
          f.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.04);
          f.group.rotation.z += f.rotSpeed * 0.01;
          f.group.rotation.x = Math.sin(elapsed * f.swaySpeed) * 0.15;
          f.group.rotation.y = Math.cos(elapsed * f.swaySpeed) * 0.15;
        });

        fallingPetals.forEach(p => {
          p.mesh.position.y -= p.speedY * 0.02;
          p.mesh.position.x += Math.sin(elapsed * p.swaySpeed + p.offset) * 0.015;

          p.mesh.rotation.x += p.rotSpeedX * 0.02;
          p.mesh.rotation.y += p.rotSpeedY * 0.02;
          p.mesh.rotation.z += p.rotSpeedZ * 0.02;

          if (p.mesh.position.y < -9) {
            p.mesh.position.y = 9;
            p.mesh.position.x = (Math.random() - 0.5) * 20;
          }
        });

        renderer.render(scene, camera);
      };

      animate();
    }

    // ─────────────────────────────────────────────────────────────
    // SCENE 2: REALISTIC AESTHETIC 3D FISH ("binali" / "binosh")
    // ─────────────────────────────────────────────────────────────
    else if (mode === 'ocean-fish') {
      const fishGroup = new THREE.Group();
      scene.add(fishGroup);

      // 1. PROCEDURAL HYDRODYNAMIC FISH BODY (Lathe spline with lateral compression)
      const bodyPoints: THREE.Vector2[] = [];
      const steps = 24;
      const bodyLength = 1.35;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps; // 0 = mouth, 1 = peduncle (tail wrist)
        const x = (0.45 - t) * bodyLength; // x from +0.6 to -0.75
        let r = 0;
        if (t < 0.28) {
          // Sleek head & mouth curve
          r = Math.sin((t / 0.28) * (Math.PI / 2)) * 0.26;
        } else {
          // Taper down gently to tail peduncle
          const decay = (t - 0.28) / 0.72;
          r = 0.26 * Math.cos(decay * (Math.PI / 2) * 0.88);
        }
        bodyPoints.push(new THREE.Vector2(Math.max(0.015, r), x));
      }

      const bodyBaseGeo = new THREE.LatheGeometry(bodyPoints, 20);
      bodyBaseGeo.rotateZ(-Math.PI / 2); // align forward along +X
      bodyBaseGeo.scale(1.0, 1.25, 0.55); // realistic laterally compressed fish torso
      bodyBaseGeo.computeVertexNormals();
      disposables.push({ geometry: bodyBaseGeo });

      // 2. FLOWING CAUDAL (TAIL) FIN WITH LYRETAIL / FORK SHAPE
      const tailShape = new THREE.Shape();
      tailShape.moveTo(0, 0);
      tailShape.bezierCurveTo(-0.18, 0.18, -0.36, 0.38, -0.55, 0.44); // upper crest
      tailShape.bezierCurveTo(-0.46, 0.2, -0.36, 0.05, -0.28, 0.0);   // graceful center cleft
      tailShape.bezierCurveTo(-0.36, -0.05, -0.46, -0.2, -0.55, -0.44); // lower crest
      tailShape.bezierCurveTo(-0.36, -0.38, -0.18, -0.18, 0, 0);
      const tailGeo = new THREE.ShapeGeometry(tailShape, 12);
      disposables.push({ geometry: tailGeo });

      // 3. PECTORAL SIDE FINS
      const pecShape = new THREE.Shape();
      pecShape.moveTo(0, 0);
      pecShape.bezierCurveTo(0.08, 0.12, 0.22, 0.18, 0.28, 0.08);
      pecShape.bezierCurveTo(0.2, -0.02, 0.08, -0.05, 0, 0);
      const pecGeo = new THREE.ShapeGeometry(pecShape, 8);
      disposables.push({ geometry: pecGeo });

      // 4. DORSAL CREST FIN
      const dorsalShape = new THREE.Shape();
      dorsalShape.moveTo(0, 0);
      dorsalShape.bezierCurveTo(-0.15, 0.22, -0.32, 0.24, -0.44, 0.03);
      dorsalShape.lineTo(0, 0);
      const dorsalGeo = new THREE.ShapeGeometry(dorsalShape, 8);
      disposables.push({ geometry: dorsalGeo });

      // 5. EYE
      const eyeScleraGeo = new THREE.SphereGeometry(0.055, 10, 10);
      disposables.push({ geometry: eyeScleraGeo });
      const eyePupilGeo = new THREE.SphereGeometry(0.035, 8, 8);
      disposables.push({ geometry: eyePupilGeo });

      const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      disposables.push({ material: eyePupilMat });

      // Aesthetic species color palettes: Koi, Neon Azure, Tangerine Gold, Emerald Reef
      const fishColorPalettes = [
        { body: 0x0ea5e9, fin: 0x38bdf8, eye: 0xe0f2fe }, // Azure Neon
        { body: 0xf97316, fin: 0xfdba74, eye: 0xffedd5 }, // Tangerine Koi
        { body: 0x06b6d4, fin: 0x67e8f9, eye: 0xcffafe }, // Cyan Coral
        { body: 0x14b8a6, fin: 0x5eead4, eye: 0xccfbf1 }, // Seafoam Discus
        { body: 0xf43f5e, fin: 0xfb7185, eye: 0xffe4e6 }, // Ruby Tetra
        { body: 0xeab308, fin: 0xfef08a, eye: 0xfef9c3 }  // Golden Sunburst
      ];

      interface RealisticFishInstance {
        root: THREE.Group;
        tailPivot: THREE.Group;
        pecLeft: THREE.Mesh;
        pecRight: THREE.Mesh;
        speed: number;
        wiggleFreq: number;
        radiusX: number;
        radiusY: number;
        heightOffset: number;
        depthZ: number;
        phase: number;
      }

      const fishes: RealisticFishInstance[] = [];

      // Create 10 delicate, aesthetic, realistically scaled fish
      const fishCount = 10;
      for (let i = 0; i < fishCount; i++) {
        const fish = new THREE.Group();
        const palette = fishColorPalettes[i % fishColorPalettes.length];

        // Body Material with pearlescent sheen
        const bodyMat = new THREE.MeshPhysicalMaterial({
          color: palette.body,
          roughness: 0.18,
          metalness: 0.28,
          clearcoat: 0.85,
          clearcoatRoughness: 0.12
        });
        disposables.push({ material: bodyMat });

        // Fin Material: translucent, soft, elegant
        const finMat = new THREE.MeshPhysicalMaterial({
          color: palette.fin,
          transparent: true,
          opacity: 0.74,
          roughness: 0.25,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
        disposables.push({ material: finMat });

        const eyeScleraMat = new THREE.MeshBasicMaterial({ color: palette.eye });
        disposables.push({ material: eyeScleraMat });

        // Add Torpedo Body
        const bodyMesh = new THREE.Mesh(bodyBaseGeo, bodyMat);
        fish.add(bodyMesh);

        // Add Realistic Eyes on Head Sides
        const eyeL = new THREE.Group();
        eyeL.position.set(0.38, 0.08, 0.11);
        eyeL.add(new THREE.Mesh(eyeScleraGeo, eyeScleraMat));
        const pupilL = new THREE.Mesh(eyePupilGeo, eyePupilMat);
        pupilL.position.set(0.02, 0, 0.02);
        eyeL.add(pupilL);
        fish.add(eyeL);

        const eyeR = new THREE.Group();
        eyeR.position.set(0.38, 0.08, -0.11);
        eyeR.add(new THREE.Mesh(eyeScleraGeo, eyeScleraMat));
        const pupilR = new THREE.Mesh(eyePupilGeo, eyePupilMat);
        pupilR.position.set(0.02, 0, -0.02);
        eyeR.add(pupilR);
        fish.add(eyeR);

        // Dorsal Fin Crest
        const dorsalMesh = new THREE.Mesh(dorsalGeo, finMat);
        dorsalMesh.position.set(0.05, 0.26, 0);
        dorsalMesh.rotation.y = 0;
        fish.add(dorsalMesh);

        // Pectoral Fins (Fluttering Side Fins)
        const pecLeft = new THREE.Mesh(pecGeo, finMat);
        pecLeft.position.set(0.18, -0.06, 0.13);
        pecLeft.rotation.set(0.2, 0.6, -0.2);
        fish.add(pecLeft);

        const pecRight = new THREE.Mesh(pecGeo, finMat);
        pecRight.position.set(0.18, -0.06, -0.13);
        pecRight.rotation.set(-0.2, -0.6, -0.2);
        fish.add(pecRight);

        // Articulated Tail Hinge (Peduncle)
        const tailPivot = new THREE.Group();
        tailPivot.position.set(-0.72, 0, 0); // attached at tail wrist
        const tailMesh = new THREE.Mesh(tailGeo, finMat);
        tailPivot.add(tailMesh);
        fish.add(tailPivot);

        // DELICATE, SMALLER SCALING (as requested by user)
        const scale = 0.36 + Math.random() * 0.16;
        fish.scale.set(scale, scale, scale);

        fishGroup.add(fish);

        fishes.push({
          root: fish,
          tailPivot,
          pecLeft,
          pecRight,
          speed: 0.5 + Math.random() * 0.6,
          wiggleFreq: 4.5 + Math.random() * 3,
          radiusX: 6.5 + Math.random() * 4.5,
          radiusY: 2.2 + Math.random() * 2.2,
          heightOffset: (Math.random() - 0.5) * 6,
          depthZ: (Math.random() - 0.5) * 6,
          phase: (i / fishCount) * Math.PI * 2
        });
      }

      // 3D Rising Glowing Bubbles
      const bubbleGeo = new THREE.SphereGeometry(0.14, 12, 12);
      disposables.push({ geometry: bubbleGeo });
      const bubbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.88,
        roughness: 0.1,
        transparent: true,
        opacity: 0.55
      });
      disposables.push({ material: bubbleMat });

      const bubbles: { mesh: THREE.Mesh; speedY: number; wobbleSpeed: number; offset: number }[] = [];
      for (let b = 0; b < 24; b++) {
        const bMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
        const s = 0.35 + Math.random() * 0.6;
        bMesh.scale.set(s, s, s);
        bMesh.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 8
        );
        scene.add(bMesh);
        bubbles.push({
          mesh: bMesh,
          speedY: 0.9 + Math.random() * 1.3,
          wobbleSpeed: 2 + Math.random() * 2.5,
          offset: Math.random() * 10
        });
      }

      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Realistic Undulating Swimming Animation
        fishes.forEach(f => {
          const t = elapsed * f.speed + f.phase;

          // Smooth elliptical 3D path with vertical wave
          const x = Math.sin(t) * f.radiusX;
          const y = f.heightOffset + Math.cos(t * 1.25) * (f.radiusY * 0.45);
          const z = f.depthZ + Math.sin(t * 0.75) * 1.6;

          // Look ahead in trajectory
          const nextT = t + 0.04;
          const nextX = Math.sin(nextT) * f.radiusX;
          const nextY = f.heightOffset + Math.cos(nextT * 1.25) * (f.radiusY * 0.45);
          const nextZ = f.depthZ + Math.sin(nextT * 0.75) * 1.6;

          f.root.position.set(x, y, z);
          f.root.lookAt(nextX, nextY, nextZ);

          // Natural Spine & Body Sway (S-wave)
          const spineWiggle = Math.sin(elapsed * f.wiggleFreq);
          f.root.rotateY(spineWiggle * 0.08);

          // Articulated Tail fin whip with phase lag
          f.tailPivot.rotation.y = Math.sin(elapsed * f.wiggleFreq - 0.9) * 0.45;

          // Pectoral fin gentle fluttering
          f.pecLeft.rotation.z = -0.2 + Math.sin(elapsed * f.wiggleFreq * 1.3) * 0.22;
          f.pecRight.rotation.z = -0.2 - Math.sin(elapsed * f.wiggleFreq * 1.3) * 0.22;
        });

        // Rising Bubbles
        bubbles.forEach(b => {
          b.mesh.position.y += b.speedY * 0.018;
          b.mesh.position.x += Math.sin(elapsed * b.wobbleSpeed + b.offset) * 0.008;

          if (b.mesh.position.y > 9) {
            b.mesh.position.y = -9;
            b.mesh.position.x = (Math.random() - 0.5) * 16;
          }
        });

        renderer.render(scene, camera);
      };

      animate();
    }

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount or mode change
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      disposables.forEach(d => {
        d.geometry?.dispose();
        d.material?.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [mode]);

  if (mode === 'none') return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none">
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Discrete, minimalist close button on the top-right corner without text clutter */}
      <div className="absolute top-4 right-4 pointer-events-auto z-50">
        <button
          type="button"
          onClick={onDismiss}
          className="w-8 h-8 rounded-full bg-black/25 dark:bg-white/15 backdrop-blur-md hover:bg-black/40 dark:hover:bg-white/25 text-white flex items-center justify-center transition-all shadow-md active:scale-90"
          title="Kapat"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
