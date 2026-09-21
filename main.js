// Princess Isabelle - High-End 3D WebGL Studio & Packaging Engineering Engine
// Powered by Three.js

let scene, camera, renderer, controls;
let outerSleeve, innerDrawer, ribbonMesh;
let sachetStack = [];
let isolatedSachet, isolatedSerumPouch;
let activeMode = 'hero'; // 'hero', 'inside', 'exploded', 'turntable', 'mask', 'serum'
let isTurntableActive = false;
let slidePercent = 65;

// Animation state
let targetCamPos = new THREE.Vector3(160, 220, 260);
let targetLookAt = new THREE.Vector3(30, 0, 0);

// Initialize 3D Studio
function init3DStudio() {
  const container = document.getElementById('webgl-viewport');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF9F6FC);

  // Camera
  camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1200);
  camera.position.copy(targetCamPos);

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 + 0.05;
  controls.minDistance = 60;
  controls.maxDistance = 600;
  controls.target.copy(targetLookAt);

  // Lighting
  setupLighting();

  // Ground plane & contact shadow
  const groundGeo = new THREE.PlaneGeometry(800, 800);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -22;
  ground.receiveShadow = true;
  scene.add(ground);

  // Build Models
  buildPackagingModels();
  buildIsolatedProducts();

  // Event Listeners
  setupEventListeners();

  // Set default view
  setViewMode('hero');
  updateDrawerSlide(65);

  // Render loop
  animate();

  window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xFFFFFF, 1.3);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xFFF9EE, 1.65);
  mainLight.position.set(160, 260, 160);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xE9DCF2, 1.1);
  fillLight.position.set(-160, 140, -120);
  scene.add(fillLight);

  const goldRim = new THREE.DirectionalLight(0xFFE082, 1.35);
  goldRim.position.set(0, 180, -220);
  scene.add(goldRim);
}

// Procedural Art Canvas for Top Box Wrap
function createTopFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1380;
  const ctx = canvas.getContext('2d');

  // Pearlescent Lavender Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1380);
  grad.addColorStop(0, '#FAF2FE');
  grad.addColorStop(0.5, '#F3E5F8');
  grad.addColorStop(1, '#E7D5F0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1380);

  // Gold Outer Border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 7;
  ctx.strokeRect(48, 48, 928, 1284);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(62, 62, 900, 1256);

  // Royal Monogram Crest
  ctx.save();
  ctx.translate(512, 280);
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 56px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PI', 0, 5);
  ctx.restore();

  // Brand Name
  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 78px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Princess Isabelle', 512, 430);

  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('BEAUTY WOVEN IN SILK', 512, 482);

  // Ornamental Divider
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 525);
  ctx.lineTo(694, 525);
  ctx.stroke();

  // Product Name
  ctx.fillStyle = '#3B1E48';
  ctx.font = 'bold 46px "Playfair Display", Georgia, serif';
  ctx.fillText('GOLDEN SILK FACIAL MASK', 512, 610);

  ctx.fillStyle = '#7D3C98';
  ctx.font = '600 28px "Segoe UI", Arial, sans-serif';
  ctx.fillText('FRESH-MIX RITUAL • 3 SHEET MASKS', 512, 665);

  // Botanical Silk Feature Text
  ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
  ctx.beginPath();
  ctx.ellipse(512, 850, 240, 95, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#555555';
  ctx.font = '23px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Concentrated Silk Fibroin & Bio-Active Peptides', 512, 840);
  ctx.fillText('3 Sets • 30 ml Activated Serum per Treatment', 512, 882);

  // Bottom Luxury Guarantee
  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ROYAL LUXURY SKINCARE • CEILK SLIDE BOX EDITION', 512, 1210);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

