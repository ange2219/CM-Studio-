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
      <body style="background:#222;">
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
            
            for (let i = 0; i < d.length; i += 4) {
              const r = d[i], g = d[i+1], b = d[i+2];
              
              // Blue detection:
              // Feather is vibrant blue: b is distinctly higher than r and g
              const isFeather = (b > 110 && b > r + 25 && b > g + 10);
              
              if (!isFeather) {
                d[i+3] = 0;
              } else {
                // Keep smooth anti-aliased edge
                const diff = (b - Math.max(r, g));
                if (diff < 35) {
                  d[i+3] = Math.min(255, Math.floor((diff / 35) * 255));
                }
              }
            }
            
            ctx.putImageData(id, 0, 0);
            
            // Send back
            const dataUrl = c.toDataURL('image/png');
            fetch('/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl })
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
      const { dataUrl } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      
      const outPath1 = path.join(__dirname, '..', 'public', 'logo-blue.png');
      const outPath2 = path.join(__dirname, '..', 'public', 'logo.png');
      
      fs.writeFileSync(outPath1, base64Data, 'base64');
      fs.writeFileSync(outPath2, base64Data, 'base64');
      
      console.log('Successfully saved transparent logos to public/logo-blue.png and public/logo.png');
      res.writeHead(200);
      res.end('OK');
      
      setTimeout(() => process.exit(0), 500);
    });
  }
});

server.listen(3847, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3847');
});
