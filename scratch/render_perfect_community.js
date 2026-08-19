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
      <!-- Profile Area Top Right (X: 825, Y: 8) -->
      <rect x="825" y="8" width="190" height="36" rx="18" fill="#0B1322" />
      <circle cx="845" cy="26" r="13" fill="#1677FF" />
      <text x="845" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="866" y="21" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F8FAFC">Sarah Martin</text>
      <text x="866" y="33" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8">sarah@studio-social.fr</text>

      <!-- Full Clean Main Area Cover (X: 190, Y: 60, W: 825, H: 420) -->
      <rect x="190" y="60" width="825" height="420" fill="#090E1A" />

      <!-- Greeting / Create post Input Card (X: 200, Y: 72, W: 540, H: 54) -->
      <rect x="200" y="72" width="540" height="54" rx="12" fill="#0F172A" stroke="#1E293B" stroke-width="1" />
      <circle cx="228" cy="99" r="14" fill="#1677FF" />
      <text x="228" y="103" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">SM</text>
      <text x="252" y="103" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">Partager une astuce, un prompt ou poser une question aux CMs...</text>
      <rect x="660" y="85" width="68" height="28" rx="14" fill="#1677FF" />
      <text x="694" y="102" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">Publier</text>

      <!-- Tabs: Général (Active) | Suivi -->
      <text x="204" y="152" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#38BDF8">Général</text>
      <line x1="204" y1="158" x2="252" y2="158" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />
      <text x="272" y="152" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#64748B">Suivi</text>

      <!-- Community Feed Card 1 (X: 200, Y: 172, W: 540, H: 170) -->
      <rect x="200" y="172" width="540" height="165" rx="12" fill="#0F172A" stroke="#1E293B" stroke-width="1" />
      <circle cx="228" cy="202" r="14" fill="#8B5CF6" />
      <text x="228" y="206" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AD</text>
      <text x="252" y="198" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#F1F5F9">Alexandre D. • Pulse Social Agency</text>
      <text x="252" y="212" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#64748B">Il y a 2 heures • Template de hook Facebook</text>
      
      <text x="218" y="240" font-family="'Inter', sans-serif" font-size="12" font-weight="400" fill="#CBD5E1">"La structure AIDA pour Facebook sur notre client Food donne +65% de clics</text>
      <text x="218" y="258" font-family="'Inter', sans-serif" font-size="12" font-weight="400" fill="#CBD5E1">sur les 24 premières heures. Le secret : couper l'accroche avant 120 caractères !"</text>
      
      <rect x="218" y="280" width="80" height="24" rx="6" fill="#1E293B" />
      <text x="258" y="296" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#38BDF8" text-anchor="middle">🔥 42 likes</text>

      <rect x="308" y="280" width="95" height="24" rx="6" fill="#1E293B" />
      <text x="355" y="296" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#94A3B8" text-anchor="middle">💬 14 réponses</text>

      <!-- Community Feed Card 2 Preview (Bottom) -->
      <rect x="200" y="350" width="540" height="110" rx="12" fill="#0F172A" stroke="#1E293B" stroke-width="1" />
      <circle cx="228" cy="380" r="14" fill="#10B981" />
      <text x="228" y="384" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CL</text>
      <text x="252" y="376" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#F1F5F9">Camille L. • Resp. Communication</text>
      <text x="252" y="390" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#64748B">Il y a 4 heures • Ligne éditoriale LinkedIn</text>
      <text x="218" y="416" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#94A3B8">"Comment nous avons doublé la portée de notre page entreprise sans ads..."</text>

      <!-- Right Column: Suggestions Box (X: 755, Y: 72, W: 240, H: 120) -->
      <rect x="755" y="72" width="240" height="115" rx="12" fill="#0F172A" stroke="#1E293B" stroke-width="1" />
      <text x="770" y="96" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#F1F5F9">Suggestions du jour</text>
      <text x="770" y="122" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="#38BDF8">⚡ 3 nouveaux hooks B2B</text>
      <text x="770" y="142" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#94A3B8">📊 Mise à jour algo LinkedIn Q1</text>
      <text x="770" y="162" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="#94A3B8">🎨 5 palettes tendances 2026</text>

      <!-- Right Column: Online Members Box (X: 755, Y: 200, W: 240, H: 85) -->
      <rect x="755" y="200" width="240" height="85" rx="12" fill="#0F172A" stroke="#1E293B" stroke-width="1" />
      <text x="770" y="224" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#F1F5F9">En ligne maintenant</text>
      <circle cx="776" cy="252" r="4.5" fill="#10B981" />
      <text x="788" y="256" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#10B981">28 community managers</text>
      <text x="770" y="272" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#64748B">Actifs sur le hub en ce moment</text>
    </svg>
  `);

  await sharp(homeCropped)
    .composite([{ input: homeSvg, top: 0, left: 0 }])
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'app_community.png'));

  console.log('Regenerated app_community.png with ultra-clean full container rendering');
}

perfectCommunity().catch(console.error);
