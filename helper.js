const axios = require('axios-https-proxy-fix');
const axiosDefault = require('axios');
const randomize = require('randomatic');

const instanceDefault = axiosDefault.create({
  timeout: 15000,
})

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const generatePassword = () => {
  return randomize('A', 3) + randomize('0', 3) + randomize('a', 3) + randomize('0', 3) + '@' + randomize('a', 3);
}


const splitArrayIntoChunks = (array, numChunks) => {
  const chunkSize = Math.floor(array.length / numChunks); // Kích thước mỗi mảng nhỏ
  const remainder = array.length % numChunks;
  const chunks = [];
  for (let i = 0; i < numChunks; i++) {
    chunks.push(array.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  if (remainder > 0) {
    chunks[chunks.length - 1] = [...chunks[chunks.length - 1], ...array.slice(array.length - remainder)];
  }
  return chunks;
}

const getProcessCaptcha = (proxy, apiKey, imageData) => {
  return new Promise((resolve) => {
    const ua = {
      "httplib": "node-fetch",
      "lang": "node",
      "lang_version": process.version,
      "platform": process.platform,
      "publisher": "nopecha",
    };
    let data = JSON.stringify({
      "key": apiKey,
      "type": "textcaptcha",
      "image_urls": [imageData]
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.nopecha.com/',
      headers: {
        'Content-Type': 'application/json',
        'user_agent': 'NopeCHA NodeBindings',
        'X-NopeCHA-Client-User-Agent': JSON.stringify(ua),
        'Authorization': `Bear ${apiKey}`
      },
      data: data
    };
    if (proxy) {
      config.proxy = proxy;
    }
    axios.request(config)
      .then((response) => {
        if (response?.data?.data) {
          resolve(response?.data?.data);
        } else {
          resolve(false);
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  })
}

const getCaptchaResultNope = async (proxy, apiKey, imageData) => {
  let idCaptcha = null;
  for (let i = 0; i < 5; i++) {
    if (i % 2 == 0) {
      idCaptcha = await getProcessCaptcha(proxy, apiKey, imageData);
    } else {
      idCaptcha = await getProcessCaptcha(null, apiKey, imageData);
    }
    if (idCaptcha) {
      break;
    }
    await delay(2000);
  }
  if (idCaptcha) {
    let onProxy = true;
    for (let i = 0; i < 120; i++) {
      const ua = {
        "httplib": "node-fetch",
        "lang": "node",
        "lang_version": process.version,
        "platform": process.platform,
        "publisher": "nopecha",
      };
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.nopecha.com?key=${apiKey}&id=${idCaptcha}`,
        headers: {
          'Content-Type': 'application/json',
          'user_agent': 'NopeCHA NodeBindings',
          'X-NopeCHA-Client-User-Agent': JSON.stringify(ua),
          'Authorization': `Bear ${apiKey}`
        },
      };
      if (onProxy && proxy) {
        config.proxy = proxy;
      }
      try {
        let res = await axios.request(config);
        if (res?.data?.data) {
          return res?.data?.data?.[0];
        } else {
          onProxy = false;
        }
      } catch (error) {
        if (error?.response?.status != 409) {
          return null;
        } else {
          onProxy = false;
        }
      }
      await delay(2000);
    }
  }
  return null;
}

// (async () => {
//   const { idDaisySMS, phoneDaisySMS } = await rentPhoneDaisySMS("DG9DHgk0pTh5RJAwh1auz9TR2BjWFv");
//   console.log(idDaisySMS);
//   console.log(phoneDaisySMS);
// })()

module.exports = {
  getCaptchaResultNope,
  generatePassword,
  delay,
  splitArrayIntoChunks,
};