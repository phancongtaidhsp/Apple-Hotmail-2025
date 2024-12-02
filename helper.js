const Captcha = require("2captcha");
const { faker } = require('@faker-js/faker');

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

const getCaptchaData = (keyCaptcha) => {
  return new Promise((resolve) => {
    // A new 'solver' instance with our API key
    const solver = new Captcha.Solver(keyCaptcha)
    /* Example ReCaptcha Website */
    solver.recaptcha("6LdtoG0bAAAAAND2osbT1eeD4iiwefdt5pP42WyA", "https://signup.mail.com/#.7518-header-signup1-1").then((res) => {
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
  refundCaptcha
};