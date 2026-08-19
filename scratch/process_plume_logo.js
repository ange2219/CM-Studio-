const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processPlumeLogo() {
  const plumePath = path.join(__dirname, '..', 'public', 'logo-blue.png');
  if (!fs.existsSync(plumePath)) {
    throw new Error('logo-blue.png not found');
  }

  // 1. Generate app/icon.png (64x64 transparent)
  await sharp(plumePath)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));
  console.log('Generated app/icon.png with Blue Feather');

  // 2. Generate public/favicon.ico
  await sharp(plumePath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('Generated public/favicon.ico with Blue Feather');

  // 3. Generate public/icons/icon-192.png and 512.png
  await sharp(plumePath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'icon-192.png'));
  await sharp(plumePath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'));
  console.log('Generated PWA Feather icons');
}

processPlumeLogo().catch(console.error);
