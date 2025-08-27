import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class HennessyPosterTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Henley poster-style background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.3, primary);
    gradient.addColorStop(0.7, secondary);
    gradient.addColorStop(1, '#2F4F4F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // River water effect
    this.drawWaterEffect(ctx, w, h);

    // Classic Henley header banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    const headerHeight = 120;
    this.drawHenleyBanner(ctx, 40, 30, w - 80, headerHeight);

    // Henley Royal Regatta styling
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 28px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('HENLEY ROYAL REGATTA', w / 2, 70);

    ctx.fillStyle = '#2F4F4F';
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillText('THE THAMES • OXFORDSHIRE', w / 2, 95);

    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.fillText('Founded 1839', w / 2, 115);

    // Traditional regatta divider
    this.drawRegattaDivider(ctx, w / 2, 140, 200);

    // Club presentation in traditional style
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px "Times New Roman", serif';
    ctx.fillText(crew.clubName, w / 2, 200);

    // Crew name with regatta styling
    ctx.fillStyle = '#FFD700';
    ctx.font = '36px "Times New Roman", serif';
    ctx.fillText(crew.name, w / 2, 245);

    // Event classification
    const eventY = 275;
    ctx.fillStyle = 'rgba(139, 0, 0, 0.8)';
    this.drawEventBanner(ctx, w / 2 - 150, eventY, 300, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Times New Roman", serif';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, eventY + 25);

    // Traditional Thames-style crew presentation
    const crewStartY = 340;
    const lineHeight = 30;

    // Regatta-style header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Times New Roman", serif';
    ctx.fillText('CREW COMPOSITION', w / 2, crewStartY);

    // Traditional rowing positions
    const henleyPositions = crew.boatType.seats === 8 ? 
      ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'] :
      crew.boatType.seats === 4 ?
      ['Bow', '2', '3', 'Stroke'] :
      null;

    // Two-column traditional layout
    const leftColumnX = w / 2 - 100;
    const rightColumnX = w / 2 + 100;

    ctx.font = '20px "Times New Roman", serif';

    crew.crewNames.forEach((name, index) => {
      const position = henleyPositions ? 
        henleyPositions[index] :
        `${index + 1}`;

      const isLeft = index % 2 === 0;
      const x = isLeft ? leftColumnX : rightColumnX;
      const y = crewStartY + 50 + (Math.floor(index / 2) * lineHeight);

      // Traditional position styling
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 18px "Times New Roman", serif';
      ctx.textAlign = isLeft ? 'right' : 'left';
      ctx.fillText(`${position}:`, x + (isLeft ? -20 : 20), y);

      // Crew member name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px "Times New Roman", serif';
      ctx.textAlign = isLeft ? 'left' : 'right';
      ctx.fillText(name, x, y);

      // Traditional Thames decorations
      if (index < crew.crewNames.length - 1) {
        ctx.fillStyle = '#87CEEB';
        ctx.font = '16px "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.fillText('~', w / 2, y + 15);
      }
    });

    // Special regatta roles
    let regattaRoleY = crewStartY + 50 + (Math.ceil(crew.crewNames.length / 2) * lineHeight) + 40;

    if (crew.coxName) {
      this.drawRegattaRole(ctx, w / 2, regattaRoleY, 'Coxswain', crew.coxName);
      regattaRoleY += 45;
    }

    if (crew.coachName) {
      this.drawRegattaRole(ctx, w / 2, regattaRoleY, 'Coach', crew.coachName);
    }

    // Thames river representation at bottom
    this.drawThamesRiver(ctx, w, h - 100);

    // Traditional Henley footer
    ctx.fillStyle = 'rgba(47, 79, 79, 0.9)';
    ctx.fillRect(0, h - 60, w, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('HENLEY-ON-THAMES • OXFORDSHIRE • ENGLAND', w / 2, h - 35);

    ctx.font = 'italic 14px "Times New Roman", serif';
    ctx.fillText('"The Home of Rowing"', w / 2, h - 15);

    // Traditional regatta emblems
    this.drawRegattaEmblems(ctx, w);
  }

  private drawWaterEffect(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // River water ripple effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      
      for (let x = 0; x <= w; x += 20) {
        const waveY = y + Math.sin((x + y) * 0.01) * 5;
        ctx.lineTo(x, waveY);
      }
      
      ctx.lineTo(w, y + 10);
      
      for (let x = w; x >= 0; x -= 20) {
        const waveY = y + 10 + Math.sin((x + y + 100) * 0.01) * 3;
        ctx.lineTo(x, waveY);
      }
      
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawHenleyBanner(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    // Traditional banner with curved corners
    ctx.beginPath();
    ctx.moveTo(x + 15, y);
    ctx.lineTo(x + width - 15, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + 15);
    ctx.lineTo(x + width, y + height - 15);
    ctx.quadraticCurveTo(x + width, y + height, x + width - 15, y + height);
    ctx.lineTo(x + 15, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - 15);
    ctx.lineTo(x, y + 15);
    ctx.quadraticCurveTo(x, y, x + 15, y);
    ctx.closePath();
    ctx.fill();

    // Traditional border
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  private drawRegattaDivider(ctx: CanvasRenderingContext2D, centerX: number, y: number, width: number): void {
    // Traditional regatta divider with oars
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    
    // Main divider line
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, y);
    ctx.lineTo(centerX + width / 2, y);
    ctx.stroke();
    
    // Crossed oars in center
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Left oar
    ctx.moveTo(centerX - 20, y - 10);
    ctx.lineTo(centerX - 5, y + 10);
    // Right oar
    ctx.moveTo(centerX + 5, y - 10);
    ctx.lineTo(centerX + 20, y + 10);
    ctx.stroke();
    
    // Oar blades
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(centerX - 20, y - 10, 4, 8, -Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 20, y - 10, 4, 8, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  private drawEventBanner(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    // Traditional event banner shape
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + 15, y);
    ctx.lineTo(x + width - 15, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width - 15, y + height);
    ctx.lineTo(x + 15, y + height);
    ctx.closePath();
    ctx.fill();

    // Banner trim
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawRegattaRole(ctx: CanvasRenderingContext2D, centerX: number, y: number, title: string, name: string): void {
    // Traditional role presentation
    const frameWidth = 280;
    const frameHeight = 35;
    
    // Role frame
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(centerX - frameWidth / 2, y - frameHeight / 2, frameWidth, frameHeight);
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - frameWidth / 2, y - frameHeight / 2, frameWidth, frameHeight);

    // Role text
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 18px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${title}: ${name}`, centerX, y + 5);
  }

  private drawThamesRiver(ctx: CanvasRenderingContext2D, w: number, riverY: number): void {
    // Thames river representation
    ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
    
    // Flowing river shape
    ctx.beginPath();
    ctx.moveTo(0, riverY);
    
    for (let x = 0; x <= w; x += 10) {
      const y = riverY + Math.sin(x * 0.02) * 10;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(w, riverY + 40);
    ctx.lineTo(0, riverY + 40);
    ctx.closePath();
    ctx.fill();
    
    // River reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.ellipse(x, riverY + 20, 15, 3, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawRegattaEmblems(ctx: CanvasRenderingContext2D, w: number): void {
    // Traditional regatta emblems in corners
    const emblemSize = 30;
    
    // Left emblem - Lion
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('♔', emblemSize + 20, emblemSize + 45);
    
    // Right emblem - Crown
    ctx.fillText('♚', w - emblemSize - 20, emblemSize + 45);
    
    // Emblem borders
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 30, emblemSize * 2, emblemSize * 2);
    ctx.strokeRect(w - 20 - emblemSize * 2, 30, emblemSize * 2, emblemSize * 2);
  }
}