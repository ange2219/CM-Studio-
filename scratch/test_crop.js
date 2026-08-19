const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\ceac2ac2-0c8f-4e57-a6a4-e51d4cdb0ce7\\.user_uploaded';
const outputDir = 'd:\\CM-Studio-\\public\\images\\real-app';

async function analyze() {
  // Let's crop from Y = 57 (after the browser address bar) to height - 32 (before windows taskbar)
  // Let's test different crop bounds
  const rawWorkspace = path.join(uploadsDir, 'media_1787013711222.png');
  
  // Total height: 575. Top browser bar: ~58px. Bottom taskbar: ~30px.
  // Content height: 575 - 58 - 30 = 487px.
  const cropped = await sharp(rawWorkspace)
    .extract({ left: 0, top: 58, width: 1024, height: 487 })
    .toFile(path.join(outputDir, 'test_crop.png'));
  
  console.log('Test crop created successfully:', cropped);
}

analyze().catch(console.error);
