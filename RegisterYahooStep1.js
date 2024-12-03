const RegisterYahooStep1 = async (thread, page, record) => {
  const [mail, firstName, lastName, birtdate] = record;
  try {
    await page.bringToFront();

    await page.goto('https://login.yahoo.com/account/create', { timeout: 30000 });

    await page.waitForSelector('#usernamereg-firstName');

    await page.waitFor(1000);

    await page.type('#usernamereg-firstName', firstName, { delay: 30 });

    await page.waitFor(500);

    await page.type('#usernamereg-lastName', lastName, { delay: 30 });

    await page.waitFor(500);

    let mailType = mail.includes("@") ? mail.split("@")?.[0] : mail;

    await page.type('#usernamereg-userId', mailType, { delay: 30 });

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

    await page.waitForSelector('#usernamereg-phone');

    return Promise.resolve([thread, mail, "pass"]);
  } catch (error) {
    console.log(error);
    return Promise.resolve([thread, mail, "fail"]);
  }

};
module.exports = RegisterYahooStep1;