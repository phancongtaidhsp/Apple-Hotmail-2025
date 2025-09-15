const electron = require('electron');
const ipc = electron.ipcRenderer;

document.getElementById('start').addEventListener('click', function () {
  document.getElementById('thongbao').classList.add('hidden')
  let pathFileMail = document.getElementById('filepathmail').value;
  let keyNope = document.getElementById('keynopecha').value;
  let keyProxy = document.getElementById('keyproxy').value;
  let proxyKeyArr = keyProxy.split("|");
  let soluong = document.getElementById('soluong').value || 0;
  if (soluong < 1 || soluong > 10) {
    soluong = 4;
  }
  if (pathFileMail[0] == '"') {
    pathFileMail = pathFileMail.substring(1)
  }
  if (pathFileMail[pathFileMail.length - 1] == '"') {
    pathFileMail = pathFileMail.substring(0, pathFileMail.length - 1)
  }
  ipc.send('start', pathFileMail, keyNope, proxyKeyArr);
});

document.getElementById('pause').addEventListener('click', function () {
  ipc.send('pause');
});
document.getElementById('result').addEventListener('click', function () {
  let pathFileMail = document.getElementById('filepathmail').value;
  if (pathFileMail[0] == '"') {
    pathFileMail = pathFileMail.substring(1)
  }
  if (pathFileMail[pathFileMail.length - 1] == '"') {
    pathFileMail = pathFileMail.substring(0, pathFileMail.length - 1)
  }
  ipc.send('result', pathFileMail);
})