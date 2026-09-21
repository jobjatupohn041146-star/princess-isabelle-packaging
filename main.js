// Princess Isabelle - High-End 3D WebGL Studio & Packaging Engineering Engine
// Short-Side Slide System & 10 mm Hollow-Wall Frame Tray

let scene, camera, renderer, controls;
let outerSleeve, innerDrawer, ribbonMesh;
let sachetStack = [];
let isolatedSachet, isolatedSerumPouch;
let activeMode = 'hero';
let isTurntableActive = false;
let slidePercent = 65;

// Camera Target positions
let targetCamPos = new THREE.Vector3(180, 240, 240);
let targetLookAt = new THREE.Vector3(0, 0, 20);

function init3DStudio() {
  const container = document.getElementById('webgl-viewport');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF9F6FC);

  camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1400);
  camera.position.copy(targetCamPos);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 + 0.05;
  controls.minDistance = 60;
  controls.maxDistance = 650;
  controls.target.copy(targetLookAt);

  setupLighting();

  const groundGeo = new THREE.PlaneGeometry(800, 800);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -22;
  ground.receiveShadow = true;
  scene.add(ground);

  buildPackagingModels();
  buildIsolatedProducts();
  setupEventListeners();

  setViewMode('hero');
  updateDrawerSlide(65);

  animate();
  window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xFFFFFF, 1.35);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xFFF9EE, 1.7);
  mainLight.position.set(160, 260, 160);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xE9DCF2, 1.15);
  fillLight.position.set(-160, 140, -120);
  scene.add(fillLight);

  const goldRim = new THREE.DirectionalLight(0xFFE082, 1.4);
  goldRim.position.set(0, 180, -220);
  scene.add(goldRim);
}

// Procedural Art Canvas for Top Box Wrap (100% Exact Match)
function createTopFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1290;
  const ctx = canvas.getContext('2d');

  // Pearlescent Lavender Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1290);
  grad.addColorStop(0, '#FAF2FE');
  grad.addColorStop(0.5, '#F3E5F8');
  grad.addColorStop(1, '#E7D5F0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1290);

  // Gold Outer Border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 7;
  ctx.strokeRect(48, 48, 928, 1194);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(62, 62, 900, 1166);

  // Royal Monogram Crest
  ctx.save();
  ctx.translate(512, 260);
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
  ctx.fillText('Princess Isabelle', 512, 410);

  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('BEAUTY WOVEN IN SILK', 512, 460);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 500);
  ctx.lineTo(694, 500);
  ctx.stroke();

  // Product Name
  ctx.fillStyle = '#3B1E48';
  ctx.font = 'bold 46px "Playfair Display", Georgia, serif';
  ctx.fillText('GOLDEN SILK FACIAL MASK', 512, 580);

  ctx.fillStyle = '#7D3C98';
  ctx.font = '600 28px "Segoe UI", Arial, sans-serif';
  ctx.fillText('3 SHEET MASKS', 512, 630);

  // Silk Petal Feature Note
  ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
  ctx.beginPath();
  ctx.ellipse(512, 810, 240, 95, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#555555';
  ctx.font = '23px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Fresh-Mix Ritual • Concentrated Bio-Active Silk', 512, 800);
  ctx.fillText('3 Sets • 30 ml Activated Serum per Treatment', 512, 840);

  // Bottom Luxury Indicator
  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ROYAL LUXURY SKINCARE • SHORT-SIDE SLIDE EDITION', 512, 1140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

