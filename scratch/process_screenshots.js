const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\ceac2ac2-0c8f-4e57-a6a4-e51d4cdb0ce7\\.user_uploaded';
const outputDir = 'd:\\CM-Studio-\\public\\images\\real-app';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function inspect() {
  const files = [
    'media_1787013711222.png', // workspace
    'media_1787013724205.png', // create post
    'media_1787013784126.png', // home
  ];

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const meta = await sharp(filePath).metadata();
    console.log(`${file}: ${meta.width}x${meta.height}`);
  }
}

inspect().catch(console.error);
