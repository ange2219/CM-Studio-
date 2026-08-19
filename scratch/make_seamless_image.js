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
            
            const cx = c.width / 2;
            const cy = c.height / 2;
            const rx = c.width * 0.46;
            const ry = c.height * 0.46;
            
            for (let y = 0; y < c.height; y++) {
              for (let x = 0; x < c.width; x++) {
                const idx = (y * c.width + x) * 4;
                const r = d[idx], g = d[idx+1], b = d[idx+2];
                
                // Normalized distance from center (elliptical)
                const dx = (x - cx) / rx;
                const dy = (y - cy) / ry;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // If in outer margin (> 0.75), fade out background pixels
                if (dist > 0.65) {
                  // Check if this pixel is background (very light color r>220, g>225, b>235)
                  const isBg = (r > 215 && g > 220 && b > 230);
                  
                  if (isBg) {
                    const fade = Math.max(0, Math.min(1, (1.0 - dist) / 0.35));
                    // Smooth cubic ease out
                    const alpha = fade * fade * (3 - 2 * fade);
                    d[idx+3] = Math.round(d[idx+3] * alpha);
                  } else if (dist > 0.95) {
                    const fade = Math.max(0, Math.min(1, (1.05 - dist) / 0.1));
                    d[idx+3] = Math.round(d[idx+3] * fade);
                  }
                }
                
                // Hard outer edge is guaranteed 0 alpha
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
      
      console.log('Saved seamless transparent PNG!');
      res.writeHead(200);
      res.end('OK');
      setTimeout(() => process.exit(0), 400);
    });
  }
});

server.listen(3850, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3850');
});
