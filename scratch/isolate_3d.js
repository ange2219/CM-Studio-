const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');

const srcPath = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\c94d80f8-120b-4e75-b47f-12cdfa86122a\\login_illustration_3d_1786895463677.jpg';

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
            
            // Sample corner colors (background floor)
            // Corners in this 3D image are around rgb(235-248, 240-250, 248-255)
            // We want to make the background 100% transparent and keep 3D cards/icons/shadows!
            
            for (let i = 0; i < d.length; i += 4) {
              const r = d[i], g = d[i+1], b = d[i+2];
              
              // Calculate luminance / lightness
              // If it's a very bright background pixel (r > 228 && g > 235 && b > 242)
              // We convert its brightness to alpha transparency relative to white!
              const minVal = Math.min(r, g, b);
              const maxVal = Math.max(r, g, b);
              
              // If pixel is near-white/light-grey background
              if (minVal > 220 && (maxVal - minVal) < 25) {
                // Background floor: calculate transparency
                // 255 -> alpha 0
                // 220 -> alpha 0.4
                const brightness = (r + g + b) / 3;
                if (brightness >= 240) {
                  d[i+3] = 0; // Completely transparent!
                } else if (brightness > 215) {
                  const factor = (240 - brightness) / 25; // 0 to 1
                  d[i+3] = Math.round(factor * 180);
                }
              }
            }
            
            // Now do an edge-fade mask (outer 15% of the image is completely faded to 0)
            const cx = c.width / 2;
            const cy = c.height / 2;
            const rx = c.width * 0.42;
            const ry = c.height * 0.42;
            
            for (let y = 0; y < c.height; y++) {
              for (let x = 0; x < c.width; x++) {
                const idx = (y * c.width + x) * 4;
                const dx = (x - cx) / rx;
                const dy = (y - cy) / ry;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0.70) {
                  const fade = Math.max(0, Math.min(1, (1.0 - dist) / 0.30));
                  const smoothFade = fade * fade * (3 - 2 * fade);
                  d[idx+3] = Math.round(d[idx+3] * smoothFade);
                }
                if (dist >= 1.0) {
                  d[idx+3] = 0;
                }
              }
            }
            
            ctx.putImageData(id, 0, 0);
            
            const dataUrl = c.toDataURL('image/png');
            fetch('/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl })
            }).then(() => window.close());
          };
        </script>
      </body>
      </html>
    `);
  } else if (req.url === '/image.jpg') {
    const data = fs.readFileSync(srcPath);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(data);
  } else if (req.url === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { dataUrl } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      
      fs.writeFileSync('public/images/login-illustration.png', base64Data, 'base64');
      fs.writeFileSync('public/illustration.png', base64Data, 'base64');
      
      console.log('Saved transparent isolated 3D image with 0 background!');
      res.writeHead(200);
      res.end('OK');
      setTimeout(() => process.exit(0), 400);
    });
  }
});

server.listen(3851, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3851');
});