// Procedural Sachet Canvas Texture
function createSachetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 600, 800);
  bg.addColorStop(0, '#FAF3FD');
  bg.addColorStop(0.5, '#F2E2F7');
  bg.addColorStop(1, '#E6D2F0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 800);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, 544, 744);

  // Crest
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(300, 160, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 38px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText('PI', 300, 174);

  // Text
  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 44px "Playfair Display", serif';
  ctx.fillText('Princess Isabelle', 300, 260);

  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('GOLDEN SILK FACIAL MASK', 300, 296);

  ctx.fillStyle = '#6A1B9A';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('FRESH-MIX DUAL POUCH', 300, 335);

  ctx.fillStyle = '#666';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText('1 Dry Silk Mask + 1 Serum 30 ml', 300, 365);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

// Procedural Serum Pouch Canvas Texture
function createSerumTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 450;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 450, 600);
  bg.addColorStop(0, '#FFFDF6');
  bg.addColorStop(0.5, '#FFF7DE');
  bg.addColorStop(1, '#FFE9AF');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 450, 600);

  ctx.strokeStyle = '#FFA000';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(20, 20, 410, 560);

  // Crest
  ctx.fillStyle = '#FFA000';
  ctx.beginPath();
  ctx.arc(225, 120, 35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 28px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText('PI', 225, 130);

  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 32px "Playfair Display", serif';
  ctx.fillText('Princess Isabelle', 225, 200);

  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.fillText('ROYAL RADIANCE FRESH SERUM', 225, 230);

  ctx.fillStyle = '#5E35B1';
  ctx.fillRect(145, 270, 160, 40);
  ctx.fillStyle = '#FFD54F';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('30 ml', 225, 297);

  ctx.fillStyle = '#777';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.fillText('Active Golden Silk Peptides', 225, 345);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

// Build Packaging Models
function buildPackagingModels() {
  const sleeveW = 132;
  const sleeveL = 174;
  const sleeveH = 43;

  // Outer Sleeve
  outerSleeve = new THREE.Group();
  const topFaceTex = createTopFaceTexture();

  const luxuryMat = new THREE.MeshStandardMaterial({
    color: 0xFAF2FE,
    roughness: 0.35,
    metalness: 0.12
  });

  const topFaceMat = new THREE.MeshStandardMaterial({
    map: topFaceTex,
    roughness: 0.28,
    metalness: 0.18
  });

  // Top Face
  const topGeo = new THREE.BoxGeometry(sleeveW, 2.5, sleeveL);
  const topFaceMesh = new THREE.Mesh(topGeo, [
    luxuryMat, luxuryMat, topFaceMat, luxuryMat, luxuryMat, luxuryMat
  ]);
  topFaceMesh.position.y = sleeveH / 2;
  topFaceMesh.castShadow = true;
  outerSleeve.add(topFaceMesh);

  // Bottom Face
  const bottomGeo = new THREE.BoxGeometry(sleeveW, 2.5, sleeveL);
  const bottomFaceMesh = new THREE.Mesh(bottomGeo, luxuryMat);
  bottomFaceMesh.position.y = -sleeveH / 2;
  bottomFaceMesh.receiveShadow = true;
  outerSleeve.add(bottomFaceMesh);

  // Left Spine (Closed)
  const spineGeo = new THREE.BoxGeometry(2.5, sleeveH, sleeveL);
  const spineMesh = new THREE.Mesh(spineGeo, luxuryMat);
  spineMesh.position.x = -sleeveW / 2;
  spineMesh.castShadow = true;
  outerSleeve.add(spineMesh);

  // Front & Back Edges
  const edgeGeo = new THREE.BoxGeometry(sleeveW, sleeveH, 2.5);
  const frontMesh = new THREE.Mesh(edgeGeo, luxuryMat);
  frontMesh.position.z = sleeveL / 2;
  outerSleeve.add(frontMesh);

  const backMesh = new THREE.Mesh(edgeGeo, luxuryMat);
  backMesh.position.z = -sleeveL / 2;
  outerSleeve.add(backMesh);

  scene.add(outerSleeve);

  // Inner Drawer Tray
  innerDrawer = new THREE.Group();
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0xF4ECF7,
    roughness: 0.4,
    metalness: 0.05
  });

  const dBaseGeo = new THREE.BoxGeometry(125, 2.5, 167);
  const dBaseMesh = new THREE.Mesh(dBaseGeo, trayMat);
  dBaseMesh.position.y = -sleeveH / 2 + 3.5;
  dBaseMesh.receiveShadow = true;
  innerDrawer.add(dBaseMesh);

  const wallH = 36;
  // Left Wall
  const dLeftGeo = new THREE.BoxGeometry(2, wallH, 167);
  const dLeftMesh = new THREE.Mesh(dLeftGeo, trayMat);
  dLeftMesh.position.set(-125/2, -sleeveH/2 + wallH/2 + 3.5, 0);
  innerDrawer.add(dLeftMesh);

  // Right Wall (Ribbon side)
  const dRightGeo = new THREE.BoxGeometry(2, wallH, 167);
  const dRightMesh = new THREE.Mesh(dRightGeo, trayMat);
  dRightMesh.position.set(125/2, -sleeveH/2 + wallH/2 + 3.5, 0);
  innerDrawer.add(dRightMesh);

  // Front & Back Walls
  const dFrontGeo = new THREE.BoxGeometry(125, wallH, 2);
  const dFrontMesh = new THREE.Mesh(dFrontGeo, trayMat);
  dFrontMesh.position.set(0, -sleeveH/2 + wallH/2 + 3.5, 167/2);
  innerDrawer.add(dFrontMesh);

  const dBackMesh = new THREE.Mesh(dFrontGeo, trayMat);
  dBackMesh.position.set(0, -sleeveH/2 + wallH/2 + 3.5, -167/2);
  innerDrawer.add(dBackMesh);

  // Champagne Gold Satin Ribbon (15 mm wide)
  const ribbonCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(125/2, -sleeveH/2 + 18, -7),
    new THREE.Vector3(125/2 + 38, -sleeveH/2 + 18, -7),
    new THREE.Vector3(125/2 + 38, -sleeveH/2 + 18, 7),
    new THREE.Vector3(125/2, -sleeveH/2 + 18, 7)
  );
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 30, 2.8, 12, false);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness: 0.3,
    metalness: 0.75
  });
  ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonMesh.castShadow = true;
  innerDrawer.add(ribbonMesh);

  // 3 Stacked Sachets
  const sachetTex = createSachetTexture();
  const sachetMat = new THREE.MeshStandardMaterial({
    map: sachetTex,
    roughness: 0.35,
    metalness: 0.25
  });
  const sachetSideMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness: 0.3,
    metalness: 0.8
  });
  const sachetGeo = new THREE.BoxGeometry(120, 10.5, 160);

  for (let i = 0; i < 3; i++) {
    const sachet = new THREE.Mesh(sachetGeo, [
      sachetSideMat, sachetSideMat, sachetMat, sachetSideMat, sachetSideMat, sachetSideMat
    ]);
    sachet.position.set(0, -sleeveH/2 + 9 + (i * 10.8), 0);
    sachet.castShadow = true;
    sachet.receiveShadow = true;
    innerDrawer.add(sachet);
    sachetStack.push(sachet);
  }

  scene.add(innerDrawer);
}

