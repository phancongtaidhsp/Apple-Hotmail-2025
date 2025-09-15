const { app, BrowserWindow } = require('electron');
const electron = require('electron');
const fs = require('fs-extra');
const ipc = electron.ipcMain;
const path = require('path');

const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { encryptPassword, splitArrayIntoChunks, delay } = require('./helper');
const RegisterYahooStep3 = require('./RegisterYahooStep3');
const { checkKeyProxyTmp, getNewIpTmp } = require('./proxy');

let flagPause = false;
let win;
let interval;
let currentIndex = 0;
let numberOfThread = 6;


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

const run = function (thread, mail, proxyKey) {
  return new Promise(async (resolve) => {
    let outsuccess = `${__dirname}\\..\\extraResources\\ChangePassHotmailApple\\success.txt`;
    let outfail = `${__dirname}\\..\\extraResources\\ChangePassHotmailApple\\fail.txt`;
    // register yahoo
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
    } else if (thread == 5) {
      position = {
        x: 0,
        y: 500
      }
    } else if (thread == 6) {
      position = {
        x: 300,
        y: 500
      }
    } else if (thread == 7) {
      position = {
        x: 600,
        y: 500
      }
    } else if (thread == 8) {
      position = {
        x: 900,
        y: 500
      }
    } else if (thread == 9) {
      position = {
        x: 1200,
        y: 500
      }
    }
    let { proxy, username, password } = await getNewIpTmp(proxyKey);
    await delay((thread + 1) * 100);
    let browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: false,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [`--window-size=500,600`, `--window-position=${position.x},${position.y}`,
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disable-gpu-shader-disk-cache',
        '--media-cache-size=0',
        '--disk-cache-size=0',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--mute-audio',
        '--no-default-browser-check',
        '--autoplay-policy=user-gesture-required',
        '--disable-backgrounding-occluded-windows',
        '--disable-notifications',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--no-sandbox',
        '--lang=en-US',
        '--disable-setuid-sandbox',
        '--disable-background-timer-throttling',
        '--disable-dev-shm-usage',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-gpu',
        '--disable-sync',
        `--proxy-server=${proxy}`
      ],
    });
    let context = await browser.createIncognitoBrowserContext();
    let page = await context.newPage();
    if (username && password) {
      await page.authenticate({
        username,
        password,
      });
    }
    let maxTimeout = setTimeout(async () => {
      try {
        if (browser) {
          await browser.close();
        }
      } catch (error) {
        console.log(error);
        if (browser) {
          await browser.close();
        }
      } finally {
        return resolve(null);
      }
    }, 180000);
    let [passwd, statusStep3] = await RegisterYahooStep3(page, [mail, proxyChunkApple]);
    if (statusStep3 == 'pass') {
      fs.appendFileSync(outsuccess, `${mail}|${encryptPassword(passwd)}|${proxyArr.join(":")}` + "\n");
      win.webContents.send('success', 1, flagPause);
    } else {
      fs.appendFileSync(outfail, `${mail}|${statusStep3 || 'fail step 3'}|${proxyArr.join(":")}` + "\n");
      win.webContents.send('fail', 1, flagPause);
    }
    clearTimeout(maxTimeout);
    try {
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      console.log(error);
      if (browser) {
        await browser.close();
      }
    } finally {
      return resolve(statusStep3);
    }
  })
}

function isFileExists(pathFile) {
  const check = fs.pathExistsSync(pathFile);
  if (!check) return pathFile;
  return false;
}

