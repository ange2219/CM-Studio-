const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate app/icon.png (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));
  console.log('Generated app/icon.png');

  // Generate public/logo.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'logo.png'));
  console.log('Generated public/logo.png');

  // Generate public/logo-blue.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'logo-blue.png'));
  console.log('Generated public/logo-blue.png');

  // Generate public/favicon.ico (32x32 png format works in modern browsers)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('Generated public/favicon.ico');
}

generate().catch(console.error);
