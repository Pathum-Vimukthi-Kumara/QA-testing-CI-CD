

import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';


describe('Driving License Tracker UI Tests', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    const options = new chrome.Options();
    options.setChromeBinaryPath('D:/QA/chrome-win64/chrome-win64/chrome.exe');
  const service = new ServiceBuilder('D:/QA/chromedriver-win64/chromedriver-win64/chromedriver.exe');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('should login with valid credentials', async () => {
  await driver.get('http://localhost:3000/login');
  await driver.findElement(By.css('[placeholder="Enter your email"]')).sendKeys('netadmin@admin.com');
    await driver.findElement(By.css('[placeholder="Enter your password"]')).sendKeys('Password01G');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('dashboard'), 5000);
  const url = await driver.getCurrentUrl();
  expect(url).to.include('dashboard');
  });

  it('should register a new user', async () => {
  await driver.get('http://localhost:3000/register');
  await driver.findElement(By.css('[placeholder="Enter your full name"]')).sendKeys('New User');
  await driver.findElement(By.css('[placeholder="Enter your email"]')).sendKeys('newuser' + Date.now() + '@example.com');
  await driver.findElement(By.css('[placeholder="Enter your phone number"]')).sendKeys('1234567890');
  await driver.findElement(By.css('[placeholder="Enter your license number"]')).sendKeys('DL1234567');
  await driver.findElement(By.css('input[type="date"]')).sendKeys('1990-01-01');
  await driver.findElement(By.css('[placeholder="Enter your address"]')).sendKeys('123 Main St');
  await driver.findElement(By.css('[placeholder="Create a password"]')).sendKeys('newpassword');
  await driver.findElement(By.css('[placeholder="Confirm your password"]')).sendKeys('newpassword');
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
    await driver.sleep(500); 
    await submitBtn.click();
  // After registration, click the Sign In button
  const signInBtn = await driver.findElement(By.css('button[type="submit"],button.btn-primary'));
  await driver.executeScript('arguments[0].scrollIntoView(true);', signInBtn);
  await driver.sleep(500);
  await signInBtn.click();
  // Optionally, wait for login page or dashboard
  // await driver.wait(until.urlContains('login'), 5000);
  });
});