// Build Isolated Products (Mask Sachet & Serum Pouch for detail inspect mode)
function buildIsolatedProducts() {
  // Isolated Outer Sachet
  const sachetTex = createSachetTexture();
  const sMat = new THREE.MeshStandardMaterial({ map: sachetTex, roughness: 0.35, metalness: 0.25 });
  const goldBorderMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.28, metalness: 0.8 });
  const sGeo = new THREE.BoxGeometry(120, 11, 160);

  isolatedSachet = new THREE.Mesh(sGeo, [
    goldBorderMat, goldBorderMat, sMat, goldBorderMat, goldBorderMat, goldBorderMat
  ]);
  isolatedSachet.position.set(0, 50, 0);
  isolatedSachet.visible = false;
  scene.add(isolatedSachet);

  // Isolated Serum Pouch
  const serumTex = createSerumTexture();
  const serumMat = new THREE.MeshStandardMaterial({ map: serumTex, roughness: 0.3, metalness: 0.3 });
  const serumEdgeMat = new THREE.MeshStandardMaterial({ color: 0xFFA000, roughness: 0.3, metalness: 0.7 });
  const serumGeo = new THREE.BoxGeometry(90, 10, 120);

  isolatedSerumPouch = new THREE.Mesh(serumGeo, [
    serumEdgeMat, serumEdgeMat, serumMat, serumEdgeMat, serumEdgeMat, serumEdgeMat
  ]);
  isolatedSerumPouch.position.set(0, 50, 0);
  isolatedSerumPouch.visible = false;
  scene.add(isolatedSerumPouch);
}