// Procedural Sachet Texture (12x16 cm)
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

  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(300, 160, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4A235A';
  ctx.font = 'bold 38px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText('PI', 300, 174);

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

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

// Build Packaging Models: Short-Side Slide & 10 mm Hollow-Wall Frame
function buildPackagingModels() {
  // Dimensions:
  // Outer Sleeve: 153 mm (W) × 193 mm (L) × 37 mm (H)
  // X = Width (153 mm), Z = Length (193 mm), Y = Height (37 mm)
  // Short side is along X (153 mm), Slide direction is along Z (193 mm)!
  const sleeveW = 153;
  const sleeveL = 193;
  const sleeveH = 37;

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

  // Sleeve Top Face
  const topGeo = new THREE.BoxGeometry(sleeveW, 2, sleeveL);
  const topFaceMesh = new THREE.Mesh(topGeo, [
    luxuryMat, luxuryMat, topFaceMat, luxuryMat, luxuryMat, luxuryMat
  ]);
  topFaceMesh.position.y = sleeveH / 2;
  topFaceMesh.castShadow = true;
  outerSleeve.add(topFaceMesh);

  // Sleeve Bottom Face
  const bottomGeo = new THREE.BoxGeometry(sleeveW, 2, sleeveL);
  const bottomFaceMesh = new THREE.Mesh(bottomGeo, luxuryMat);
  bottomFaceMesh.position.y = -sleeveH / 2;
  bottomFaceMesh.receiveShadow = true;
  outerSleeve.add(bottomFaceMesh);

  // Sleeve Left Wall (X = -sleeveW/2)
  const leftWallGeo = new THREE.BoxGeometry(2, sleeveH, sleeveL);
  const leftWallMesh = new THREE.Mesh(leftWallGeo, luxuryMat);
  leftWallMesh.position.x = -sleeveW / 2;
  leftWallMesh.castShadow = true;
  outerSleeve.add(leftWallMesh);

  // Sleeve Right Wall (X = sleeveW/2)
  const rightWallGeo = new THREE.BoxGeometry(2, sleeveH, sleeveL);
  const rightWallMesh = new THREE.Mesh(rightWallGeo, luxuryMat);
  rightWallMesh.position.x = sleeveW / 2;
  rightWallMesh.castShadow = true;
  outerSleeve.add(rightWallMesh);

  // Sleeve Back Stop (Z = -sleeveL/2) - Closed bottom/rear of sleeve tube
  const backGeo = new THREE.BoxGeometry(sleeveW, sleeveH, 2);
  const backMesh = new THREE.Mesh(backGeo, luxuryMat);
  backMesh.position.z = -sleeveL / 2;
  outerSleeve.add(backMesh);

  // The Short Side opening is at Z = +sleeveL/2 (Front/Top opening)!
  scene.add(outerSleeve);

  // Inner Drawer Tray (150 W × 190 L × 34 H) with 10 mm Hollow-Wall Frame
  innerDrawer = new THREE.Group();
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0xF3E9F8,
    roughness: 0.4,
    metalness: 0.05
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xE8D7EF,
    roughness: 0.35,
    metalness: 0.15
  });

  // Tray Base Panel: 150 × 190 mm
  const dBaseGeo = new THREE.BoxGeometry(150, 2, 190);
  const dBaseMesh = new THREE.Mesh(dBaseGeo, trayMat);
  dBaseMesh.position.y = -sleeveH / 2 + 2.5;
  dBaseMesh.receiveShadow = true;
  innerDrawer.add(dBaseMesh);

  // 10 mm Hollow-Wall Raised Borders around 4 sides:
  // Cavity size is 130 mm (W) × 170 mm (L), Net depth 33 mm
  const borderH = 33;
  const borderThick = 10;

  // Top Short Border (Z = +190/2 - 5 = +90)
  const topBorderGeo = new THREE.BoxGeometry(150, borderH, borderThick);
  const topBorderMesh = new THREE.Mesh(topBorderGeo, rimMat);
  topBorderMesh.position.set(0, -sleeveH/2 + borderH/2 + 2.5, 190/2 - borderThick/2);
  topBorderMesh.castShadow = true;
  innerDrawer.add(topBorderMesh);

  // Bottom Short Border (Z = -190/2 + 5 = -90)
  const botBorderGeo = new THREE.BoxGeometry(150, borderH, borderThick);
  const botBorderMesh = new THREE.Mesh(botBorderGeo, rimMat);
  botBorderMesh.position.set(0, -sleeveH/2 + borderH/2 + 2.5, -190/2 + borderThick/2);
  botBorderMesh.castShadow = true;
  innerDrawer.add(botBorderMesh);

  // Left Long Border (X = -150/2 + 5 = -70, L = 170)
  const leftBorderGeo = new THREE.BoxGeometry(borderThick, borderH, 170);
  const leftBorderMesh = new THREE.Mesh(leftBorderGeo, rimMat);
  leftBorderMesh.position.set(-150/2 + borderThick/2, -sleeveH/2 + borderH/2 + 2.5, 0);
  leftBorderMesh.castShadow = true;
  innerDrawer.add(leftBorderMesh);

  // Right Long Border (X = +150/2 - 5 = +70, L = 170)
  const rightBorderGeo = new THREE.BoxGeometry(borderThick, borderH, 170);
  const rightBorderMesh = new THREE.Mesh(rightBorderGeo, rimMat);
  rightBorderMesh.position.set(150/2 - borderThick/2, -sleeveH/2 + borderH/2 + 2.5, 0);
  rightBorderMesh.castShadow = true;
  innerDrawer.add(rightBorderMesh);

  // Gold Satin Ribbon Pull Tab (15 mm wide) on Short Edge (Z = +95 mm)
  const ribbonCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-7, -sleeveH/2 + 18, 190/2),
    new THREE.Vector3(-7, -sleeveH/2 + 18, 190/2 + 35),
    new THREE.Vector3(7, -sleeveH/2 + 18, 190/2 + 35),
    new THREE.Vector3(7, -sleeveH/2 + 18, 190/2)
  );
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 30, 2.5, 12, false);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness: 0.3,
    metalness: 0.8
  });
  ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonMesh.castShadow = true;
  innerDrawer.add(ribbonMesh);

  // 3 Stacked Mask Sachets inside the 130 × 170 mm Cavity
  const sachetTex = createSachetTexture();
  const sachetMat = new THREE.MeshStandardMaterial({ map: sachetTex, roughness: 0.35, metalness: 0.25 });
  const sachetSideMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.3, metalness: 0.8 });
  const sachetGeo = new THREE.BoxGeometry(120, 10, 160);

  for (let i = 0; i < 3; i++) {
    const sachet = new THREE.Mesh(sachetGeo, [
      sachetSideMat, sachetSideMat, sachetMat, sachetSideMat, sachetSideMat, sachetSideMat
    ]);
    sachet.position.set(0, -sleeveH/2 + 7.5 + (i * 10.2), 0);
    sachet.castShadow = true;
    sachet.receiveShadow = true;
    innerDrawer.add(sachet);
    sachetStack.push(sachet);
  }

  scene.add(innerDrawer);
}

