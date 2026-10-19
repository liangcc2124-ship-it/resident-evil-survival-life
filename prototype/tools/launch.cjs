const http = require('node:http');
const path = require('node:path');
const {spawn} = require('node:child_process');
const url = 'http://127.0.0.1:4173/';
function ready() {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(res.statusCode === 200 && body.includes('js/app.js')));
    });
    req.setTimeout(1000, () => req.destroy());
    req.on('error', () => resolve(false));
  });
}
(async () => {
  if (!await ready()) {
    const child = spawn(process.execPath, [path.join(__dirname, 'serve.cjs')], {
      cwd: path.join(__dirname, '..'), detached: true, windowsHide: true, stdio: 'ignore'
    });
    child.unref();
    let started = false;
    for (let i = 0; i < 30; i++) {
      if (await ready()) { started = true; break; }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!started) throw Error('Cannot start game. Port 4173 may be occupied.');
  }
  console.log('Game ready: ' + url);
  if (!process.argv.includes('--no-browser')) {
    spawn('explorer.exe', [url], {windowsHide: true, stdio: 'ignore'}).on('error', console.error);
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
