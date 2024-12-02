const RegisterYahoo = async (page, record) => {
  const [mail, phone, firstName, lastName, birtdate] = record;
  try {
    await page.bringToFront();

    await page.goto('https://login.yahoo.com/account/create', { timeout: 30000 });

    await page.waitForSelector('#usernamereg-firstName');

    await page.waitFor(1000);

    await page.type('#usernamereg-firstName', firstName, { delay: 30 });

    await page.waitFor(500);

    await page.type('#usernamereg-lastName', lastName, { delay: 30 });

    await page.waitFor(500);

    await page.type('#usernamereg-userId', mail, { delay: 30 });

    await page.waitFor(500);

    await page.type('#usernamereg-password', "3630045.Zxcv@", { delay: 30 });

    await page.waitFor(500);

    const [year, month, day] = birtdate.split("-");

    await page.select("#usernamereg-month", `${month}`);

    await page.waitFor(500);

    await page.type('#usernamereg-day', `${day}`, { delay: 30 });

    await page.waitFor(500);

    await page.type('#usernamereg-year', `${year}`, { delay: 30 });

    await page.waitFor(1000);

    await page.click('#reg-submit-button');

    return Promise.resolve([mail, phone, "pass"]);
  } catch (error) {
    console.log(error);
    return Promise.resolve([mail, phone, "fail"]);
  }

};
module.exports = RegisterYahoo;