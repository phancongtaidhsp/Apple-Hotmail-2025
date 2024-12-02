const { app, BrowserWindow, dialog } = require('electron');
const electron = require('electron');
const ipc = electron.ipcMain;

const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const Action = require('./Action');

let flagPause = false;
let win;
let interval;

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

const run = async function (thread, proxy, mailpass, keycaptcha) {
  let browser = null;
  let page = null;
  let position = {
    x: 0,
    y: 0
  }
  if (thread === '2') {
    position = {
      x: 0,
      y: 500
    }
  } else if (thread === '3') {
    position = {
      x: 800,
      y: 0
    }
  } else if (thread === '4') {
    position = {
      x: 800,
      y: 500
    }
  } else if (thread === '5') {
    position = {
      x: 400,
      y: 250
    }
  }
  
  browser = await puppeteer.launch({
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    ignoreHTTPSErrors: true,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [`--window-size=1200,650`, `--window-position=${position.x},${position.y}`,
      '--disable-infobars',
      '--disk-cache-size=0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      `--proxy-server=${proxy}`
    ],
  });
  context = await browser.createIncognitoBrowserContext();
  page = await context.newPage();
  await Action(page, ["bloodaroundfanta2777844@hotmail.com", "Limong47@"]);
}


ipc.on('start', async function (event, dataText, proxyKeyText) {
  electron.session.defaultSession.clearCache();
  flagPause = false;
  interval = setInterval(() => {
    startTime++;
    win.webContents.send('time', startTime);
  }, 1000);
})

ipc.on('pause', async function (event) {
  flagPause = true;
  if (interval) {
    clearInterval(interval)
  }
  win.webContents.send('info', "Đang tạm dừng...Vui lòng chờ...", true);
})
