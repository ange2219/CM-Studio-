const http = require('http');
const fs = require('fs');
const path = require('path');
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
        <canvas id="c2"></canvas>
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
            
            let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
            
            for (let y = 0; y < c.height; y++) {
              for (let x = 0; x < c.width; x++) {
                const idx = (y * c.width + x) * 4;
                const r = d[idx], g = d[idx+1], b = d[idx+2];
                
                // Blue feather detection
                const isFeather = (b > 110 && b > r + 20 && b > g + 10);
                
                if (isFeather) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                } else {
                  d[idx+3] = 0;
                }
              }
            }
            
            ctx.putImageData(id, 0, 0);
            
            console.log('Bounding Box:', minX, minY, maxX, maxY);
            
            // Add a small 4% padding around the feather
            const featherW = maxX - minX;
            const featherH = maxY - minY;
            const pad = Math.floor(Math.max(featherW, featherH) * 0.05);
            
            const cropX = Math.max(0, minX - pad);
            const cropY = Math.max(0, minY - pad);
            const cropW = Math.min(c.width - cropX, featherW + pad * 2);
            const cropH = Math.min(c.height - cropY, featherH + pad * 2);
            
            const c2 = document.getElementById('c2');
            c2.width = cropW;
            c2.height = cropH;
            const ctx2 = c2.getContext('2d');
            ctx2.drawImage(c, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            
            const dataUrl = c2.toDataURL('image/png');
            fetch('/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl, width: cropW, height: cropH, bbox: { minX, minY, maxX, maxY } })
            }).then(() => {
              window.close();
            });
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
      const { dataUrl, width, height, bbox } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      
      const outPath1 = path.join(__dirname, '..', 'public', 'logo-blue.png');
      const outPath2 = path.join(__dirname, '..', 'public', 'logo.png');
      
      fs.writeFileSync(outPath1, base64Data, 'base64');
      fs.writeFileSync(outPath2, base64Data, 'base64');
      
      console.log(`Tightly cropped feather logo saved (${width}x${height}). BBox:`, bbox);
      res.writeHead(200);
      res.end('OK');
      
      setTimeout(() => process.exit(0), 500);
    });
  }
});

server.listen(3848, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3848');
});