ipc.on('start', async function (event, pathFileMail, proxyKeyArr) {
  electron.session.defaultSession.clearCache();
  numberOfThread = Number(proxyKeyArr.length);
  let isCompleteRunAll = false;
  let tryCount = 0;
  flagPause = false;
  win.webContents.send('disable', true);
  let startTime = 0;
  interval = setInterval(() => {
    startTime++;
    win.webContents.send('time', startTime);
  }, 1000);
  currentIndex = 0;
  let pathFolder = `${__dirname}\\..\\extraResources\\ChangePassHotmailApple`;
  let incompleteFolder = isFileExists(pathFolder);
  if (incompleteFolder) {
    fs.mkdirSync(pathFolder);
    incompleteFolder = isFileExists(pathFolder);
  }
  while (!isCompleteRunAll && tryCount < 5) {
    tryCount++;
    if (flagPause) {
      win.webContents.send('disable', false);
      if (interval) {
        clearInterval(interval);
      }
      return;
    }
    let incompleteFile1 = isFileExists(pathFileMail);
    if (incompleteFolder || incompleteFile1) {
      win.webContents.send('checkfiles', incompleteFolder || incompleteFile1);
      return;
    }
    for (const proxyKey of proxyKeyArr) {
      let checkproxykey = await checkKeyProxyTmp(proxyKey);
      if (!checkproxykey) {
        win.webContents.send('failProxyKey', proxyKey);
        return;
      }
    }

    let listMailPass = fs.readFileSync(pathFileMail, 'utf8');
    listMailPass = listMailPass.split(/\r?\n/);
    let listChunkMailRun = splitArrayIntoChunks(listMailPass, numberOfThread);
    let promises = [];
    for (let thread = 0; thread < listChunkMailRun.length; thread++) {
      const mailChunk = listChunkMailRun[thread];
      const proxyKey = proxyKeyArr[thread];
      promises.push((async () => {
        for (const mail of mailChunk) {
          try {
            if (flagPause) {
              win.webContents.send('disable', false);
              if (interval) {
                clearInterval(interval);
              }
              return;
            }
            currentIndex++;
            win.webContents.send('total', currentIndex);
            await run(thread, mail, proxyKey);
          } catch (err) {
            console.log(err);
          }
        }
      })())
    }
    await Promise.allSettled(promises);
    xuatKetQua(pathFileMail);
    await delay(2000);
    listMailPass = fs.readFileSync(pathFileMail, 'utf8');
    if (listMailPass.length < 5) {
      isCompleteRunAll = true;
    }
    const tempDir = path.join(require('os').tmpdir());
    fs.readdir(tempDir, (err, files) => {
      if (err) return console.error(err);
      files.forEach(file => {
        if (file.startsWith('puppeteer_dev_profile-')) {
          fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
        }
      });
    });
  }
  win.webContents.send('disable', false);
  if (interval) {
    clearInterval(interval);
  }
})

ipc.on('pause', async function (event) {
  flagPause = true;
  if (interval) {
    clearInterval(interval)
  }
  win.webContents.send('pause', "Đang tạm dừng...Vui lòng chờ...", true);
})

const xuatKetQua = (pathFileMail) => {
  let outsuccess = `${__dirname}\\..\\extraResources\\ChangePassHotmailApple\\success.txt`;
  let outfail = `${__dirname}\\..\\extraResources\\ChangePassHotmailApple\\fail.txt`;
  let incompleteFile1 = isFileExists(pathFileMail);
  if (incompleteFile1) {
    win.webContents.send('checkfiles', incompleteFile1);
    return;
  }
  let listMail = fs.readFileSync(pathFileMail, 'utf8');
  listMail = listMail.split(/\r?\n/);
  let listMailSuccess = fs.readFileSync(outsuccess, 'utf8');
  listMailSuccess = listMailSuccess.split(/\r?\n/);
  let listMailFail = fs.readFileSync(outfail, 'utf8');
  listMailFail = listMailFail.split(/\r?\n/);
  // remove all mail success
  for (const maildata of listMailSuccess) {
    let mail = maildata.split('|')?.[0];
    let indexMail = listMail.findIndex(m => m == mail);
    if (indexMail >= 0) {
      listMail = [...listMail.slice(0, indexMail), ...listMail.slice(indexMail + 1)];
    }
  }
  let newListMailFail = [...listMailFail];
  for (const maildata of listMailFail) {
    if (maildata.includes("khong ve mail") || maildata.includes("fail step 3") || maildata.includes("fail send mail") || maildata.includes("recaptcha")) {
      // remove fail in fail file
      let indexMail = newListMailFail.findIndex(m => m == maildata);
      if (indexMail >= 0) {
        newListMailFail = [...newListMailFail.slice(0, indexMail), ...newListMailFail.slice(indexMail + 1)];
      }
    } else {
      // remove fail in input file
      let mail = maildata.split('|')?.[0];
      let indexMail = listMail.findIndex(m => m == mail);
      if (indexMail >= 0) {
        listMail = [...listMail.slice(0, indexMail), ...listMail.slice(indexMail + 1)];
      }
    }
  }
  fs.writeFileSync(pathFileMail, listMail.join('\n'), 'utf8');
  fs.writeFileSync(outfail, newListMailFail.join('\n'), 'utf8');
}

ipc.on('result', function (event, pathFileMail) {
  xuatKetQua(pathFileMail);
  win.webContents.send('result', true);
})