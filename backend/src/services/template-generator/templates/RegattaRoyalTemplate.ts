import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class RegattaRoyalTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Royal navy background with subtle texture
    const gradient = ctx.createRadialGradient(w / 2, h / 3, 0, w / 2, h / 3, Math.max(w, h));
    gradient.addColorStop(0, '#1E3A8A');
    gradient.addColorStop(0.6, primary);
    gradient.addColorStop(1, secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Royal crest background pattern
    this.drawRoyalPattern(ctx, w, h);

    // Regatta banner at top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    const bannerHeight = 80;
    this.drawRoyalBanner(ctx, 60, 40, w - 120, bannerHeight);

    // Crown decoration
    this.drawCrown(ctx, w / 2, 60);

    ctx.fillStyle = primary;
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROYAL REGATTA', w / 2, 100);

    // Royal club presentation
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px serif';
    ctx.fillText(crew.clubName, w / 2, 170);

    // Crew name with royal styling
    ctx.fillStyle = '#FFD700';
    ctx.font = '36px serif';
    ctx.fillText(crew.name, w / 2, 210);

    // Royal classification
    const classY = 240;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    this.drawRoyalShield(ctx, w / 2 - 100, classY, 200, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px serif';
    ctx.fillText(crew.boatType.name, w / 2, classY + 20);
    
    ctx.font = '18px serif';
    ctx.fillText(crew.raceName, w / 2, classY + 40);

    // Royal crew presentation
    const crewStartY = 320;
    const lineHeight = 32;

    // Formal presentation header
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px serif';
    ctx.fillText('CREW PRESENTATION', w / 2, crewStartY);

    // Royal divider
    this.drawRoyalDivider(ctx, w / 2, crewStartY + 15, 200);

    // Formal crew listing
    ctx.font = '20px serif';
    const leftX = w / 2 - 150;
    const rightX = w / 2 + 150;

    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['Bow', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', 'Two', 'Three', 'Stroke'][index] :
        `Position ${index + 1}`;

      const isLeft = index % 2 === 0;
      const x = isLeft ? leftX : rightX;
      const y = crewStartY + 50 + (Math.floor(index / 2) * lineHeight);

      // Royal position marker
      ctx.fillStyle = '#FFD700';
      this.drawRoyalMarker(ctx, x - (isLeft ? 80 : -80), y - 8);

      // Position title
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = isLeft ? 'left' : 'right';
      ctx.fillText(position, x - (isLeft ? 60 : -60), y - 5);

      // Crew member name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px serif';
      ctx.fillText(name, x, y + 10);
    });

    // Royal special roles
    let specialY = crewStartY + 50 + (Math.ceil(crew.crewNames.length / 2) * lineHeight) + 40;

    if (crew.coxName) {
      this.drawRoyalRole(ctx, w / 2, specialY, 'Royal Coxswain', crew.coxName);
      specialY += 50;
    }

    if (crew.coachName) {
      this.drawRoyalRole(ctx, w / 2, specialY, 'Head Coach', crew.coachName);
    }

    // Royal seal at bottom
    this.drawRoyalSeal(ctx, w / 2, h - 60);
  }

  private drawRoyalBanner(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.beginPath();
    // Main banner shape with curved ends
    ctx.moveTo(x + 20, y);
    ctx.lineTo(x + width - 20, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + 20);
    ctx.lineTo(x + width, y + height - 20);
    ctx.quadraticCurveTo(x + width, y + height, x + width - 20, y + height);
    ctx.lineTo(x + 20, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - 20);
    ctx.lineTo(x, y + 20);
    ctx.quadraticCurveTo(x, y, x + 20, y);
    ctx.closePath();
    ctx.fill();

    // Banner trim
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  private drawCrown(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    ctx.fillStyle = '#FFD700';
    
    // Crown base
    ctx.fillRect(centerX - 30, centerY + 10, 60, 8);
    
    // Crown points
    const points = [
      { x: centerX - 20, height: 15 },
      { x: centerX - 10, height: 20 },
      { x: centerX, height: 25 },
      { x: centerX + 10, height: 20 },
      { x: centerX + 20, height: 15 }
    ];
    
    points.forEach(point => {
      ctx.beginPath();
      ctx.moveTo(point.x - 4, centerY + 10);
      ctx.lineTo(point.x, centerY + 10 - point.height);
      ctx.lineTo(point.x + 4, centerY + 10);
      ctx.closePath();
      ctx.fill();
    });
    
    // Crown jewels
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 10, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  private drawRoyalShield(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + height / 3);
    ctx.lineTo(x + width, y + height * 2 / 3);
    ctx.quadraticCurveTo(x + width, y + height, x + width / 2, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height * 2 / 3);
    ctx.lineTo(x, y + height / 3);
    ctx.quadraticCurveTo(x, y, x + width / 2, y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawRoyalDivider(ctx: CanvasRenderingContext2D, centerX: number, y: number, width: number): void {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    // Main line
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, y);
    ctx.lineTo(centerX + width / 2, y);
    ctx.stroke();
    
    // Decorative elements
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 5; i++) {
      const x = centerX - 40 + (i * 20);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawRoyalMarker(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8, y + 4);
    ctx.lineTo(x + 6, y + 8);
    ctx.lineTo(x - 2, y + 4);
    ctx.closePath();
    ctx.fill();
  }

  private drawRoyalRole(ctx: CanvasRenderingContext2D, centerX: number, y: number, title: string, name: string): void {
    const frameWidth = 280;
    const frameHeight = 35;
    
    // Royal frame
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    this.drawRoyalShield(ctx, centerX - frameWidth / 2, y - frameHeight / 2, frameWidth, frameHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${title}: ${name}`, centerX, y + 5);
  }

  private drawRoyalSeal(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Outer circle
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner seal design
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cross pattern
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY);
    ctx.lineTo(centerX + 12, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();
  }

  private drawRoyalPattern(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.05)';
    
    // Fleur-de-lis pattern
    for (let x = 100; x < w; x += 200) {
      for (let y = 100; y < h; y += 150) {
        this.drawFleurDeLis(ctx, x, y);
      }
    }
  }

  private drawFleurDeLis(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
    
    // Central petal
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 10, 4, 12, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Side petals
    ctx.beginPath();
    ctx.ellipse(centerX - 8, centerY - 5, 4, 10, -Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(centerX + 8, centerY - 5, 4, 10, Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Base
    ctx.fillRect(centerX - 2, centerY + 2, 4, 8);
  }
}