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

const getBalanceDaisySMS = async (apiKey) => {
  let promises = [];
  for (let i = 0; i < 2; i++) {
    promises.push(new Promise((resolve) => {
      var options = {
        method: 'GET',
        url: `https://daisysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getBalance`,
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
          if (response?.data?.includes("ACCESS_BALANCE")) {
            let balance = Number(response?.data?.replace("ACCESS_BALANCE:", ""));
            resolve(balance);
          } else {
            resolve(-1);
          }
        }).catch((e) => {
          resolve(-1);
        });
    }))
  }
  const [balance1, balance2] = await Promise.all(promises);
  if (balance1 == balance2) {
    return balance1;
  }
  return 0;
}

const getBalance2Captcha = async (keyCaptcha) => {
  return new Promise((resolve) => {
    var data = JSON.stringify({
      "clientKey": keyCaptcha
    });
    var options = {
      method: 'POST',
      url: 'https://api.2captcha.com/getBalance',
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
      },
      data
    };
    instance.request(options)
      .then(function (response) {
        if (response?.data?.balance) {
          resolve(response?.data?.balance);
        } else {
          resolve(0);
        }
      }).catch((e) => {
        resolve(0);
      });
  })
}

const rentPhoneDaisySMS = async (apiKey) => {
  return new Promise((resolve) => {
    var options = {
      method: 'GET',
      url: `https://daisysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getNumber&service=mb&max_price=0.12`,
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
    resolve({ idDaisySMS: "106989382", phoneDaisySMS: "5123660160" });
    // instance.request(options)
    //   .then(function (response) {
    //     if (response?.data?.includes("ACCESS_NUMBER")) {
    //       const textNumbers = response?.data?.split(":");
    //       resolve({ idDaisySMS: textNumbers?.[1], phoneDaisySMS: textNumbers?.[2]?.substring(1) });
    //     } else {
    //       resolve({ idDaisySMS: null, phoneDaisySMS: null });
    //     }
    //   }).catch((e) => {
    //     resolve({ idDaisySMS: null, phoneDaisySMS: null });
    //   });
  })
}

const getCodeDaisySMS = async (apiKey, idDaisySMS) => {
  return new Promise((resolve) => {
    var options = {
      method: 'GET',
      url: `https://daisysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getStatus&id=${idDaisySMS}`,
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
        if (response?.data) {
          let code = response?.data?.match(/\d+/)?.[0];
          resolve(code);
        } else {
          resolve(false);
        }
      }).catch((e) => {
        resolve(false);
      });
  })
}

const markAsDoneDaisySMS = async (apiKey, idDaisySMS) => {
  return new Promise((resolve) => {
    var options = {
      method: 'GET',
      url: `https://daisysms.com/stubs/handler_api.php?api_key=${apiKey}&action=setStatus&id=${idDaisySMS}&status=6`,
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
        resolve(true);
      }).catch((e) => {
        resolve(true);
      });
  })
}

module.exports = {
  randomBirthdate,
  randomFirstName,
  randomLastName,
  checkProxyStatus,
  getBalanceDaisySMS,
  getBalance2Captcha,
  rentPhoneDaisySMS,
  getCodeDaisySMS,
  markAsDoneDaisySMS
};