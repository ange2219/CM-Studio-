const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function syncAllIcons() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  if (!fs.existsSync(logoPath)) {
    throw new Error('public/logo.png not found');
  }

  // 1. Generate app/icon.png (Next.js default favicon)
  await sharp(logoPath)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));
  console.log('Generated app/icon.png');

  // 2. Generate public/favicon.ico
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('Generated public/favicon.ico');

  // 3. Generate public/logo-blue.png as alias
  await sharp(logoPath)
    .toFile(path.join(__dirname, '..', 'public', 'logo-blue.png'));
  console.log('Synced public/logo-blue.png');

  // 4. Generate PWA icons
  await sharp(logoPath)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'apple-touch-icon.png'));
  await sharp(logoPath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'icon-192.png'));
  await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'));
  console.log('Generated PWA icons');
}

syncAllIcons().catch(console.error);
