const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\ceac2ac2-0c8f-4e57-a6a4-e51d4cdb0ce7\\.user_uploaded';
const outputDir = 'd:\\CM-Studio-\\public\\images\\real-app';

async function processImages() {
  // ── 1. WORKSPACE IMAGE (media_1787013711222.png) ──
  const rawWorkspace = path.join(uploadsDir, 'media_1787013711222.png');
  
  // Crop base
  const workspaceCroppedBuffer = await sharp(rawWorkspace)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toBuffer();

  // Overlay for Workspace:
  // - Top right profile: replace Ange Dahou with Sarah Martin / CM Freelance
  // - Brand badge: replace "OKLM" with "Studio Horizon"
  const workspaceSvgOverlay = Buffer.from(`
    <svg width="1024" height="487" xmlns="http://www.w3.org/2000/svg">
      <!-- Profile Area Top Right Cover & Replacement (X: 820 to 1010, Y: 5 to 45) -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0C1425" />
      
      <!-- Avatar Circle -->
      <circle cx="845" cy="26" r="14" fill="#1677FF" />
      <text x="845" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SM</text>
      
      <!-- Name & Role -->
      <text x="868" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="868" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Brand Selector Cover & Replacement (X: 870 to 960, Y: 75 to 110) -->
      <rect x="870" y="75" width="95" height="34" rx="8" fill="#111B30" stroke="#1E2E4E" stroke-width="1" />
      <circle cx="888" cy="92" r="5" fill="#38BDF8" />
      <text x="900" y="96" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#E2E8F0">Horizon</text>
      <!-- Down arrow -->
      <path d="M 945 90 L 948 93 L 951 90" stroke="#94A3B8" stroke-width="1.5" fill="none" stroke-linecap="round" />
    </svg>
  `);

  await sharp(workspaceCroppedBuffer)
    .composite([{ input: workspaceSvgOverlay, top: 0, left: 0 }])
    .toFile(path.join(outputDir, 'app_workspace.png'));

  console.log('Processed app_workspace.png successfully');

  // ── 2. CREATE POST IMAGE (media_1787013724205.png) ──
  const rawCreate = path.join(uploadsDir, 'media_1787013724205.png');
  const createCroppedBuffer = await sharp(rawCreate)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toBuffer();

  const createSvgOverlay = Buffer.from(`
    <svg width="1024" height="487" xmlns="http://www.w3.org/2000/svg">
      <!-- Profile Area Top Right -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0C1425" />
      <circle cx="845" cy="26" r="14" fill="#1677FF" />
      <text x="845" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="868" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="868" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Fill the Subject Textarea with a realistic prompt -->
      <rect x="220" y="215" width="480" height="130" rx="4" fill="#0B1324" />
      <text x="235" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#F1F5F9">Lancement de notre nouvelle offre sans engagement :</text>
      <text x="235" y="262" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="#94A3B8">Partager notre retour d'expérience sur la suppression des contrats</text>
      <text x="235" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="#94A3B8">de 12 mois et les résultats obtenus (+28% de conversions).</text>
      <text x="235" y="305" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="500" fill="#38BDF8">#Ton : Storytelling &amp; Résultats B2B • Réseau cible : LinkedIn &amp; Facebook</text>

      <!-- Select LinkedIn Checkbox on the right panel (X: 928, Y: 228) -->
      <rect x="926" y="224" width="16" height="16" rx="3" fill="#1677FF" stroke="#1677FF" />
      <path d="M 929 232 L 933 236 L 939 228" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `);

  await sharp(createCroppedBuffer)
    .composite([{ input: createSvgOverlay, top: 0, left: 0 }])
    .toFile(path.join(outputDir, 'app_generator.png'));

  console.log('Processed app_generator.png successfully');

  // ── 3. HOME / FEED IMAGE (media_1787013784126.png) ──
  const rawHome = path.join(uploadsDir, 'media_1787013784126.png');
  const homeCroppedBuffer = await sharp(rawHome)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toBuffer();

  const homeSvgOverlay = Buffer.from(`
    <svg width="1024" height="487" xmlns="http://www.w3.org/2000/svg">
      <!-- Profile Area Top Right -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0C1425" />
      <circle cx="845" cy="26" r="14" fill="#1677FF" />
      <text x="845" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="868" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="868" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Greeting "Quoi de neuf, Ange ?" -> "Quoi de neuf, Sarah ?" -->
      <rect x="210" y="112" width="220" height="30" fill="#0E172B" />
      <circle cx="225" cy="127" r="12" fill="#1677FF" />
      <text x="225" y="131" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="245" y="131" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#E2E8F0">Quoi de neuf, Sarah ?</text>

      <!-- Enhance the empty main feed area with a realistic community activity card -->
      <rect x="210" y="195" width="510" height="150" rx="12" fill="#0E172B" stroke="#1E293B" stroke-width="1" />
      
      <!-- User author inside post -->
      <circle cx="235" cy="222" r="12" fill="#8B5CF6" />
      <text x="235" y="226" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AD</text>
      <text x="255" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#F1F5F9">Alexandre D. • Agence Pulse</text>
      <text x="255" y="232" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="500" fill="#64748B">Il y a 2 heures • Partage de prompt</text>
      
      <text x="235" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">"Testé la nouvelle structure AIDA pour Facebook sur notre client Food :</text>
      <text x="235" y="278" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">+65% de clics sur le premier jour. Le hook sous 120 caractères fait toute la différence !"</text>
      
      <!-- Badges -->
      <rect x="235" y="295" width="80" height="20" rx="4" fill="#1E293B" />
      <text x="275" y="309" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#38BDF8" text-anchor="middle">🔥 +42 likes</text>

      <rect x="325" y="295" width="90" height="20" rx="4" fill="#1E293B" />
      <text x="370" y="309" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94A3B8" text-anchor="middle">💬 14 réponses</text>
    </svg>
  `);

  await sharp(homeCroppedBuffer)
    .composite([{ input: homeSvgOverlay, top: 0, left: 0 }])
    .toFile(path.join(outputDir, 'app_community.png'));

  console.log('Processed app_community.png successfully');
}

processImages().catch(console.error);
