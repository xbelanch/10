#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHROME_PORT = 9230;

const targets = [
  { page: '2', name: 'vimeo-118565187', type: 'iframe', width: 900, height: 506, url: 'https://player.vimeo.com/video/118565187', thumbnailUrl: 'https://i.vimeocdn.com/video/507352891-fbf01793517abdc75bf9995160fb8a40c4dd0392b2ee529bcba59e509fe38fbd-d_1280x720' },
  { page: '4', name: 'vimeo-26036966', type: 'iframe', width: 900, height: 506, url: 'https://player.vimeo.com/video/26036966', thumbnailUrl: 'https://i.vimeocdn.com/video/468433034-43a5d1347ad193e0e30ba716f5e17be180c76d9099a7b33db1edb79a940dd097-d_1280x720' },
  { page: '5', name: 'ccma-4376630', type: 'iframe', width: 900, height: 506, url: 'https://www.ccma.cat/video/embed/4376630', thumbnailUrl: 'https://img.3cat.cat/multimedia/jpg/2/6/1355227262862.jpg?strip=3cat-1200x628' },
  { page: '5', name: 'youtube-I7qSnmrJW1E', type: 'iframe', width: 900, height: 506, url: 'https://www.youtube.com/embed/I7qSnmrJW1E', thumbnailUrl: 'https://img.youtube.com/vi/I7qSnmrJW1E/hqdefault.jpg' },
  { page: '6', name: 'soundcloud-conillet-blanc', type: 'iframe', width: 900, height: 200, url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/210802213&color=0066cc&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false' },
  { page: '6', name: 'issuu-conillet', type: 'issuu', width: 900, height: 452, configId: '0/12273045' },
  { page: '6', name: 'slides-pas6-1', type: 'iframe', width: 900, height: 656, url: 'https://slides.com/miniopsioc/pas6-1/embed?style=light' },
  { page: '6', name: 'slides-pas6-2', type: 'iframe', width: 900, height: 656, url: 'https://slides.com/miniopsioc/pas6-2/embed?style=light' },
  { page: '7', name: 'soundcloud-polzet', type: 'iframe', width: 900, height: 200, url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/189245278&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true' },
  { page: '7', name: 'youtube-IOOvTA2IlaQ', type: 'iframe', width: 900, height: 506, url: 'https://www.youtube.com/embed/IOOvTA2IlaQ', thumbnailUrl: 'https://img.youtube.com/vi/IOOvTA2IlaQ/maxresdefault.jpg' },
  { page: '8', name: 'slides-pas8-1', type: 'iframe', width: 900, height: 656, url: 'https://slides.com/miniopsioc/pas8-1/embed?style=light' },
  { page: '8', name: 'slides-pas8-2', type: 'iframe', width: 900, height: 656, url: 'https://slides.com/miniopsioc/pas8-2/embed?style=light' },
  { page: '9', name: 'vimeo-119711900', type: 'iframe', width: 900, height: 661, url: 'https://player.vimeo.com/video/119711900', thumbnailUrl: 'https://i.vimeocdn.com/video/507299051-6122983eaf6bc8003d42b15191e7a10732e59917ff0b8ecf04481b34dc821ea3-d_1280x720' },
  { page: '9', name: 'vimeo-119711902', type: 'iframe', width: 900, height: 661, url: 'https://player.vimeo.com/video/119711902', thumbnailUrl: 'https://i.vimeocdn.com/video/507299070-c89a9b549f3da59f179faf2e7e77c4c67e5a07104f1fbffb6d703453de49d282-d_1280x720' },
  { page: '9', name: 'vimeo-119711903', type: 'iframe', width: 900, height: 661, url: 'https://player.vimeo.com/video/119711903', thumbnailUrl: 'https://i.vimeocdn.com/video/507299670-036c5f13b5ce1cff2a79da166f7d4809f6b36e177118c8fb361a9a739334958b-d_1280x720' },
  { page: '10', name: 'soundcloud-preadolescents', type: 'iframe', width: 900, height: 200, url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/190074125&color=0066cc&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false' },
  { page: '12', name: 'youtube-CKhJ8y45T3k', type: 'iframe', width: 900, height: 506, url: 'https://www.youtube.com/embed/CKhJ8y45T3k?cc_load_policy=1&hl=es&cc_lang_pref=es', thumbnailUrl: 'https://img.youtube.com/vi/CKhJ8y45T3k/hqdefault.jpg' },
];

function requestJson(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(data));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function requestText(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function waitForChrome() {
  for (let i = 0; i < 40; i += 1) {
    try {
      await requestJson(`http://127.0.0.1:${CHROME_PORT}/json/version`);
      return;
    } catch (_error) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('Chromium DevTools endpoint did not start');
}

function htmlFor(target) {
  const frameStyle = 'border:0;display:block;width:100vw;height:100vh;';
  if (target.type === 'issuu') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#f7f3ef}.issuuembed{width:100vw!important;height:100vh!important}</style></head><body><div data-configid="${target.configId}" class="issuuembed"></div><script src="https://e.issuu.com/embed.js" async></script></body></html>`;
  }
  if (target.type === 'image') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#f5f5f5;display:flex;align-items:center;justify-content:center}img{display:block;max-width:100vw;max-height:100vh;width:auto;height:auto}</style></head><body><img src="${target.url}" alt=""></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#111}</style></head><body><iframe src="${target.url}" style="${frameStyle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></body></html>`;
}

function generateThumbnail(target, outDir) {
  const tmpPath = path.join(outDir, `.${target.name}.remote`);
  const webpPath = path.join(outDir, `${target.name}.webp`);
  execFileSync('curl', ['-L', '--max-time', '20', '-s', target.thumbnailUrl, '-o', tmpPath]);
  execFileSync('magick', [
    tmpPath,
    '-resize',
    `${target.width}x${target.height}^`,
    '-gravity',
    'center',
    '-extent',
    `${target.width}x${target.height}`,
    '-strip',
    '-quality',
    '82',
    webpPath,
  ]);
  fs.rmSync(tmpPath, { force: true });
}

async function main() {
  const chrome = spawn('chromium', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${CHROME_PORT}`,
    '--user-data-dir=/tmp/miniops-preview-chrome',
    'about:blank',
  ], { stdio: 'ignore' });

  try {
    await waitForChrome();
    for (const target of targets) {
      const outDir = path.join(ROOT, target.page, 'assets', 'media-previews');
      fs.mkdirSync(outDir, { recursive: true });
      if (target.thumbnailUrl) {
        generateThumbnail(target, outDir);
        console.log(`${target.page}: ${target.name}.webp`);
        continue;
      }
      const htmlPath = path.join(outDir, `.${target.name}.html`);
      const pngPath = path.join(outDir, `.${target.name}.png`);
      const webpPath = path.join(outDir, `${target.name}.webp`);
      fs.writeFileSync(htmlPath, htmlFor(target));

      const tab = await requestJson(`http://127.0.0.1:${CHROME_PORT}/json/new?file://${htmlPath}`, 'PUT');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      let id = 0;
      const pending = new Map();
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.id && pending.has(data.id)) {
          pending.get(data.id)(data);
          pending.delete(data.id);
        }
      };
      await new Promise((resolve) => { ws.onopen = resolve; });
      const send = (method, params = {}) => {
        id += 1;
        ws.send(JSON.stringify({ id, method, params }));
        return new Promise((resolve) => pending.set(id, resolve));
      };
      await send('Page.setViewportMetricsOverride', {
        width: target.width,
        height: target.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await send('Page.navigate', { url: `file://${htmlPath}` });
      await new Promise((resolve) => setTimeout(resolve, target.type === 'issuu' ? 4500 : 3000));
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        clip: { x: 0, y: 0, width: target.width, height: target.height, scale: 1 },
      });
      fs.writeFileSync(pngPath, Buffer.from(shot.result.data, 'base64'));
      execFileSync('magick', [pngPath, '-strip', '-quality', '82', webpPath]);
      fs.rmSync(pngPath, { force: true });
      fs.rmSync(htmlPath, { force: true });
      console.log(`${target.page}: ${target.name}.webp`);
      await requestText(`http://127.0.0.1:${CHROME_PORT}/json/close/${tab.id}`).catch(() => {});
    }
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
