const { app, BrowserWindow, dialog } = require('electron');
const electron = require('electron');
const fs = require('fs-extra');
const ipc = electron.ipcMain;

const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
puppeteer.use(StealthPlugin());

const Action = require('./Action');
const { chunk, sampleSize } = require('lodash');
const RegisterYahooStep1 = require('./RegisterYahooStep1');
const { randomFirstName, randomLastName, randomBirthdate, checkProxyStatus } = require('./helper');

let flagPause = false;
let win;
let interval;
let numberOfThread = 3;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const run = async function (mailPassChunk, proxyChunk, keyCaptcha, keyDaisySms) {
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: keyCaptcha
      }
    })
  );
  let out = `${__dirname}\\..\\extraResources\\output.txt`;
  let promises = [null, null, null, null, null];
  let browsers = [null, null, null, null, null];
  let contexts = [null, null, null, null, null];
  let pages = [null, null, null, null, null];

  // register yahoo
  for (let thread = 0; thread < mailPassChunk.length; thread++) {
    let position = {
      x: 0,
      y: 0
    }
    if (thread == 1) {
      position = {
        x: 300,
        y: 0
      }
    } else if (thread == 2) {
      position = {
        x: 600,
        y: 0
      }
    } else if (thread == 3) {
      position = {
        x: 900,
        y: 0
      }
    } else if (thread == 4) {
      position = {
        x: 1200,
        y: 0
      }
    }

    browsers[thread] = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: false,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [`--window-size=500,600`, `--window-position=${position.x},${position.y}`,
        '--disable-infobars',
        '--disk-cache-size=0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        `--proxy-server=${proxyChunk[thread]}`
      ],
    });
    contexts[thread] = await browsers[thread].createIncognitoBrowserContext();
    pages[thread] = await contexts[thread].newPage();
    const [mail] = mailPassChunk[thread].split("|");
    const firstName = randomFirstName();
    const lastName = randomLastName();
    const birtdate = randomBirthdate();
    promises[thread] = RegisterYahooStep1(pages[thread], [mail, firstName, lastName, birtdate]);
  }
  let promiseSettledRes = await Promise.allSettled(promises);
  promiseSettledRes = promiseSettledRes.filter(p => p.status === "fulfilled").map(p => p.value);
  // get a phone number to verify

}

function isFileExists(pathFile) {
  const check = fs.pathExistsSync(pathFile);
  if (!check) return pathFile;
  return false;
}

async function getProxiesFailed(listProxy) {
  let promises = [];
  for (const proxy of listProxy) {
    promises.push(checkProxyStatus(proxy));
  }
  let checkProxiesRes = await Promise.all(promises);
  return checkProxiesRes.filter(r => r.status === 'fail').map(r => r.proxy);
}

ipc.on('start', async function (event, pathFileMail, pathFileProxy, keyCaptcha, keyDaisySms) {
  electron.session.defaultSession.clearCache();
  let flagHetProxy = false;
  let incompleteFile1 = isFileExists(pathFileMail);
  let incompleteFile2 = isFileExists(pathFileProxy);
  if (incompleteFile1 || incompleteFile2) {
    win.webContents.send('checkfiles', incompleteFile1 || incompleteFile2);
    return;
  }
  win.webContents.send('disable', true);
  let listMailPass = fs.readFileSync(pathFileMail, 'utf8');
  listMailPass = listMailPass.split(/\r?\n/);
  listMailPass = chunk(listMailPass, numberOfThread);
  let listProxy = fs.readFileSync(pathFileProxy, 'utf8');
  listProxy = listProxy.split(/\r?\n/);

  for (const mailPassChunk of listMailPass) {
    let proxiesRun = sampleSize(listProxy, numberOfThread);
    let proxiesFailed = await getProxiesFailed(proxiesRun);
    while (proxiesFailed.length > 0 && listProxy.length >= numberOfThread) {
      // remove failed proxies
      listProxy = [...listProxy,...proxiesFailed];
      listProxy = listProxy.filter((item, index, arr) => (arr.lastIndexOf(item) == arr.indexOf(item)));
      proxiesRun = sampleSize(listProxy, numberOfThread);
      proxiesFailed = await getProxiesFailed(proxiesRun);
    }
    if (proxiesRun.length == mailPassChunk.length && proxiesFailed.length == 0) {
      await run(mailPassChunk, proxiesRun, keyCaptcha, keyDaisySms);
    } else {
      flagHetProxy = true;
      break;
    }
  }

  if (flagHetProxy) {
    win.webContents.send('loi', `Không đủ proxy để chạy tiếp! proxy còn lại: ${listProxy.join("|")}`, true);
  }

  // flagPause = false;
  // interval = setInterval(() => {
  //   startTime++;
  //   win.webContents.send('time', startTime);
  // }, 1000);
})

ipc.on('pause', async function (event) {
  flagPause = true;
  if (interval) {
    clearInterval(interval)
  }
  win.webContents.send('pause', "Đang tạm dừng...Vui lòng chờ...", true);
})
