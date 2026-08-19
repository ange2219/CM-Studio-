const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');

const uploadedPath = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\c94d80f8-120b-4e75-b47f-12cdfa86122a\\.user_uploaded\\media_1786899672781.png';

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <body>
        <canvas id="c"></canvas>
        <script>
          const img = new Image();
          img.src = '/image.png';
          img.onload = () => {
            const c = document.getElementById('c');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const id = ctx.getImageData(0, 0, c.width, c.height);
            const d = id.data;
            
            // We want ONLY the blue icon in the upper half (ignore black text "CM Studio" at the bottom)
            let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
            const cutoffY = Math.round(c.height * 0.65); // Ignore lower 35% where "CM Studio" text is
            
            for (let y = 0; y < cutoffY; y++) {
              for (let x = 0; x < c.width; x++) {
                const idx = (y * c.width + x) * 4;
                const r = d[idx], g = d[idx+1], b = d[idx+2];
                // Blue color detection (pure blue icon)
                if (b > 140 && b > r + 30 && b > g + 10) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
            
            console.log('Detected icon bounds:', minX, minY, maxX, maxY);
            
            // Crop tightly around the blue icon
            const pad = 16;
            const cropX = Math.max(0, minX - pad);
            const cropY = Math.max(0, minY - pad);
            const cropW = Math.min(c.width - cropX, (maxX - minX) + pad * 2);
            const cropH = Math.min(c.height - cropY, (maxY - minY) + pad * 2);
            
            const outCanvas = document.createElement('canvas');
            outCanvas.width = cropW;
            outCanvas.height = cropH;
            const outCtx = outCanvas.getContext('2d');
            
            const outId = outCtx.createImageData(cropW, cropH);
            const outData = outId.data;
            
            for (let y = 0; y < cropH; y++) {
              for (let x = 0; x < cropW; x++) {
                const srcX = cropX + x;
                const srcY = cropY + y;
                const outIdx = (y * cropW + x) * 4;
                const srcIdx = (srcY * c.width + srcX) * 4;
                
                const r = d[srcIdx], g = d[srcIdx+1], b = d[srcIdx+2];
                
                // If it's a blue pixel
                if (b > 120 && b > r + 20) {
                  // Calculate opacity based on color intensity
                  const blueStrength = (b - Math.max(r, g)) / 255;
                  const alpha = Math.min(255, Math.round(Math.max(b, 255 * blueStrength)));
                  
                  // Use official electric blue #1677FF
                  outData[outIdx] = r;
                  outData[outIdx+1] = g;
                  outData[outIdx+2] = b;
                  outData[outIdx+3] = alpha;
                } else {
                  outData[outIdx+3] = 0; // Transparent
                }
              }
            }
            
            outCtx.putImageData(outId, 0, 0);
            
            const dataUrl = outCanvas.toDataURL('image/png');
            fetch('/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl, width: cropW, height: cropH })
            }).then(() => window.close());
          };
        </script>
      </body>
      </html>
    `);
  } else if (req.url === '/image.png') {
    const data = fs.readFileSync(uploadedPath);
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(data);
  } else if (req.url === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { dataUrl, width, height } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      
      fs.writeFileSync('public/logo-blue.png', base64Data, 'base64');
      fs.writeFileSync('public/logo.png', base64Data, 'base64');
      
      console.log(`Saved new clean blue edit logo (${width}x${height})!`);
      res.writeHead(200);
      res.end('OK');
      setTimeout(() => process.exit(0), 400);
    });
  }
});

server.listen(3853, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3853');
});
