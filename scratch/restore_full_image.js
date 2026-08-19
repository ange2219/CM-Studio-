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
            
            // Full pristine resolution image without clipping any icon or border
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
      
      console.log('Restored 100% full unclipped high-res image!');
      res.writeHead(200);
      res.end('OK');
      setTimeout(() => process.exit(0), 400);
    });
  }
});

server.listen(3852, () => {
  exec('"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu http://localhost:3852');
});
