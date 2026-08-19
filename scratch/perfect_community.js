const sharp = require('sharp');
const path = require('path');

const uploadsDir = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\ceac2ac2-0c8f-4e57-a6a4-e51d4cdb0ce7\\.user_uploaded';
const outputDir = 'd:\\CM-Studio-\\public\\images\\real-app';

async function perfectCommunity() {
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

      <!-- Exact Greeting Box (X: 198, Y: 70, W: 532, H: 54) -->
      <rect x="198" y="70" width="532" height="54" rx="12" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <circle cx="224" cy="97" r="13" fill="#1677FF" />
      <text x="224" y="101" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="246" y="101" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">Partager une astuce ou poser une question aux CMs...</text>
      <rect x="648" y="83" width="70" height="28" rx="14" fill="#1677FF" />
      <text x="683" y="100" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">Publier</text>

      <!-- Exact Feed Card (X: 198, Y: 170, W: 532, H: 180) -->
      <rect x="198" y="170" width="532" height="180" rx="12" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <circle cx="225" cy="198" r="13" fill="#8B5CF6" />
      <text x="225" y="202" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AD</text>
      <text x="246" y="194" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F1F5F9">Alexandre D. • Pulse Social Agency</text>
      <text x="246" y="207" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#64748B">Il y a 2 heures • Template &amp; Hook viral</text>
      
      <text x="216" y="232" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">"La structure AIDA pour Facebook sur notre client Food donne +65% de clics</text>
      <text x="216" y="248" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#CBD5E1">sur les 24 premières heures. Le secret : couper l'accroche avant 120 caractères !"</text>
      
      <rect x="216" y="270" width="75" height="20" rx="5" fill="#16233B" />
      <text x="253" y="284" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#38BDF8" text-anchor="middle">🔥 42 likes</text>

      <rect x="298" y="270" width="85" height="20" rx="5" fill="#16233B" />
      <text x="340" y="284" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#94A3B8" text-anchor="middle">💬 14 réponses</text>

      <!-- Exact Suggestions Box (X: 742, Y: 70, W: 240, H: 90) -->
      <rect x="742" y="70" width="240" height="90" rx="12" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <text x="758" y="92" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F1F5F9">Suggestions du jour</text>
      <text x="758" y="114" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#38BDF8">⚡ 3 nouveaux hooks B2B</text>
      <text x="758" y="132" font-family="'Inter', sans-serif" font-size="10" font-weight="400" fill="#94A3B8">📊 Mise à jour algo LinkedIn Q1</text>

      <!-- Exact Online Members Box (X: 742, Y: 180, W: 240, H: 85) -->
      <rect x="742" y="180" width="240" height="85" rx="12" fill="#0C1424" stroke="#1E2A44" stroke-width="1" />
      <text x="758" y="205" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F1F5F9">En ligne maintenant</text>
      <circle cx="764" cy="230" r="4" fill="#10B981" />
      <text x="774" y="234" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#10B981">28 membres actifs</text>
    </svg>
  `);

  await sharp(homeCropped)
    .composite([{ input: homeSvg, top: 0, left: 0 }])
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'app_community.png'));

  console.log('Regenerated app_community.png with exact coordinates Y=70');
}

perfectCommunity().catch(console.error);
