const { app, BrowserWindow, dialog } = require('electron');
const electron = require('electron');
const fs = require('fs-extra');
const ipc = electron.ipcMain;

const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const Action = require('./Action');
const { chunk } = require('lodash');
const RegisterYahoo = require('./RegisterYahoo');
const { randomFirstName, randomLastName, randomBirthdate } = require('./helper');

let flagPause = false;
let win;
let interval;
let numberOfThread = 5;

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
  let promises = [null, null, null, null, null];
  let browsers = [null, null, null, null, null];
  let contexts = [null, null, null, null, null];
  let pages = [null, null, null, null, null];
  let datas = [null, null, null, null, null];
  for (let thread = 1; thread <= mailPassChunk.length; thread++) {
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

    browsers[thread] = await puppeteer.launch({
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
        // `--proxy-server=${proxyChunk[thread]}`
      ],
    });
    contexts[thread] = await browsers[thread].createIncognitoBrowserContext();
    pages[thread] = await contexts[thread].newPage();
    const [mail] = mailPassChunk[thread].split("|");
    const firstName = randomFirstName();
    const lastName = randomLastName();
    const birtdate = randomBirthdate();
    promises[thread] = await RegisterYahoo(pages[thread], [mail, firstName, lastName, birtdate]);
  }
  await Promise.allSettled(promises);
}

function isFileExists(pathFile) {
  const check = fs.pathExistsSync(pathFile);
  if (!check) return pathFile;
  return false;
}

ipc.on('start', async function (event, pathFileMail, pathFileProxy, keyCaptcha, keyDaisySms) {
  electron.session.defaultSession.clearCache();
  let incompleteFile1 = isFileExists(pathFileMail);
  let incompleteFile2 = isFileExists(pathFileProxy);
  if (incompleteFile1 || incompleteFile2) {
    win.webContents.send('checkfiles', incompleteFile1 || incompleteFile2);
    return;
  }
  win.webContents.send('disable', true);
  let out = `${__dirname}\\..\\extraResources\\output.txt`;
  let listMailPass = fs.readFileSync(pathFileMail, 'utf8');
  listMailPass = listMailPass.split(/\r?\n/);
  listMailPass = chunk(listMailPass, numberOfThread);
  let listProxy = fs.readFileSync(pathFileProxy, 'utf8');
  listProxy = listProxy.split(/\r?\n/);
  listProxy = chunk(listProxy, numberOfThread);
  let proxyIndex = 0;

  for (const mailPassChunk of listMailPass) {
    if (!listProxy[proxyIndex]?.length || listProxy[proxyIndex]?.length < numberOfThread) {
      proxyIndex = 0;
    }
    await run(mailPassChunk, listProxy[proxyIndex], keyCaptcha, keyDaisySms);
    proxyIndex++;
  }

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