function buildIsolatedProducts() {
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

// Update Drawer Slide: Slides along Z-AXIS (Short Side / Top-Pull Slide)
function updateDrawerSlide(percent) {
  slidePercent = percent;
  // At 0%, innerDrawer is fully inside (z = 0)
  // At 100%, innerDrawer is pulled out along +Z axis by 145 mm
  const maxSlideZ = 145;
  const slideZ = (percent / 100) * maxSlideZ;
  if (innerDrawer && activeMode !== 'exploded') {
    innerDrawer.position.z = slideZ;
    innerDrawer.position.x = 0;
  }
}

// Set View Modes
window.setViewMode = function(mode) {
  activeMode = mode;
  isTurntableActive = (mode === 'turntable');

  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  const targetBtn = document.getElementById(`view-btn-${mode}`);
  if (targetBtn) targetBtn.classList.add('active');

  const slider = document.getElementById('slide-range');
  const slideVal = document.getElementById('slide-value');

  outerSleeve.visible = true;
  innerDrawer.visible = true;
  isolatedSachet.visible = false;
  isolatedSerumPouch.visible = false;

  switch (mode) {
    case 'hero':
      updateDrawerSlide(65);
      if (slider) slider.value = 65;
      if (slideVal) slideVal.textContent = '65%';
      targetCamPos.set(180, 240, 240);
      targetLookAt.set(0, 0, 30);
      resetExplodedTransforms();
      break;

    case 'inside':
      updateDrawerSlide(100);
      if (slider) slider.value = 100;
      if (slideVal) slideVal.textContent = '100%';
      targetCamPos.set(0, 310, 150);
      targetLookAt.set(0, 0, 80);
      resetExplodedTransforms();
      break;

    case 'exploded':
      // Exploded along Z axis and Y elevation
      outerSleeve.position.set(0, 0, -80);
      innerDrawer.position.set(0, 0, 90);
      if (sachetStack.length === 3) {
        sachetStack[0].position.set(0, 0, 0);
        sachetStack[1].position.set(0, 30, 0);
        sachetStack[2].position.set(0, 60, 0);
      }
      targetCamPos.set(220, 280, 280);
      targetLookAt.set(0, 30, 20);
      break;

    case 'turntable':
      updateDrawerSlide(75);
      if (slider) slider.value = 75;
      if (slideVal) slideVal.textContent = '75%';
      targetCamPos.set(190, 220, 260);
      targetLookAt.set(0, 0, 30);
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
    const sleeveH = 37;
    for (let i = 0; i < 3; i++) {
      sachetStack[i].position.set(0, -sleeveH/2 + 7.5 + (i * 10.2), 0);
    }
  }
  updateDrawerSlide(slidePercent);
}

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
      targetCamPos.set(0, 240, 220);
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
      title = '1. ปลอกสวมสไลด์ด้านสั้น (Short-Side Sleeve Dieline)';
      dim = '153 × 193 × 37 mm (สไลด์ออกด้านสั้น 153 mm)';
      break;
    case 'drawer':
      filePath = 'Dieline_Princess_Isabelle_Slide_Drawer.svg';
      title = '2. ถาดในมีขอบพับเบิ้ล 10 mm (Hollow-Wall Frame Tray)';
      dim = 'หลุมใน 130 × 170 mm • ลึกสุทธิ 33 mm (&gt; 3 cm)';
      break;
    case 'outer_sachet':
      filePath = 'Dieline_Princess_Isabelle_Outer_Sachet_12x16.svg';
      title = '3. ซองมาส์กหน้าพร้อมเซรั่มในตัว 12 × 16 cm (Facial Mask Sachet Dieline)';
      dim = '120 × 160 mm (แผ่นมาส์กชุ่มเซรั่มเข้มข้น 25g - 30ml บรรจุในซองเดียวกัน)';
      break;
    case 'inner_serum':
      filePath = 'Dieline_Princess_Isabelle_Inner_Serum_Sachet_9x12.svg';
      title = '4. [ทางเลือกเสริม] ซองเซรั่มแยก 9 × 12 cm (Optional Separate Serum Pouch)';
      dim = '90 × 120 mm (ความจุ 30 ml • สำหรับกรณีผลิตแบบ Fresh-Mix แยกซอง)';
      break;
  }

  if (frame) frame.src = filePath;
  if (downloadLink) downloadLink.href = filePath;
  if (titleSpan) titleSpan.textContent = title;
  if (dimSpan) dimSpan.textContent = dim;
};

function animate() {
  requestAnimationFrame(animate);

  camera.position.lerp(targetCamPos, 0.06);
  controls.target.lerp(targetLookAt, 0.06);

  if (isTurntableActive && outerSleeve && innerDrawer) {
    const rotSpeed = 0.008;
    outerSleeve.rotation.y += rotSpeed;
    innerDrawer.rotation.y += rotSpeed;
  } else if (outerSleeve && innerDrawer) {
    outerSleeve.rotation.y = 0;
    innerDrawer.rotation.y = 0;
  }

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
