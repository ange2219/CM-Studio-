const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\ceac2ac2-0c8f-4e57-a6a4-e51d4cdb0ce7\\.user_uploaded';
const outputDir = 'd:\\CM-Studio-\\public\\images\\real-app';

async function generatePerfectScreenshots() {
  // ── 1. WORKSPACE IMAGE ──
  const rawWorkspace = path.join(uploadsDir, 'media_1787013711222.png');
  const workspaceCropped = await sharp(rawWorkspace)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toBuffer();

  const workspaceSvg = Buffer.from(`
    <svg width="1024" height="487" xmlns="http://www.w3.org/2000/svg">
      <!-- Profile Area Top Right (X: 825, Y: 8) -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0B1322" />
      <circle cx="845" cy="26" r="13" fill="#1677FF" />
      <text x="845" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="866" y="21" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="866" y="33" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Brand Selector (Replace OKLM with Horizon Studio) -->
      <rect x="870" y="75" width="95" height="34" rx="8" fill="#111B30" stroke="#1E2E4E" stroke-width="1" />
      <circle cx="888" cy="92" r="4.5" fill="#38BDF8" />
      <text x="898" y="96" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#E2E8F0">Horizon</text>
      <path d="M 945 90 L 948 93 L 951 90" stroke="#94A3B8" stroke-width="1.5" fill="none" stroke-linecap="round" />
    </svg>
  `);

  await sharp(workspaceCropped)
    .composite([{ input: workspaceSvg, top: 0, left: 0 }])
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'app_workspace.png'));

  // ── 2. GENERATOR / CREATE POST IMAGE ──
  const rawCreate = path.join(uploadsDir, 'media_1787013724205.png');
  const createCropped = await sharp(rawCreate)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toBuffer();

  const createSvg = Buffer.from(`
    <svg width="1024" height="487" xmlns="http://www.w3.org/2000/svg">
      <!-- Profile Area Top Right -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0B1322" />
      <circle cx="845" cy="26" r="13" fill="#1677FF" />
      <text x="845" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="866" y="21" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="866" y="33" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Fill the Subject Textarea -->
      <rect x="220" y="215" width="480" height="130" rx="4" fill="#0B1324" />
      <text x="235" y="242" font-family="'Inter', -apple-system, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC">Lancement de notre nouvelle offre sans engagement :</text>
      <text x="235" y="264" font-family="'Inter', -apple-system, sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">Partager notre retour d'expérience sur la suppression des contrats</text>
      <text x="235" y="282" font-family="'Inter', -apple-system, sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">de 12 mois et les résultats obtenus (+28% de conversions).</text>
      <text x="235" y="308" font-family="'Inter', -apple-system, sans-serif" font-size="10" font-weight="600" fill="#38BDF8">✨ Objectif : Storytelling &amp; Preuve B2B • Format : LinkedIn</text>

      <!-- LinkedIn checkbox exact position (X: 926 to 940, Y: 213 to 227) -->
      <rect x="926" y="213" width="15" height="15" rx="3" fill="#1677FF" stroke="#1677FF" stroke-width="1" />
      <path d="M 929 220.5 L 932.5 224 L 937.5 217" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `);

  await sharp(createCropped)
    .composite([{ input: createSvg, top: 0, left: 0 }])
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'app_generator.png'));

  // ── 3. HOME / COMMUNITY IMAGE ──
  const rawHome = path.join(uploadsDir, 'media_1787013784126.png');
  const homeCropped = await sharp(rawHome)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toBuffer();

  const homeSvg = Buffer.from(`
    <svg width="1024" height="487" xmlns="http://www.w3.org/2000/svg">
      <!-- Profile Area Top Right -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0B1322" />
      <circle cx="845" cy="26" r="13" fill="#1677FF" />
      <text x="845" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="866" y="21" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="866" y="33" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Clean Header Greeting Box (X: 205, Y: 70) -->
      <rect x="205" y="70" width="530" height="50" rx="10" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <circle cx="230" cy="95" r="14" fill="#1677FF" />
      <text x="230" y="99" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="254" y="99" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">Partager une astuce ou poser une question aux CMs...</text>
      <rect x="655" y="82" width="70" height="26" rx="13" fill="#1677FF" />
      <text x="690" y="98" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">Publier</text>

      <!-- Feed Card 1 -->
      <rect x="205" y="150" width="530" height="145" rx="12" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <circle cx="230" cy="175" r="12" fill="#8B5CF6" />
      <text x="230" y="179" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AD</text>
      <text x="250" y="174" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F1F5F9">Alexandre D. • Pulse Social</text>
      <text x="250" y="186" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#64748B">Il y a 2 heures • Template &amp; Hook</text>
      
      <text x="220" y="210" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">"La structure AIDA pour Facebook sur notre client Food donne +65% de clics</text>
      <text x="220" y="226" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">sur les 24 premières heures. Le secret : couper l'accroche avant 120 caractères !"</text>
      
      <rect x="220" y="240" width="75" height="18" rx="4" fill="#152238" />
      <text x="257" y="252" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#38BDF8" text-anchor="middle">🔥 42 likes</text>

      <rect x="305" y="240" width="85" height="18" rx="4" fill="#152238" />
      <text x="347" y="252" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#94A3B8" text-anchor="middle">💬 14 réponses</text>

      <!-- Suggestions Box on Right Panel -->
      <rect x="750" y="68" width="230" height="85" rx="10" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <text x="765" y="90" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F1F5F9">Suggestions du jour</text>
      <text x="765" y="110" font-family="'Inter', sans-serif" font-size="10" font-weight="400" fill="#94A3B8">⚡ 3 nouveaux hooks B2B ajoutés</text>
      <text x="765" y="128" font-family="'Inter', sans-serif" font-size="10" font-weight="400" fill="#94A3B8">📊 Mise à jour algo LinkedIn Q1</text>

      <!-- Online members on Right Panel -->
      <rect x="750" y="165" width="230" height="50" rx="10" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <circle cx="770" cy="190" r="4.5" fill="#10B981" />
      <text x="785" y="194" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#F1F5F9">28 membres en ligne</text>
    </svg>
  `);

  await sharp(homeCropped)
    .composite([{ input: homeSvg, top: 0, left: 0 }])
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'app_community.png'));

  console.log('Successfully generated all 3 high-res clean screenshots');
}

generatePerfectScreenshots().catch(console.error);
