const electron = require('electron');
const ipc = electron.ipcRenderer;

document.getElementById('start').addEventListener('click', function () {
  document.getElementById('thongbao').classList.add('hidden')
  let pathFileMail = document.getElementById('filepathmail').value
  let pathFileProxy = document.getElementById('filepathproxy').value
  let keyCaptcha = document.getElementById('keycaptcha').value
  let keyDaisySms = document.getElementById('keydaisysms').value
  if(pathFileMail[0] == '"') {
    pathFileMail = pathFileMail.substring(1)
  }
  if(pathFileMail[pathFileMail.length - 1] == '"') {
    pathFileMail = pathFileMail.substring(0, pathFileMail.length - 1)
  }
  if(pathFileProxy[0] == '"') {
    pathFileProxy = pathFileProxy.substring(1)
  }
  if(pathFileProxy[pathFileProxy.length - 1] == '"') {
    pathFileProxy = pathFileProxy.substring(0, pathFileProxy.length - 1)
  }
  ipc.send('start', pathFileMail, pathFileProxy, keyCaptcha, keyDaisySms);
});

document.getElementById('pause').addEventListener('click', function () {
  ipc.send('pause');
});