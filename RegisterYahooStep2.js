const promiseAny = require('promise.any');
const { getCodeDaisySMS } = require("./helper");

const RegisterYahooStep2 = async (thread, page, record) => {
  const [mail, keyDaisySms, phoneDaisySMS, idDaisySMS] = record;
  try {
    await page.bringToFront();

    await page.waitForSelector('#usernamereg-phone');

    await page.waitFor(1000);

    await page.type('#usernamereg-phone', phoneDaisySMS, { delay: 30 });

    await page.waitFor(1000);

    await page.click('#reg-sms-button');

    await promiseAny([
      page.waitForSelector('#recaptcha-iframe'),
      page.waitForSelector('#verification-code-field')
    ])

    await page.waitFor(1000);

    if (await page.$('#recaptcha-iframe')) {
      console.log("start...")
      const frames = await page.frames();
      console.log("frames..");
      console.log(frames);
      const iFrame1 = frames.find(f => f.name() === 'recaptcha-iframe');
      console.log(iFrame1);
      await iFrame1.waitForSelector('#recaptchaForm');
      await iFrame1.waitForSelector('#recaptchaForm #recaptcha-submit');
      await iFrame1.waitFor(1000);
      await page.waitFor(3000);
      console.log("giai captcha...");
      await page.solveRecaptchas();
      console.log("giai xong...");
      await iFrame1.waitFor(1000);
      await iFrame1.click('#recaptcha-submit');
    }
    console.log("ra ngoai");
    await page.waitForSelector('#verification-code-field');

    await page.waitFor(1000);

    for (let i = 0; i < 10; i++) {
      await page.waitFor(3000);
      code = await getCodeDaisySMS(keyDaisySms, idDaisySMS);
      if (code) {
        break;
      }
    }

    if (!code) {
      return Promise.resolve([thread, mail, "fail"]);
    }

    await page.type('#verification-code-field', `${code}`, { delay: 30 });

    await page.waitFor(1000);

    await page.click('#verify-code-button');

    await page.waitForSelector('#account-attributes-challenge-success');

    return Promise.resolve([thread, mail, "pass"]);
  } catch (error) {
    console.log(error);
    return Promise.resolve([thread, mail, "fail"]);
  }

};
module.exports = RegisterYahooStep2;