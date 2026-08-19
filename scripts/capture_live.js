const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\Ange DH\\.gemini\\antigravity-ide\\brain\\2af6eb25-a14d-4f33-b2b4-930931c35f9e';

async function main() {
  console.log('1. Launching browser to test Manifest addition behavior...');
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = spawn(browserExe, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\cdp_profile_' + Date.now(),
    '--window-size=1280,900',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000/'
  ], { detached: false, stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 4500));

  let targets;
  for (let i = 0; i < 5; i++) {
    try {
      targets = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      if (targets) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('No page target found');

  const WebSocket = require('ws');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await new Promise((resolve) => ws.on('open', resolve));

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 2000));

  // 1. Capture Manifest section
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('manifeste');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    `
  });
  await new Promise(r => setTimeout(r, 800));
  let res1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_manifest_1.png'), Buffer.from(res1.data, 'base64'));

  // 2. Scroll into Problem section
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('probleme');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    `
  });
  await new Promise(r => setTimeout(r, 800));
  let res2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_manifest_2_problem.png'), Buffer.from(res2.data, 'base64'));

  // 3. Scroll to Methode section where pin starts
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('methode');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `
  });
  await new Promise(r => setTimeout(r, 800));
  let res3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_manifest_3_methode_start.png'), Buffer.from(res3.data, 'base64'));

  // 4. Scroll into middle of card stacking
  await send('Runtime.evaluate', { expression: `window.scrollBy(0, 600);` });
  await new Promise(r => setTimeout(r, 800));
  let res4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_manifest_4_card_stacking.png'), Buffer.from(res4.data, 'base64'));

  // 5. Scroll to all 3 cards docked
  await send('Runtime.evaluate', { expression: `window.scrollBy(0, 700);` });
  await new Promise(r => setTimeout(r, 800));
  let res5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_manifest_5_all3_docked.png'), Buffer.from(res5.data, 'base64'));

  ws.close();
  browser.kill();
  console.log('Done capturing all 5 manifest test screenshots!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
