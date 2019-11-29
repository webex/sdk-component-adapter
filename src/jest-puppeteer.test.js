import puppeteer from 'puppeteer';

describe('Jest-Puppeteer', () => {
  test('work properly', async () => {
    jest.setTimeout(50000);
    const url = 'http://localhost:1234/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);

    expect(bodyHTML).toContain('Meeting Sample');
    browser.close();
  });
});
