const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processUserLogo() {
  const logoJpgPath = path.join(__dirname, '..', 'public', 'logo.jpg');
  if (!fs.existsSync(logoJpgPath)) {
    throw new Error('logo.jpg not found');
  }

  // 1. Generate app/icon.png (32x32 and 64x64)
  await sharp(logoJpgPath)
    .resize(64, 64)
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));
  console.log('Processed app/icon.png from user logo.jpg');

  // 2. Generate public/favicon.ico
  await sharp(logoJpgPath)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('Processed public/favicon.ico');

  // 3. Generate public/logo.png
  await sharp(logoJpgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'logo.png'));
  console.log('Processed public/logo.png');

  // 4. Generate public/icons/icon-192.png and 512.png
  await sharp(logoJpgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'icon-192.png'));
  await sharp(logoJpgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'));
  console.log('Processed PWA icons');
}

processUserLogo().catch(console.error);
