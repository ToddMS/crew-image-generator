import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class VintageClassicTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Vintage paper background
    ctx.fillStyle = '#F5F1E8';
    ctx.fillRect(0, 0, w, h);

    // Add paper texture with subtle noise
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const opacity = Math.random() * 0.1;
      ctx.fillStyle = `rgba(139, 125, 107, ${opacity})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Ornate border frame
    this.drawVintageBorder(ctx, w, h, primary);

    // Vintage header with decorative elements
    ctx.fillStyle = secondary;
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROWING CLUB', w / 2, 80);

    // Decorative line
    this.drawDecorativeLine(ctx, w / 2, 95, 150, primary);

    // Club name in elegant serif
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 40px serif';
    ctx.fillText(crew.clubName, w / 2, 140);

    // Vintage crew name banner
    const bannerY = 170;
    const bannerHeight = 50;
    ctx.fillStyle = primary;
    this.drawBanner(ctx, w / 2 - 200, bannerY, 400, bannerHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px serif';
    ctx.fillText(crew.name, w / 2, bannerY + 32);

    // Boat class and race in vintage style
    ctx.fillStyle = secondary;
    ctx.font = '20px serif';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, 250);

    // Decorative divider
    this.drawDecorativeDivider(ctx, w / 2, 270, 200, primary);

    // Crew lineup in formal list style
    const crewStartY = 320;
    const lineHeight = 30;

    ctx.fillStyle = '#2C1810';
    ctx.font = '18px serif';
    ctx.textAlign = 'left';

    const listStartX = w / 2 - 150;

    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', '2', '3', 'Stroke'][index] :
        `${index + 1}`;

      const y = crewStartY + (index * lineHeight);

      // Vintage position marker
      ctx.fillStyle = primary;
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${position}:`, listStartX + 60, y);

      // Name
      ctx.fillStyle = '#2C1810';
      ctx.font = '18px serif';
      ctx.textAlign = 'left';
      ctx.fillText(name, listStartX + 80, y);

      // Vintage dots
      ctx.fillStyle = secondary;
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      if (index < crew.crewNames.length - 1) {
        for (let dot = 0; dot < 5; dot++) {
          ctx.fillText('•', w / 2 + 120 + (dot * 15), y - 5);
        }
      }
    });

    // Special roles in ornate frames
    let specialY = crewStartY + (crew.crewNames.length * lineHeight) + 30;

    if (crew.coxName) {
      this.drawVintageFrame(ctx, w / 2 - 140, specialY - 20, 280, 35, primary);
      ctx.fillStyle = '#2C1810';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Coxswain: ${crew.coxName}`, w / 2, specialY);
      specialY += 50;
    }

    if (crew.coachName) {
      this.drawVintageFrame(ctx, w / 2 - 140, specialY - 20, 280, 35, primary);
      ctx.fillStyle = '#2C1810';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Coach: ${crew.coachName}`, w / 2, specialY);
    }

    // Vintage footer flourish
    this.drawVintageFlourish(ctx, w / 2, h - 60, primary);
  }

  private drawVintageBorder(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Corner decorations
    const cornerSize = 30;
    ctx.lineWidth = 3;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(30, 30 + cornerSize);
    ctx.lineTo(30 + cornerSize, 30);
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(w - 30 - cornerSize, 30);
    ctx.lineTo(w - 30, 30 + cornerSize);
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(30, h - 30 - cornerSize);
    ctx.lineTo(30 + cornerSize, h - 30);
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(w - 30 - cornerSize, h - 30);
    ctx.lineTo(w - 30, h - 30 - cornerSize);
    ctx.stroke();
  }

  private drawDecorativeLine(ctx: CanvasRenderingContext2D, centerX: number, y: number, width: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const halfWidth = width / 2;
    
    // Main line
    ctx.beginPath();
    ctx.moveTo(centerX - halfWidth, y);
    ctx.lineTo(centerX + halfWidth, y);
    ctx.stroke();
    
    // Decorative ends
    ctx.beginPath();
    ctx.arc(centerX - halfWidth, y, 4, 0, 2 * Math.PI);
    ctx.arc(centerX + halfWidth, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  private drawBanner(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width - 20, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width - 20, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + 20, y + height / 2);
    ctx.closePath();
    ctx.fill();
  }

  private drawDecorativeDivider(ctx: CanvasRenderingContext2D, centerX: number, y: number, width: number, color: string): void {
    ctx.fillStyle = color;
    
    // Center ornament
    ctx.beginPath();
    ctx.arc(centerX, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Side flourishes
    const sideWidth = (width - 20) / 2;
    
    for (let i = 1; i <= 3; i++) {
      const offset = i * 15;
      const size = 4 - i;
      
      ctx.beginPath();
      ctx.arc(centerX - offset, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX + offset, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawVintageFrame(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Inner decorative line
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);
    
    // Corner decorations
    const cornerOffset = 8;
    ctx.lineWidth = 2;
    
    [[x, y], [x + width, y], [x, y + height], [x + width, y + height]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + (cx === x ? cornerOffset : -cornerOffset), cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + (cy === y ? cornerOffset : -cornerOffset));
      ctx.stroke();
    });
  }

  private drawVintageFlourish(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Central stem
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY + 15);
    ctx.stroke();
    
    // Curved flourishes
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY, 15, 0, Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX + 20, centerY, 15, 0, Math.PI);
    ctx.stroke();
  }
}