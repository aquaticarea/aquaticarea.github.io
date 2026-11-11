/**
 * AquaticArea 3D Nature Aquarium Engine (js/aquarium3d.js)
 * - Full-Bleed Panoramic 3D Discus Community Planted Tank Setup (Three.js)
 * - Multiple Show Discus Varieties: Red Turquoise, Blue Diamond, Pigeon Blood & Heckel
 * - Schooling Cardinal & Neon Tetras + Rummy-Nose Tetras (Boids Simulation)
 * - Substrate Corydoras Catfish & Clean-Up Crew
 * - Amazonian Driftwood Roots, Weeping Moss & Swaying Amazon Swords / Vallisneria
 * - Active CO2 Oxygen Pearling Streams & Volumetric Sunbeams
 * - Interactive Feeding System (Click anywhere to feed the Discus community)
 * - 4 Lighting Spectrum Presets (Daylight, Sunset, Moonlight, RGB Plant)
 * - Web Audio API Ambient Stream & Bubble Sound Synthesizer
 * - 3D Rimless Tank Studio with OrbitControls & Hardware Telemetry
 * - 3D Card Hover Tilt Physics
 */

(function () {
  'use strict';

  window.Aquatic3D = {
    heroTank: null,
    calcTank: null,
    audioEngine: null,
    init: initAquatic3D
  };

  /* =========================================================================
     1. PROCEDURAL TEXTURES (Discus Varieties, Tetras, Substrate, Caustics)
     ========================================================================= */
  const Textures = {
    createCausticCanvas() {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#011522';
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
      ctx.lineWidth = 3;
      ctx.filter = 'blur(4px)';

      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = 25 + Math.random() * 55;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      return new THREE.CanvasTexture(c);
    },

    createDiscusTexture(variety = 'red_turquoise') {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');

      if (variety === 'red_turquoise') {
        // Red Turquoise Discus (Deep crimson base with electric cyan striations)
        const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
        grad.addColorStop(0, '#e11d48');
        grad.addColorStop(0.65, '#991b1b');
        grad.addColorStop(1, '#450a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;

        for (let i = 0; i < 18; i++) {
          ctx.beginPath();
          const y = 80 + i * 20;
          ctx.moveTo(60, y);
          for (let x = 60; x <= 450; x += 30) {
            const cy = y + Math.sin(x * 0.04 + i) * 12 + (Math.random() - 0.5) * 8;
            ctx.lineTo(x, cy);
          }
          ctx.stroke();
        }
      } else if (variety === 'blue_diamond') {
        // Blue Diamond / Cobalt Discus (Vibrant metallic sapphire blue)
        const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Subtle shimmering scale highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        for (let r = 0; r < 200; r++) {
          const x = 80 + Math.random() * 350;
          const y = 80 + Math.random() * 350;
          ctx.beginPath();
          ctx.arc(x, y, 4 + Math.random() * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (variety === 'pigeon_blood') {
        // Pigeon Blood / Fire Red Discus (Flame orange-red with golden lace pepper)
        const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
        grad.addColorStop(0, '#fbbf24');
        grad.addColorStop(0.4, '#f97316');
        grad.addColorStop(0.85, '#dc2626');
        grad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Golden-white lacework
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.65)';
        ctx.lineWidth = 3.5;
        for (let i = 0; i < 14; i++) {
          ctx.beginPath();
          ctx.arc(256, 256, 50 + i * 16, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (variety === 'heckel') {
        // Wild Amazon Heckel Discus (Earthy hazel base with distinctive black center bar)
        const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
        grad.addColorStop(0, '#d97706');
        grad.addColorStop(0.6, '#92400e');
        grad.addColorStop(1, '#451a03');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Prominent 5th vertical black Heckel stress bar
        ctx.fillStyle = 'rgba(20, 10, 5, 0.85)';
        ctx.fillRect(235, 30, 42, 452);

        // Turquoise rim lines
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(80, 70 + i * 25);
          ctx.lineTo(430, 70 + i * 25);
          ctx.stroke();
        }
      }

      // Brilliant Ruby Eye with Black Pupil & Specular Catchlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(140, 220, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(140, 220, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(135, 215, 4.5, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    },

    createSoilTexture() {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#1a100a';
      ctx.fillRect(0, 0, 128, 128);

      for (let i = 0; i < 450; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const r = 1 + Math.random() * 2.8;
        const shade = Math.floor(25 + Math.random() * 45);
        ctx.fillStyle = `rgb(${shade + 12}, ${shade - 4}, ${shade - 14})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 8);
      return tex;
    }
  };

  /* =========================================================================
     2. PROCEDURAL 3D FISH: DISCUS, TETRAS, RUMMY-NOSE & CORYDORAS
     ========================================================================= */
  class DiscusFish {
    constructor(scene, options = {}) {
      this.scene = scene;
      this.speed = options.speed || (0.012 + Math.random() * 0.006);
      this.bounds = options.bounds || { minX: -6.5, maxX: 6.5, minY: -1.6, maxY: 1.8, minZ: -2.8, maxZ: 1.5 };
      this.timeOffset = Math.random() * 100;
      this.target = new THREE.Vector3(0, 0, 0);
      this.wiggleSpeed = 3.8 + Math.random() * 1.5;
      this.variety = options.variety || 'red_turquoise';

      this.group = new THREE.Group();
      this.buildMesh(options);
      this.group.position.set(
        options.x || (Math.random() - 0.5) * 8,
        options.y || (Math.random() - 0.5) * 2,
        options.z || (Math.random() - 0.5) * 3
      );
      this.pickNewTarget();
      this.scene.add(this.group);
    }

    buildMesh(options) {
      const texture = Textures.createDiscusTexture(this.variety);

      // 1. Disc-shaped body
      const bodyGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.16, 32);
      bodyGeo.rotateZ(Math.PI / 2);
      bodyGeo.scale(1.22, 0.98, 0.42);

      const bodyMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.22,
        metalness: 0.18
      });
      this.body = new THREE.Mesh(bodyGeo, bodyMat);
      this.group.add(this.body);

      // 2. Continuous Dorsal & Ventral Fin Trim
      const finColor = options.finColor || 0x06b6d4;
      const finMat = new THREE.MeshPhysicalMaterial({
        color: finColor,
        transparent: true,
        opacity: 0.85,
        roughness: 0.2,
        transmission: 0.45,
        side: THREE.DoubleSide
      });

      const crestGeo = new THREE.RingGeometry(0.76, 1.05, 32, 1, 0.35, Math.PI * 0.92);
      crestGeo.rotateY(Math.PI / 2);
      const dorsal = new THREE.Mesh(crestGeo, finMat);
      dorsal.position.set(0, 0.18, 0);
      this.group.add(dorsal);

      const ventralGeo = new THREE.RingGeometry(0.76, 1.02, 32, 1, Math.PI * 1.04, Math.PI * 0.88);
      ventralGeo.rotateY(Math.PI / 2);
      const analFin = new THREE.Mesh(ventralGeo, finMat);
      analFin.position.set(0, -0.18, 0);
      this.group.add(analFin);

      // 3. Waving Caudal Tail Joint
      this.tailGroup = new THREE.Group();
      this.tailGroup.position.set(-0.85, 0, 0);

      const tailGeo = new THREE.ConeGeometry(0.48, 0.72, 16);
      tailGeo.rotateZ(Math.PI / 2);
      tailGeo.scale(0.12, 1.25, 1);
      const tailMesh = new THREE.Mesh(tailGeo, finMat);
      tailMesh.position.set(-0.32, 0, 0);
      this.tailGroup.add(tailMesh);
      this.group.add(this.tailGroup);

      // 4. Moving Pectoral Fins (Left & Right)
      const pecGeo = new THREE.PlaneGeometry(0.26, 0.18);
      this.pecL = new THREE.Mesh(pecGeo, finMat);
      this.pecL.position.set(0.32, -0.12, 0.1);
      this.pecL.rotation.y = 0.35;
      this.group.add(this.pecL);

      this.pecR = new THREE.Mesh(pecGeo, finMat);
      this.pecR.position.set(0.32, -0.12, -0.1);
      this.pecR.rotation.y = -0.35;
      this.group.add(this.pecR);

      const scale = options.scale || (0.95 + Math.random() * 0.25);
      this.group.scale.set(scale, scale, scale);
    }

    pickNewTarget() {
      this.target.set(
        this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX),
        this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY),
        this.bounds.minZ + Math.random() * (this.bounds.maxZ - this.bounds.minZ)
      );
    }

    update(time, foodPellets = []) {
      let currentTarget = this.target;

      // Discus detect and swim toward sinking food pellets
      if (foodPellets.length > 0) {
        let nearestFood = null;
        let minDist = 999;
        for (const f of foodPellets) {
          const d = this.group.position.distanceTo(f.mesh.position);
          if (d < minDist) {
            minDist = d;
            nearestFood = f;
          }
        }
        if (nearestFood && minDist < 4.5) {
          currentTarget = nearestFood.mesh.position;
          if (minDist < 0.45) {
            nearestFood.consumed = true;
          }
        }
      }

      const dir = new THREE.Vector3().subVectors(currentTarget, this.group.position);
      const dist = dir.length();

      if (dist < 0.45 && currentTarget === this.target) {
        this.pickNewTarget();
      }

      dir.normalize();
      this.group.position.addScaledVector(dir, this.speed);

      // Smooth turning yaw
      const targetAngle = Math.atan2(-dir.z, dir.x);
      this.group.rotation.y += THREE.MathUtils.degToRad(
        THREE.MathUtils.radToDeg(targetAngle - this.group.rotation.y) * 0.045
      );

      // Subtle body pitch
      this.group.rotation.z = -dir.y * 0.25;

      // Undulating caudal fin wave
      const wiggle = Math.sin((time + this.timeOffset) * this.wiggleSpeed);
      this.tailGroup.rotation.y = wiggle * 0.42;

      // Fanning pectoral fins
      this.pecL.rotation.y = 0.35 + Math.sin(time * 9 + this.timeOffset) * 0.28;
      this.pecR.rotation.y = -0.35 - Math.sin(time * 9 + this.timeOffset) * 0.28;
    }
  }

  /* Schooling Cardinal & Neon Tetras */
  class CardinalTetraSchool {
    constructor(scene, count = 24, bounds) {
      this.scene = scene;
      this.count = count;
      this.bounds = bounds || { minX: -7.5, maxX: 7.5, minY: -1.2, maxY: 1.8, minZ: -2.8, maxZ: 1.8 };
      this.tetras = [];
      this.schoolTarget = new THREE.Vector3(0, 0.4, 0);
      this.targetTimer = 0;

      this.buildSchool();
    }

    buildSchool() {
      const bodyGeo = new THREE.ConeGeometry(0.065, 0.34, 8);
      bodyGeo.rotateZ(Math.PI / 2);

      // Iridescent neon-cyan upper dorsal stripe
      const matTop = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00a3cc,
        emissiveIntensity: 0.7,
        roughness: 0.2
      });

      // Cardinal deep ruby-red belly & tail
      const matRed = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.88
      });

      for (let i = 0; i < this.count; i++) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(bodyGeo, matTop);
        group.add(body);

        const redBellyGeo = new THREE.ConeGeometry(0.048, 0.22, 6);
        redBellyGeo.rotateZ(Math.PI / 2);
        const redBelly = new THREE.Mesh(redBellyGeo, matRed);
        redBelly.position.set(-0.06, -0.02, 0);
        group.add(redBelly);

        const tailGeo = new THREE.PlaneGeometry(0.11, 0.1);
        const tail = new THREE.Mesh(tailGeo, matRed);
        tail.position.set(-0.21, 0, 0);
        group.add(tail);

        group.position.set(
          (Math.random() - 0.5) * 6,
          0.3 + (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3
        );

        this.scene.add(group);
        this.tetras.push({
          group,
          tail,
          velocity: new THREE.Vector3((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.03),
          phase: Math.random() * Math.PI * 2,
          speed: 0.028 + Math.random() * 0.014
        });
      }
    }

    update(time, foodPellets = []) {
      this.targetTimer += 0.01;
      if (this.targetTimer > 3.5) {
        this.targetTimer = 0;
        this.schoolTarget.set(
          this.bounds.minX + 1.2 + Math.random() * (this.bounds.maxX - this.bounds.minX - 2.4),
          this.bounds.minY + 0.5 + Math.random() * (this.bounds.maxY - this.bounds.minY - 0.8),
          this.bounds.minZ + 0.6 + Math.random() * (this.bounds.maxZ - this.bounds.minZ - 1.2)
        );
      }

      let attractTarget = this.schoolTarget;
      if (foodPellets.length > 0) {
        attractTarget = foodPellets[0].mesh.position;
      }

      for (let i = 0; i < this.tetras.length; i++) {
        const t = this.tetras[i];
        const p = t.group.position;

        const steer = new THREE.Vector3().subVectors(attractTarget, p).multiplyScalar(0.016);
        t.velocity.add(steer);

        for (let j = 0; j < this.tetras.length; j++) {
          if (i !== j) {
            const diff = new THREE.Vector3().subVectors(p, this.tetras[j].group.position);
            const dist = diff.length();
            if (dist > 0 && dist < 0.42) {
              diff.normalize().multiplyScalar(0.009 / dist);
              t.velocity.add(diff);
            }
          }
        }

        if (p.x < this.bounds.minX) t.velocity.x += 0.035;
        if (p.x > this.bounds.maxX) t.velocity.x -= 0.035;
        if (p.y < this.bounds.minY) t.velocity.y += 0.035;
        if (p.y > this.bounds.maxY) t.velocity.y -= 0.035;
        if (p.z < this.bounds.minZ) t.velocity.z += 0.035;
        if (p.z > this.bounds.maxZ) t.velocity.z -= 0.035;

        t.velocity.clampLength(0.015, t.speed);
        p.add(t.velocity);

        const heading = Math.atan2(-t.velocity.z, t.velocity.x);
        t.group.rotation.y = heading;
        t.group.rotation.z = -t.velocity.y * 3;
        t.tail.rotation.y = Math.sin(time * 18 + t.phase) * 0.45;
      }
    }
  }

  /* Rummy-Nose Tetras (Classic Discus Tank Companion) */
  class RummyNoseSchool {
    constructor(scene, count = 14, bounds) {
      this.scene = scene;
      this.count = count;
      this.bounds = bounds || { minX: -7.0, maxX: 7.0, minY: -1.0, maxY: 1.5, minZ: -2.5, maxZ: 1.5 };
      this.fish = [];
      this.schoolTarget = new THREE.Vector3(-1, 0, 0);
      this.buildSchool();
    }

    buildSchool() {
      const bodyGeo = new THREE.ConeGeometry(0.06, 0.32, 8);
      bodyGeo.rotateZ(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        metalness: 0.5,
        roughness: 0.2
      });

      // Signature Scarlet-Red Face
      const redSnoutGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const redSnoutMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

      // Black-and-white checkered tail
      const tailGeo = new THREE.PlaneGeometry(0.12, 0.09);
      const tailMat = new THREE.MeshBasicMaterial({ color: 0x111827, side: THREE.DoubleSide });

      for (let i = 0; i < this.count; i++) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        const snout = new THREE.Mesh(redSnoutGeo, redSnoutMat);
        snout.position.set(0.16, 0, 0);
        group.add(snout);

        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(-0.21, 0, 0);
        group.add(tail);

        group.position.set(
          (Math.random() - 0.5) * 5,
          -0.2 + (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 2.5
        );

        this.scene.add(group);
        this.fish.push({
          group,
          tail,
          velocity: new THREE.Vector3(0.02, 0, 0),
          phase: Math.random() * Math.PI * 2,
          speed: 0.025 + Math.random() * 0.01
        });
      }
    }

    update(time) {
      if (Math.random() < 0.02) {
        this.schoolTarget.set(
          (Math.random() - 0.5) * 8,
          -0.4 + Math.random() * 1.4,
          (Math.random() - 0.5) * 3
        );
      }

      for (const f of this.fish) {
        const steer = new THREE.Vector3().subVectors(this.schoolTarget, f.group.position).multiplyScalar(0.012);
        f.velocity.add(steer);
        f.velocity.clampLength(0.012, f.speed);
        f.group.position.add(f.velocity);

        f.group.rotation.y = Math.atan2(-f.velocity.z, f.velocity.x);
        f.tail.rotation.y = Math.sin(time * 16 + f.phase) * 0.4;
      }
    }
  }

  /* Corydoras Catfish (Bottom Dwellers browsing the aquasoil) */
  class CorydorasCatfish {
    constructor(scene, count = 4) {
      this.scene = scene;
      this.corydoras = [];

      const bodyGeo = new THREE.ConeGeometry(0.1, 0.4, 8);
      bodyGeo.rotateZ(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x78716c,
        roughness: 0.8
      });

      for (let i = 0; i < count; i++) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        g.add(body);

        // Barbels
        const barbelGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08);
        barbelGeo.rotateZ(0.5);
        const barbel = new THREE.Mesh(barbelGeo, bodyMat);
        barbel.position.set(0.18, -0.04, 0);
        g.add(barbel);

        g.position.set((Math.random() - 0.5) * 7, -1.82 + Math.random() * 0.15, (Math.random() - 0.5) * 3);
        this.scene.add(g);
        this.corydoras.push({
          group: g,
          target: new THREE.Vector3((Math.random() - 0.5) * 7, -1.82, (Math.random() - 0.5) * 3),
          speed: 0.01 + Math.random() * 0.008
        });
      }
    }

    update(time) {
      for (const c of this.corydoras) {
        const diff = new THREE.Vector3().subVectors(c.target, c.group.position);
        if (diff.length() < 0.3) {
          c.target.set((Math.random() - 0.5) * 7, -1.82, (Math.random() - 0.5) * 3);
        }
        diff.normalize();
        c.group.position.addScaledVector(diff, c.speed);
        c.group.rotation.y = Math.atan2(-diff.z, diff.x);
        c.group.position.y = -1.82 + Math.sin(time * 6) * 0.03;
      }
    }
  }

  /* =========================================================================
     3. FULL-BLEED PANORAMIC AMAZONIAN DISCUS HARDSCAPE & FLORA
     ========================================================================= */
  class DiscusCommunityAquascape {
    constructor(scene) {
      this.scene = scene;
      this.plants = [];
      this.bubbles = [];
      this.buildSubstrate();
      this.buildDriftwoodRoots();
      this.buildAmazonFlora();
      this.buildPearlingBubbles();
    }

    buildSubstrate() {
      // Wide panoramic sloped active aquasoil bed
      const soilGeo = new THREE.PlaneGeometry(16, 6.5, 32, 20);
      soilGeo.rotateX(-Math.PI / 2);

      const pos = soilGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        const x = pos.getX(i);
        // Sloped aquasoil (higher at the back and sides)
        const slope = (z / 3.2) * -0.42 + Math.sin(x * 1.2) * 0.12;
        pos.setY(i, -1.9 + slope);
      }
      soilGeo.computeVertexNormals();

      const soilMat = new THREE.MeshStandardMaterial({
        color: 0x1f140c,
        roughness: 0.95,
        map: Textures.createSoilTexture()
      });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      this.scene.add(soil);
    }

    buildDriftwoodRoots() {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x422614, roughness: 0.88 });
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.92 });

      // Massive hanging Amazonian driftwood roots reaching from top surface into substrate
      const rootConfigs = [
        [new THREE.Vector3(-3.8, 2.4, -1.5), new THREE.Vector3(-2.8, 0.4, -0.8), new THREE.Vector3(-2.2, -1.8, -0.2)],
        [new THREE.Vector3(-2.8, 0.4, -0.8), new THREE.Vector3(-1.6, -0.4, 0.2), new THREE.Vector3(-0.8, -1.8, 0.6)],
        [new THREE.Vector3(2.6, 2.4, -1.4), new THREE.Vector3(1.8, 0.6, -0.6), new THREE.Vector3(1.2, -1.8, 0.2)],
        [new THREE.Vector3(1.8, 0.6, -0.6), new THREE.Vector3(2.8, -0.6, 0.2), new THREE.Vector3(3.6, -1.8, 0.4)]
      ];

      rootConfigs.forEach(pts => {
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.14, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, woodMat);
        this.scene.add(tubeMesh);

        // Clumps of weeping moss on roots
        for (let m = 0; m < 5; m++) {
          const mossGeo = new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.12, 1);
          const moss = new THREE.Mesh(mossGeo, mossMat);
          const pt = curve.getPoint((m + 1) / 6);
          moss.position.set(pt.x + (Math.random() - 0.5) * 0.12, pt.y + 0.05, pt.z + (Math.random() - 0.5) * 0.12);
          moss.scale.set(1.4, 0.8, 1.2);
          this.scene.add(moss);
        }
      });

      // River stones and Seiryu rock formations anchoring roots
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, flatShading: true });
      const rocks = [
        { x: -2.4, y: -1.75, z: -0.2, s: 0.8 },
        { x: -0.6, y: -1.8, z: 0.4, s: 0.55 },
        { x: 1.2, y: -1.75, z: 0.1, s: 0.75 },
        { x: 3.2, y: -1.8, z: 0.3, s: 0.6 }
      ];
      rocks.forEach(r => {
        const rockGeo = new THREE.DodecahedronGeometry(r.s, 1);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(r.x, r.y, r.z);
        rock.scale.set(1.1, 1.3, 0.85);
        this.scene.add(rock);
      });
    }

    buildAmazonFlora() {
      // 1. Tall Swaying Vallisneria Tape Grass (Background Forest)
      const valMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35, side: THREE.DoubleSide });
      const stemCount = 36;
      for (let i = 0; i < stemCount; i++) {
        const h = 1.8 + Math.random() * 1.6;
        const geo = new THREE.PlaneGeometry(0.14, h, 2, 8);
        geo.translate(0, h / 2, 0); // pivot at root

        const mesh = new THREE.Mesh(geo, valMat);
        const x = -7.5 + (i / stemCount) * 15 + (Math.random() - 0.5) * 0.5;
        const z = -1.2 + Math.random() * -1.2;
        mesh.position.set(x, -1.9, z);
        mesh.rotation.y = Math.random() * Math.PI;

        this.scene.add(mesh);
        this.plants.push({
          mesh,
          speed: 1.2 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
          maxAngle: 0.14 + Math.random() * 0.08
        });
      }

      // 2. Broad-Leaf Amazon Swords (Echinodorus Bleheri)
      const swordMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3, side: THREE.DoubleSide });
      const swordPositions = [-3.2, 0, 3.2];
      swordPositions.forEach(baseX => {
        for (let l = 0; l < 8; l++) {
          const lH = 1.2 + Math.random() * 0.8;
          const leafGeo = new THREE.PlaneGeometry(0.28, lH, 2, 6);
          leafGeo.translate(0, lH / 2, 0);

          const leaf = new THREE.Mesh(leafGeo, swordMat);
          leaf.position.set(baseX + (Math.random() - 0.5) * 0.4, -1.8, -0.6 + (Math.random() - 0.5) * 0.5);
          leaf.rotation.y = (l / 8) * Math.PI * 2;
          leaf.rotation.z = (Math.random() - 0.5) * 0.3;

          this.scene.add(leaf);
          this.plants.push({
            mesh: leaf,
            speed: 1.0 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            maxAngle: 0.08
          });
        }
      });
    }

    buildPearlingBubbles() {
      // 60 Rising Pearling Micro-Bubbles from plants
      const bubbleCount = 60;
      const bubbleGeo = new THREE.SphereGeometry(0.026, 8, 8);
      const bubbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xa5f3fc,
        roughness: 0.04,
        transmission: 0.92,
        transparent: true,
        opacity: 0.8
      });

      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        const scale = 0.5 + Math.random() * 1.8;
        bubble.scale.set(scale, scale, scale);
        bubble.position.set(
          (Math.random() - 0.5) * 14,
          -1.8 + Math.random() * 4,
          (Math.random() - 0.5) * 4
        );
        this.scene.add(bubble);
        this.bubbles.push({
          mesh: bubble,
          speed: 0.009 + Math.random() * 0.018,
          wobbleSpeed: 2 + Math.random() * 4,
          initX: bubble.position.x
        });
      }
    }

    update(time) {
      // Plant swaying
      for (const p of this.plants) {
        p.mesh.rotation.z = Math.sin(time * p.speed + p.phase) * p.maxAngle;
      }

      // Rising pearling bubbles
      for (const b of this.bubbles) {
        b.mesh.position.y += b.speed;
        b.mesh.position.x = b.initX + Math.sin(time * b.wobbleSpeed) * 0.045;
        if (b.mesh.position.y > 2.4) {
          b.mesh.position.y = -1.8;
          b.initX = (Math.random() - 0.5) * 14;
          b.mesh.position.x = b.initX;
        }
      }
    }
  }

  /* =========================================================================
     4. PROCEDURAL WEB AUDIO SYNTHESIZER
     ========================================================================= */
  class AquaticAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.filter = null;
      this.gainNode = null;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }

    start() {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(380, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 2.5);

      whiteNoise.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.whiteNoiseSource = whiteNoise;
      this.isPlaying = true;

      this.bubbleInterval = setInterval(() => {
        if (this.isPlaying && Math.random() > 0.4) {
          this.playBubblePop();
        }
      }, 900);
    }

    playBubblePop() {
      if (!this.ctx || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 600 + Math.random() * 800;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    }

    stop() {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.whiteNoiseSource) {
            try { this.whiteNoiseSource.stop(); } catch (e) {}
          }
          if (this.bubbleInterval) clearInterval(this.bubbleInterval);
          this.isPlaying = false;
        }, 850);
      } else {
        this.isPlaying = false;
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.start();
        return true;
      }
    }
  }

  /* =========================================================================
     5. HERO 3D PANORAMIC VIEWPORT MANAGER
     ========================================================================= */
  class HeroAquariumManager {
    constructor(canvasContainerId) {
      this.container = document.getElementById(canvasContainerId);
      if (!this.container) return;

      this.foodPellets = [];
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.activeLightMode = 'daylight';
      this.currentViewMode = 'wide';

      this.initThree();
      this.setupLighting();
      this.populateDiscusCommunity();
      this.bindEvents();
      this.animate(0);
    }

    initThree() {
      this.width = this.container.clientWidth || window.innerWidth;
      this.height = this.container.clientHeight || 650;

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x021627, 0.10);

      this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.1, 100);
      this.camera.position.set(0, 0.1, 6.2);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;

      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
      this.ambientLight = new THREE.AmbientLight(0x0369a1, 1.4);
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xe0f2fe, 2.6);
      this.sunLight.position.set(0, 6, 2.5);
      this.scene.add(this.sunLight);

      this.accentLight = new THREE.PointLight(0x10b981, 1.6, 12);
      this.accentLight.position.set(-3, 1.5, 1);
      this.scene.add(this.accentLight);

      this.accentWarm = new THREE.PointLight(0xf59e0b, 1.4, 12);
      this.accentWarm.position.set(3, 1.5, 1);
      this.scene.add(this.accentWarm);
    }

    setLightingMode(mode) {
      this.activeLightMode = mode;
      switch (mode) {
        case 'daylight':
          this.ambientLight.color.setHex(0x0369a1);
          this.ambientLight.intensity = 1.4;
          this.sunLight.color.setHex(0xe0f2fe);
          this.sunLight.intensity = 2.6;
          this.accentLight.color.setHex(0x10b981);
          this.scene.fog.color.setHex(0x021627);
          break;
        case 'sunset':
          this.ambientLight.color.setHex(0x78350f);
          this.ambientLight.intensity = 1.2;
          this.sunLight.color.setHex(0xfbbf24);
          this.sunLight.intensity = 3.0;
          this.accentLight.color.setHex(0xf97316);
          this.scene.fog.color.setHex(0x1a0f07);
          break;
        case 'moonlight':
          this.ambientLight.color.setHex(0x030712);
          this.ambientLight.intensity = 0.65;
          this.sunLight.color.setHex(0x38bdf8);
          this.sunLight.intensity = 1.3;
          this.accentLight.color.setHex(0x6366f1);
          this.scene.fog.color.setHex(0x020617);
          break;
        case 'rgb_grow':
          this.ambientLight.color.setHex(0x4c1d95);
          this.ambientLight.intensity = 1.5;
          this.sunLight.color.setHex(0xf43f5e);
          this.sunLight.intensity = 2.8;
          this.accentLight.color.setHex(0x06b6d4);
          this.scene.fog.color.setHex(0x14051a);
          break;
      }
    }

    populateDiscusCommunity() {
      // 1. Panoramic Amazon Hardscape
      this.aquascape = new DiscusCommunityAquascape(this.scene);

      // 2. The Four Show Discus of the Community
      this.discusList = [
        new DiscusFish(this.scene, {
          variety: 'red_turquoise',
          finColor: 0x06b6d4,
          x: -1.8, y: 0.3, z: 0.4,
          scale: 1.15
        }),
        new DiscusFish(this.scene, {
          variety: 'blue_diamond',
          finColor: 0x38bdf8,
          x: 1.5, y: -0.2, z: -0.5,
          scale: 1.1
        }),
        new DiscusFish(this.scene, {
          variety: 'pigeon_blood',
          finColor: 0xf59e0b,
          x: 2.8, y: 0.6, z: 0.2,
          scale: 1.05
        }),
        new DiscusFish(this.scene, {
          variety: 'heckel',
          finColor: 0x38bdf8,
          x: -3.4, y: -0.5, z: -0.8,
          scale: 1.0
        })
      ];

      // 3. School of 24 Cardinal Tetras
      this.cardinalSchool = new CardinalTetraSchool(this.scene, 24);

      // 4. School of 14 Rummy-Nose Tetras
      this.rummyNoseSchool = new RummyNoseSchool(this.scene, 14);

      // 5. Corydoras Catfish Bottom Dwellers
      this.corydoras = new CorydorasCatfish(this.scene, 5);
    }

    dropFood(count = 6) {
      const foodGeo = new THREE.DodecahedronGeometry(0.042, 1);
      const foodMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.4,
        emissive: 0xd97706,
        emissiveIntensity: 0.35
      });

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(foodGeo, foodMat);
        mesh.position.set(
          (Math.random() - 0.5) * 8,
          2.2 + Math.random() * 0.3,
          (Math.random() - 0.5) * 3
        );
        this.scene.add(mesh);
        this.foodPellets.push({
          mesh,
          vy: 0.007 + Math.random() * 0.008,
          wobble: Math.random() * Math.PI * 2,
          consumed: false
        });
      }

      this.showToastNotification('🦐 Discus Micro-Pellets Dropped! Watch them feed!');
    }

    showToastNotification(text) {
      let toast = document.getElementById('aquatic-3d-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'aquatic-3d-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-400/50 text-cyan-200 text-xs font-mono-tech shadow-2xl backdrop-blur-md transition-opacity duration-300 pointer-events-none opacity-0';
        document.body.appendChild(toast);
      }
      toast.textContent = text;
      toast.style.opacity = '1';
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
      }, 2500);
    }

    setViewMode(mode) {
      this.currentViewMode = mode;
      switch (mode) {
        case 'wide':
          this.cameraTargetPos = new THREE.Vector3(0, 0.1, 6.2);
          break;
        case 'discus':
          this.cameraTargetPos = new THREE.Vector3(0, 0.1, 4.0);
          break;
        case 'tetras':
          this.cameraTargetPos = new THREE.Vector3(-1.2, 0.2, 3.8);
          break;
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        if (!this.container) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight || 650;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      });

      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.8;
        this.mouse.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -0.9;
      });

      this.container.addEventListener('click', (e) => {
        if (e.target.closest('.hero-3d-hud-btn, button, a, input')) return;
        this.dropFood(5);
      });
    }

    animate(timestamp) {
      requestAnimationFrame((t) => this.animate(t));
      const time = timestamp * 0.001;

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      const baseTarget = this.cameraTargetPos || new THREE.Vector3(0, 0.1, 6.2);
      this.camera.position.x = baseTarget.x + this.mouse.x;
      this.camera.position.y = baseTarget.y + this.mouse.y;
      this.camera.position.z = baseTarget.z;
      this.camera.lookAt(0, 0, 0);

      for (let i = this.foodPellets.length - 1; i >= 0; i--) {
        const fp = this.foodPellets[i];
        fp.mesh.position.y -= fp.vy;
        fp.mesh.position.x += Math.sin(time * 3 + fp.wobble) * 0.003;

        if (fp.consumed || fp.mesh.position.y < -1.8) {
          this.scene.remove(fp.mesh);
          this.foodPellets.splice(i, 1);
        }
      }

      if (this.discusList) {
        for (const d of this.discusList) d.update(time, this.foodPellets);
      }
      if (this.cardinalSchool) this.cardinalSchool.update(time, this.foodPellets);
      if (this.rummyNoseSchool) this.rummyNoseSchool.update(time);
      if (this.corydoras) this.corydoras.update(time);
      if (this.aquascape) this.aquascape.update(time);

      this.renderer.render(this.scene, this.camera);
    }
  }

  /* =========================================================================
     6. 3D CUSTOM TANK STUDIO & CALCULATOR (OrbitControls)
     ========================================================================= */
  class CustomTankStudio {
    constructor(viewportId) {
      this.viewport = document.getElementById(viewportId);
      if (!this.viewport) return;
      this.currentHardscapeStyle = 'ryuboku';
      this.init();
    }

    init() {
      const w = this.viewport.clientWidth || 450;
      const h = this.viewport.clientHeight || 300;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      this.camera.position.set(3.8, 2.5, 4.4);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.viewport.innerHTML = '';
      this.viewport.appendChild(this.renderer.domElement);

      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 12;
        this.controls.minDistance = 1.8;
      }

      const amb = new THREE.AmbientLight(0xffffff, 1.4);
      this.scene.add(amb);

      const topLight = new THREE.DirectionalLight(0x00f2fe, 2.2);
      topLight.position.set(4, 8, 5);
      this.scene.add(topLight);

      this.tankGroup = new THREE.Group();
      this.scene.add(this.tankGroup);

      this.studioFish = [];
      this.buildStudioFish();

      const animate = () => {
        requestAnimationFrame(animate);
        if (this.controls) this.controls.update();
        else if (this.tankGroup) this.tankGroup.rotation.y += 0.005;

        for (const f of this.studioFish) {
          f.mesh.position.x += f.vx;
          if (Math.abs(f.mesh.position.x) > f.maxX) {
            f.vx *= -1;
            f.mesh.rotation.y = f.vx > 0 ? 0 : Math.PI;
          }
          f.tail.rotation.y = Math.sin(Date.now() * 0.015) * 0.4;
        }

        this.renderer.render(this.scene, this.camera);
      };
      animate();

      window.addEventListener('resize', () => {
        if (!this.viewport) return;
        const width = this.viewport.clientWidth;
        const height = this.viewport.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      });
    }

    buildStudioFish() {
      for (let i = 0; i < 3; i++) {
        const fg = new THREE.Group();
        const bodyGeo = new THREE.ConeGeometry(0.08, 0.3, 8);
        bodyGeo.rotateZ(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0xef4444 : 0x00f2fe,
          roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        fg.add(body);

        const tailGeo = new THREE.PlaneGeometry(0.12, 0.1);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(-0.2, 0, 0);
        fg.add(tail);

        fg.position.set((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 0.8);
        this.scene.add(fg);
        this.studioFish.push({
          mesh: fg,
          tail,
          vx: (0.01 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1),
          maxX: 1.2
        });
      }
    }

    rebuild(L, W, H, soilCm, hardscapeStyle = 'ryuboku') {
      this.currentHardscapeStyle = hardscapeStyle;
      while (this.tankGroup.children.length > 0) {
        this.tankGroup.remove(this.tankGroup.children[0]);
      }

      const scale = 2.6 / Math.max(L, W, H);
      const bL = L * scale;
      const bW = W * scale;
      const bH = H * scale;
      const sH = Math.max(0.06, (soilCm / H) * bH);

      for (const f of this.studioFish) {
        f.maxX = (bL * 0.42);
        f.mesh.position.y = -bH / 2 + sH + 0.2 + Math.random() * 0.3;
      }

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.15,
        roughness: 0.05,
        transmission: 0.95,
        thickness: 0.3,
        ior: 1.52,
        reflectivity: 0.6
      });
      const glassGeo = new THREE.BoxGeometry(bL, bH, bW);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      this.tankGroup.add(glassMesh);

      const edges = new THREE.EdgesGeometry(glassGeo);
      const edgeLines = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
      );
      this.tankGroup.add(edgeLines);

      const waterH = bH * 0.92 - sH;
      if (waterH > 0.04) {
        const waterGeo = new THREE.BoxGeometry(bL * 0.99, waterH, bW * 0.99);
        const waterMat = new THREE.MeshPhysicalMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.28,
          roughness: 0.1,
          transmission: 0.75
        });
        const waterMesh = new THREE.Mesh(waterGeo, waterMat);
        waterMesh.position.y = -bH / 2 + sH + waterH / 2;
        this.tankGroup.add(waterMesh);
      }

      const soilGeo = new THREE.BoxGeometry(bL * 0.99, sH, bW * 0.99);
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x24160d, roughness: 0.95 });
      const soilMesh = new THREE.Mesh(soilGeo, soilMat);
      soilMesh.position.y = -bH / 2 + sH / 2;
      this.tankGroup.add(soilMesh);

      if (hardscapeStyle === 'ryuboku') {
        const woodGeo = new THREE.CylinderGeometry(0.04, 0.1, bH * 0.75, 8);
        woodGeo.rotateZ(Math.PI / 4);
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c17, roughness: 0.85 });
        const branch = new THREE.Mesh(woodGeo, woodMat);
        branch.position.set(-bL * 0.1, -bH / 2 + sH + (bH * 0.3), 0);
        this.tankGroup.add(branch);

        const mossGeo = new THREE.DodecahedronGeometry(0.12, 1);
        const mossMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 });
        const moss = new THREE.Mesh(mossGeo, mossMat);
        moss.position.set(-bL * 0.05, -bH / 2 + sH + (bH * 0.38), 0.05);
        this.tankGroup.add(moss);
      } else if (hardscapeStyle === 'iwagumi') {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, flatShading: true });
        const mainStoneGeo = new THREE.DodecahedronGeometry(bH * 0.35, 1);
        const mainStone = new THREE.Mesh(mainStoneGeo, stoneMat);
        mainStone.position.set(-bL * 0.15, -bH / 2 + sH + (bH * 0.2), 0);
        mainStone.scale.set(0.9, 1.4, 0.7);
        this.tankGroup.add(mainStone);

        const subStone = new THREE.Mesh(new THREE.DodecahedronGeometry(bH * 0.22, 1), stoneMat);
        subStone.position.set(bL * 0.2, -bH / 2 + sH + (bH * 0.1), 0.1);
        subStone.scale.set(0.8, 1.1, 0.7);
        this.tankGroup.add(subStone);
      } else if (hardscapeStyle === 'biotope') {
        const rootMat = new THREE.MeshStandardMaterial({ color: 0x3e2312, roughness: 0.8 });
        const rootGeo = new THREE.CylinderGeometry(0.02, 0.08, bH * 0.85, 6);
        rootGeo.rotateZ(-0.4);
        const root = new THREE.Mesh(rootGeo, rootMat);
        root.position.set(bL * 0.15, -bH / 2 + sH + (bH * 0.4), -bW * 0.1);
        this.tankGroup.add(root);
      }
    }
  }

  /* =========================================================================
     7. 3D CARD HOVER TILT
     ========================================================================= */
  function init3DCardTilt() {
    const cards = document.querySelectorAll('.driftwood-box, .habitat-card');
    cards.forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.25s ease';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotateX = ((y - cy) / cy) * -8.0;
        const rotateY = ((x - cx) / cx) * 8.0;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  /* =========================================================================
     8. INITIALIZATION BOOTSTRAP
     ========================================================================= */
  window.Aquatic3D.HeroAquariumManager = HeroAquariumManager;

  function initAquatic3D() {
    window.Aquatic3D.audioEngine = new AquaticAudioEngine();

    if (document.getElementById('feed-discus-aquarium')) {
      window.Aquatic3D.feedTank = new HeroAquariumManager('feed-discus-aquarium');
    } else if (document.getElementById('hero-3d-aquarium')) {
      window.Aquatic3D.heroTank = new HeroAquariumManager('hero-3d-aquarium');
    }

    if (document.getElementById('three-tank-viewport')) {
      window.Aquatic3D.calcTank = new CustomTankStudio('three-tank-viewport');
    }

    init3DCardTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAquatic3D);
  } else {
    initAquatic3D();
  }

})();