// Update Drawer Slide
function updateDrawerSlide(percent) {
  slidePercent = percent;
  const maxSlide = 135;
  const slideX = (percent / 100) * maxSlide;
  if (innerDrawer && activeMode !== 'exploded') {
    innerDrawer.position.x = slideX;
  }
}

// Set View Modes
window.setViewMode = function(mode) {
  activeMode = mode;
  isTurntableActive = (mode === 'turntable');

  // Update UI button highlights
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  const targetBtn = document.getElementById(`view-btn-${mode}`);
  if (targetBtn) targetBtn.classList.add('active');

  const slider = document.getElementById('slide-range');
  const slideVal = document.getElementById('slide-value');

  // Reset visibility
  outerSleeve.visible = true;
  innerDrawer.visible = true;
  isolatedSachet.visible = false;
  isolatedSerumPouch.visible = false;

  switch (mode) {
    case 'hero':
      updateDrawerSlide(65);
      if (slider) slider.value = 65;
      if (slideVal) slideVal.textContent = '65%';
      targetCamPos.set(160, 220, 260);
      targetLookAt.set(30, 0, 0);
      resetExplodedTransforms();
      break;

    case 'inside':
      updateDrawerSlide(100);
      if (slider) slider.value = 100;
      if (slideVal) slideVal.textContent = '100%';
      targetCamPos.set(140, 270, 160);
      targetLookAt.set(80, 0, 0);
      resetExplodedTransforms();
      break;

    case 'exploded':
      // Explode the parts apart
      outerSleeve.position.set(-80, 0, 0);
      innerDrawer.position.set(80, 0, 0);
      // Elevate the 3 sachets
      if (sachetStack.length === 3) {
        sachetStack[0].position.set(0, 0, 0);
        sachetStack[1].position.set(0, 30, 0);
        sachetStack[2].position.set(0, 60, 0);
      }
      targetCamPos.set(220, 280, 320);
      targetLookAt.set(20, 30, 0);
      break;

    case 'turntable':
      updateDrawerSlide(75);
      if (slider) slider.value = 75;
      if (slideVal) slideVal.textContent = '75%';
      targetCamPos.set(180, 200, 250);
      targetLookAt.set(40, 0, 0);
      resetExplodedTransforms();
      break;

    case 'mask':
      outerSleeve.visible = false;
      innerDrawer.visible = false;
      isolatedSachet.visible = true;
      targetCamPos.set(0, 220, 180);
      targetLookAt.set(0, 50, 0);
      break;

    case 'serum':
      outerSleeve.visible = false;
      innerDrawer.visible = false;
      isolatedSerumPouch.visible = true;
      targetCamPos.set(0, 200, 160);
      targetLookAt.set(0, 50, 0);
      break;
  }
};

function resetExplodedTransforms() {
  outerSleeve.position.set(0, 0, 0);
  if (sachetStack.length === 3) {
    const sleeveH = 43;
    for (let i = 0; i < 3; i++) {
      sachetStack[i].position.set(0, -sleeveH/2 + 9 + (i * 10.8), 0);
    }
  }
  updateDrawerSlide(slidePercent);
}

