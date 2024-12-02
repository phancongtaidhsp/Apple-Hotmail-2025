const Captcha = require("2captcha");
const { faker } = require('@faker-js/faker');
const axios = require('axios-https-proxy-fix');

const instance = axios.create({
  timeout: 30000,
})

const randomBirthdate = () => {
  let day = Math.floor(Math.random() * 12) + 1;
  let month = Math.floor(Math.random() * 12) + 1;
  var year = Math.floor(Math.random() * 30) + 1970;
  return `${year}-${month}-${day}`;
}

const randomFirstName = () => {
  return faker.person.firstName();
}

const randomLastName = () => {
  return faker.person.lastName();
}

const checkProxyStatus = async (proxyString) => {
  return new Promise((resolve) => {
    const proxyArr = proxyString.split(":");
    const proxy = {
      protocol: 'http',
      host: proxyArr[0],
      port: parseInt(proxyArr[1])
    }
    var options = {
      method: 'GET',
      proxy,
      url: 'https://login.yahoo.com/account/create',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      }
    };
    instance.request(options)
      .then(function (response) {
        resolve({ proxy: proxyString, status: 'pass' });
      }).catch((e) => {
        resolve({ proxy: proxyString, status: 'fail' });
      });
  })
}

const getCaptchaData = (keyCaptcha) => {
  return new Promise((resolve) => {
    // A new 'solver' instance with our API key
    const solver = new Captcha.Solver(keyCaptcha)
    /* Example ReCaptcha Website */
    solver.recaptcha("6Ldbp6saAAAAAAwuhsFeAysZKjR319pRcKUitPUO", "https://login.yahoo.com/account/challenge/recaptcha").then((res) => {
      resolve({ data: res.data, id: res.id });
    }).catch((err) => {
      console.log(err);
      resolve(false);
    })
  })
}

const refundCaptcha = async (keyCaptcha, id) => {
  const solver = new Captcha.Solver(keyCaptcha)
  await solver.report(id);
}

module.exports = {
  getCaptchaData,
  randomBirthdate,
  randomFirstName,
  randomLastName,
  refundCaptcha,
  checkProxyStatus
};