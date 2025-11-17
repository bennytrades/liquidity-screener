// Serverless-Optimized Image Generation Service for Discord Cards
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateDiscordCardHTML } from './discordCardGenerator.js';

class DiscordImageGenerator {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      // Configure for serverless environment
      const options = {
        args: [
          ...chromium.args,
          '--hide-scrollbars',
          '--disable-web-security',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      };

      this.browser = await puppeteer.launch(options);
    }
  }

  async generateCardImage(alertData) {
    try {
      await this.initialize();
      
      const page = await this.browser.newPage();
      
      // Set viewport for consistent image size
      await page.setViewport({
        width: 400,
        height: 300,
        deviceScaleFactor: 2 // For high-quality images
      });

      // Generate the HTML for the card
      const cardHTML = generateDiscordCardHTML(alertData);
      
      // Set the HTML content
      await page.setContent(cardHTML, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      // Take screenshot of the card
      const imageBuffer = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 400,
          height: 300
        },
        omitBackground: false
      });

      await page.close();
      
      return imageBuffer;
    } catch (error) {
      console.error('❌ Error generating card image:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance for reuse
let imageGenerator = null;

export const getImageGenerator = () => {
  if (!imageGenerator) {
    imageGenerator = new DiscordImageGenerator();
  }
  return imageGenerator;
};

export const generateDiscordCardImage = async (alertData) => {
  const generator = getImageGenerator();
  return await generator.generateCardImage(alertData);
};
