const sharp = require('sharp');
const path = require('path');

const uploadsDir = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\ceac2ac2-0c8f-4e57-a6a4-e51d4cdb0ce7\\.user_uploaded';

async function findCoords() {
  const raw = path.join(uploadsDir, 'media_1787013784126.png');
  const { data, info } = await sharp(raw)
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('Image dimensions:', info.width, info.height);
}

findCoords().catch(console.error);
