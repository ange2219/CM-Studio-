const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');

const uploadedPath = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\c94d80f8-120b-4e75-b47f-12cdfa86122a\\.user_uploaded\\media_1786889213366.jpg';

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
          img.src = '/image.jpg';
          img.onload = () => {
            const c = document.getElementById('c');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const id = ctx.getImageData(0, 0, c.width, c.height);
            const d = id.data;
            
            // 1. Create clean binary mask of feather
            const binary = new Uint8Array(c.width * c.height);
            let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
            
            for (let y = 0; y < c.height; y++) {
              for (let x = 0; x < c.width; x++) {
                const idx = (y * c.width + x) * 4;
                const r = d[idx], g = d[idx+1], b = d[idx+2];
                // Pure feather blue detection
                if (b > 130 && b > r + 30 && b > g + 15) {
                  binary[y * c.width + x] = 1;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
            
            // 2. Morphological smoothing (clean up JPEG compression noise on edges)
            const smoothed = new Uint8Array(c.width * c.height);
            for (let y = 1; y < c.height - 1; y++) {
              for (let x = 1; x < c.width - 1; x++) {
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dx = -1; dx <= 1; dx++) {
                    sum += binary[(y + dy) * c.width + (x + dx)];
                  }
                }
                // Majority vote for smooth anti-jagged edge
                smoothed[y * c.width + x] = sum >= 5 ? 1 : 0;
              }
            }
            
            // 3. Render high-res crisp cropped canvas
            const pad = 24;
            const cropX = minX - pad;
            const cropY = minY - pad;
            const cropW = (maxX - minX) + pad * 2;
            const cropH = (maxY - minY) + pad * 2;
            
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
                
                if (srcX >= 0 && srcX < c.width && srcY >= 0 && srcY < c.height) {
                  // Super-sampled smooth edge
                  let count = 0;
                  for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                      const sx = srcX + dx;
                      const sy = srcY + dy;
                      if (sx >= 0 && sx < c.width && sy >= 0 && sy < c.height) {
                        count += smoothed[sy * c.width + sx];
                      }
                    }
                  }
                  
                  if (count > 0) {
                    outData[outIdx] = 22;     // R (#1677FF)
                    outData[outIdx+1] = 119;  // G
                    outData[outIdx+2] = 255;  // B
                    outData[outIdx+3] = Math.round((count / 9) * 255); // Smooth anti-aliased alpha!
                  }
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
  } else if (req.url === '/image.jpg') {
    const data = fs.readFileSync(uploadedPath);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(data);
  } else if (req.url === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { dataUrl, width, height } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      
      fs.writeFileSync('public/logo-blue.png', base64Data, 'base64');
      fs.writeFileSync('public/logo.png', base64Data, 'base64');
      
      console.log(`Saved ultra-smooth anti-aliased logo (${width}x${height})`);
      res.writeHead(200);
      res.end('OK');
      setTimeout(() => process.exit(0), 400);
    });
  }
});

server.listen(3849, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3849');
});