// Event Listeners
function setupEventListeners() {
  const slider = document.getElementById('slide-range');
  const slideValText = document.getElementById('slide-value');

  if (slider) {
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (slideValText) slideValText.textContent = `${val}%`;
      updateDrawerSlide(val);
    });
  }

  const btnClosed = document.getElementById('btn-preset-closed');
  const btnPart = document.getElementById('btn-preset-part');
  const btnOpen = document.getElementById('btn-preset-open');

  if (btnClosed) {
    btnClosed.addEventListener('click', () => {
      if (slider) slider.value = 0;
      if (slideValText) slideValText.textContent = '0%';
      updateDrawerSlide(0);
      targetCamPos.set(0, 230, 210);
      targetLookAt.set(0, 0, 0);
    });
  }

  if (btnPart) {
    btnPart.addEventListener('click', () => setViewMode('hero'));
  }

  if (btnOpen) {
    btnOpen.addEventListener('click', () => setViewMode('inside'));
  }
}

// Dieline Tab Switcher
window.switchDieline = function(dielineName, tabBtn) {
  document.querySelectorAll('.dieline-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (tabBtn) tabBtn.classList.add('active');

  const frame = document.getElementById('dieline-frame');
  const downloadLink = document.getElementById('dieline-download-btn');
  const titleSpan = document.getElementById('dieline-title-text');
  const dimSpan = document.getElementById('dieline-dim-text');

  let filePath = '';
  let title = '';
  let dim = '';

  switch (dielineName) {
    case 'sleeve':
      filePath = 'Dieline_Princess_Isabelle_Slide_Sleeve.svg';
      title = '1. Outer Rigid Sleeve Dieline (ปลอกสวมกล่องสไลด์)';
      dim = '132 × 174 × 43 mm (Wrap over 2.0 mm Greyboard)';
      break;
    case 'drawer':
      filePath = 'Dieline_Princess_Isabelle_Slide_Drawer.svg';
      title = '2. Inner Rigid Drawer Tray Dieline (ถาดลิ้นชักจั่วปัง + ช่องริบบิ้น)';
      dim = '126 × 168 × 38 mm (Internal Cavity for 3 Sachets)';
      break;
    case 'outer_sachet':
      filePath = 'Dieline_Princess_Isabelle_Outer_Sachet_12x16.svg';
      title = '3. Outer Mask Sachet Dieline (ซองนอก 12 × 16 cm)';
      dim = '120 × 160 mm (Encloses Dry Mask + Serum Pouch)';
      break;
    case 'inner_serum':
      filePath = 'Dieline_Princess_Isabelle_Inner_Serum_Sachet_9x12.svg';
      title = '4. Inner Fresh Serum Pouch Dieline (ซองเซรั่มใน 9 × 12 cm)';
      dim = '90 × 120 mm (30 ml Active Liquid Capacity)';
      break;
  }

  if (frame) frame.src = filePath;
  if (downloadLink) downloadLink.href = filePath;
  if (titleSpan) titleSpan.textContent = title;
  if (dimSpan) dimSpan.textContent = dim;
};

// Smooth Camera Interpolation & Turntable
function animate() {
  requestAnimationFrame(animate);

  // Smooth camera position lerp
  camera.position.lerp(targetCamPos, 0.06);
  controls.target.lerp(targetLookAt, 0.06);

  // Turntable rotation
  if (isTurntableActive && outerSleeve && innerDrawer) {
    const rotSpeed = 0.008;
    outerSleeve.rotation.y += rotSpeed;
    innerDrawer.rotation.y += rotSpeed;
  } else if (outerSleeve && innerDrawer) {
    outerSleeve.rotation.y = 0;
    innerDrawer.rotation.y = 0;
  }

  // Isolated product rotation
  if (isolatedSachet.visible) isolatedSachet.rotation.y += 0.01;
  if (isolatedSerumPouch.visible) isolatedSerumPouch.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('webgl-viewport');
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

document.addEventListener('DOMContentLoaded', () => {
  init3DStudio();
});
