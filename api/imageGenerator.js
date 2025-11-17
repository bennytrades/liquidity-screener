// Image Generation Service for Discord Cards
import puppeteer from 'puppeteer';
import { generateDiscordCardHTML } from './discordCardGenerator.js';

class DiscordImageGenerator {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
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
        waitUntil: 'networkidle0'
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
