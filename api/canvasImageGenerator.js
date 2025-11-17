// Canvas-Based Image Generation (No Puppeteer needed!)
import { createCanvas } from 'canvas';

class CanvasImageGenerator {
  constructor() {
    this.levelBackgrounds = {
      "ASIA HIGH": { r: 249, g: 115, b: 22 }, // Orange
      "ASIA LOW": { r: 249, g: 115, b: 22 }, // Orange
      "ASIA H": { r: 249, g: 115, b: 22 }, // Orange  
      "ASIA L": { r: 249, g: 115, b: 22 }, // Orange
      "LONDON HIGH": { r: 239, g: 68, b: 68 }, // Red
      "LONDON LOW": { r: 239, g: 68, b: 68 }, // Red
      "LONDON H": { r: 239, g: 68, b: 68 }, // Red
      "LONDON L": { r: 239, g: 68, b: 68 }, // Red
      "PDH": { r: 107, g: 114, b: 128 }, // Grey
      "PDL": { r: 107, g: 114, b: 128 }, // Grey
      "PWH": { r: 16, g: 185, b: 129 }, // Green
      "PWL": { r: 16, g: 185, b: 129 }, // Green
    };
  }

  // Helper to draw rounded rectangle
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  async generateCardImage(alertData) {
    try {
      const { name, level, timestamp } = alertData;
      
      // Create canvas
      const width = 400;
      const height = 300;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Get background color for level
      const bgColor = this.levelBackgrounds[level.toUpperCase()] || { r: 30, g: 41, b: 59 };
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
      gradient.addColorStop(1, `rgb(${Math.max(0, bgColor.r - 30)}, ${Math.max(0, bgColor.g - 30)}, ${Math.max(0, bgColor.b - 30)})`);
      
      // Fill background with rounded corners
      ctx.fillStyle = gradient;
      this.drawRoundedRect(ctx, 0, 0, width, height, 20);
      ctx.fill();

      // Add subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      this.drawRoundedRect(ctx, 1, 1, width-2, height-2, 20);
      ctx.stroke();

      // NY Time (top left)
      const nyTime = this.getAlertNYTime(timestamp);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.drawRoundedRect(ctx, 16, 16, 120, 24, 6);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🕐 NY: ${nyTime}`, 24, 32);

      // Ticker Name (center)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(name, width / 2, 140);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Level Badge (center)
      const levelText = level.toUpperCase();
      ctx.font = 'bold 14px Arial, sans-serif';
      const levelMetrics = ctx.measureText(levelText);
      const levelWidth = levelMetrics.width + 40;
      const levelX = (width - levelWidth) / 2;
      const levelY = 170;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.drawRoundedRect(ctx, levelX, levelY, levelWidth, 32, 12);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      this.drawRoundedRect(ctx, levelX, levelY, levelWidth, 32, 12);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(levelText, width / 2, levelY + 21);

      // Live Signal (bottom center)
      const signalText = 'LIVE SIGNAL';
      ctx.font = 'bold 12px Arial, sans-serif';
      const signalMetrics = ctx.measureText(signalText);
      const signalWidth = signalMetrics.width + 32;
      const signalX = (width - signalWidth) / 2;
      const signalY = 240;

      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      this.drawRoundedRect(ctx, signalX, signalY, signalWidth, 28, 10);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      this.drawRoundedRect(ctx, signalX, signalY, signalWidth, 28, 10);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(signalText, width / 2, signalY + 18);

      // Convert canvas to buffer
      return canvas.toBuffer('image/png');
      
    } catch (error) {
      console.error('❌ Error generating canvas image:', error);
      throw error;
    }
  }

  getAlertNYTime(timestamp) {
    const alertDate = new Date(timestamp);
    const nyTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(alertDate);
    return nyTime;
  }
}

// Singleton instance
let canvasGenerator = null;

export const getCanvasGenerator = () => {
  if (!canvasGenerator) {
    canvasGenerator = new CanvasImageGenerator();
  }
  return canvasGenerator;
};

export const generateDiscordCardImage = async (alertData) => {
  const generator = getCanvasGenerator();
  return await generator.generateCardImage(alertData);
};
