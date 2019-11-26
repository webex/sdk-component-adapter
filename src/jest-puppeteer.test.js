import puppeteer from 'puppeteer';

describe('Jest-Puppeteer', () => {
  test('work properly', async () => {
    const url = 'http://localhost:4444/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);

    expect(bodyHTML).toContain('Hello World!');
    browser.close();
  });
});
