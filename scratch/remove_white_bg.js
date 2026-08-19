const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function removeWhiteBackground() {
  const inputPath = path.join(__dirname, '..', 'public', 'logo.png');
  
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  const outputData = Buffer.from(data);

  // We want to turn all white/light pixels into transparent pixels
  for (let i = 0; i < outputData.length; i += channels) {
    const r = outputData[i];
    const g = outputData[i + 1];
    const b = outputData[i + 2];

    // Compute distance to pure blue (approx r: 0-20, g: 100-140, b: 255)
    // The background is pure white (r: 255, g: 255, b: 255)
    const minVal = Math.min(r, g, b);
    const avg = (r + g + b) / 3;

    if (r > 240 && g > 240 && b > 240) {
      // Pure white -> 100% transparent
      outputData[i + 3] = 0;
    } else if (r > 200 && g > 200 && b > 200) {
      // Soft transition edge: make alpha proportional to distance from white
      const whiteness = Math.min(r, g, b);
      const alpha = Math.max(0, Math.min(255, (255 - whiteness) * 4));
      outputData[i + 3] = alpha;
    }
  }

  // Save transparent PNG to temporary buffer
  const transparentPng = await sharp(outputData, {
    raw: {
      width,
      height,
      channels: 4,
    }
  })
  .png()
  .toBuffer();

  // Write to public/logo.png
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo.png'), transparentPng);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-blue.png'), transparentPng);
  console.log('Successfully saved transparent logo.png and logo-blue.png');

  // Generate app/icon.png and favicon.ico
  await sharp(transparentPng)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));

  await sharp(transparentPng)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));

  console.log('Done creating all transparent icons!');
}

removeWhiteBackground().catch(console.error);
