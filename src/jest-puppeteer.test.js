import puppeteer from 'puppeteer';

describe('Jest-Puppeteer', () => {
  test('work properly', async () => {
    const url = 'http://localhost:1234/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    const h1 = await page.evaluate(() => document.getElementById('page-title').textContent);

    expect(h1.trim()).toEqual('Meeting Integration Tests Sample');
    browser.close();
  });
});
