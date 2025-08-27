import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class ElitePerformanceTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // High-performance gradient background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(0.3, primary);
    gradient.addColorStop(0.7, secondary);
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Dynamic geometric patterns
    this.drawGeometricPattern(ctx, w, h, 'rgba(255, 255, 255, 0.05)');

    // Elite header banner
    const headerHeight = 100;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 30, w, headerHeight);

    // Performance metrics bars (decorative)
    ctx.fillStyle = '#00FF41';
    ctx.fillRect(50, 45, w - 100, 4);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(50, 55, (w - 100) * 0.85, 4);
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(50, 65, (w - 100) * 0.75, 4);

    // Elite performance text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px "Arial Black", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ELITE PERFORMANCE', w / 2, 95);

    ctx.font = '20px Arial';
    ctx.fillText('CREW ANALYTICS', w / 2, 120);

    // Club identification
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px "Arial Black", Arial';
    ctx.fillText(crew.clubName.toUpperCase(), w / 2, 180);

    // Crew designation with tech styling
    ctx.fillStyle = '#00FF41';
    ctx.font = 'bold 32px "Arial Black", Arial';
    ctx.fillText(`CREW: ${crew.name.toUpperCase()}`, w / 2, 220);

    // Performance classification
    const classificationY = 250;
    ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
    ctx.fillRect(w / 2 - 120, classificationY, 240, 35);
    ctx.strokeStyle = '#00FF41';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 120, classificationY, 240, 35);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, classificationY + 23);

    // Advanced crew display with performance styling
    const crewDisplayY = 320;
    
    // Title bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(80, crewDisplayY - 10, w - 160, 30);
    ctx.fillStyle = '#00FF41';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('CREW LINEUP', 100, crewDisplayY + 8);

    // Performance grid
    const gridStartY = crewDisplayY + 40;
    const cellHeight = 35;
    const leftColX = w * 0.25;
    const rightColX = w * 0.75;

    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['BOW', '2', '3', '4', '5', '6', '7', 'STK'][index] :
        crew.boatType.seats === 4 ?
        ['BOW', '2', '3', 'STK'][index] :
        `${index + 1}`;

      const isLeft = index % 2 === 0;
      const x = isLeft ? leftColX : rightColX;
      const y = gridStartY + (Math.floor(index / 2) * cellHeight);

      // Performance cell background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      const cellWidth = 220;
      ctx.fillRect(x - cellWidth/2, y - 15, cellWidth, cellHeight - 5);

      // Position indicator
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - cellWidth/2 + 5, y - 10, 40, 20);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(position, x - cellWidth/2 + 25, y + 4);

      // Athlete name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(name.toUpperCase(), x - cellWidth/2 + 55, y);

      // Performance bars (decorative)
      const barWidth = 60;
      const barHeight = 3;
      const barX = x + cellWidth/2 - barWidth - 10;
      
      ctx.fillStyle = '#00FF41';
      ctx.fillRect(barX, y + 5, barWidth * (0.7 + Math.random() * 0.3), barHeight);
    });

    // Elite roles section
    let eliteRoleY = gridStartY + (Math.ceil(crew.crewNames.length / 2) * cellHeight) + 40;

    if (crew.coxName) {
      this.drawEliteRole(ctx, w / 2, eliteRoleY, 'COXSWAIN', crew.coxName, '#FF4444');
      eliteRoleY += 50;
    }

    if (crew.coachName) {
      this.drawEliteRole(ctx, w / 2, eliteRoleY, 'HEAD COACH', crew.coachName, '#00FF41');
    }

    // Performance footer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, h - 60, w, 60);

    ctx.fillStyle = '#00FF41';
    ctx.font = 'bold 16px "Arial Black", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MAXIMUM PERFORMANCE • ELITE EXCELLENCE • CHAMPIONSHIP READY', w / 2, h - 30);

    // Tech grid overlay
    this.drawTechGrid(ctx, w, h);
  }

  private drawEliteRole(ctx: CanvasRenderingContext2D, centerX: number, y: number, role: string, name: string, color: string): void {
    const frameWidth = 300;
    const frameHeight = 35;
    
    // Role frame
    ctx.fillStyle = `${color}33`;
    ctx.fillRect(centerX - frameWidth/2, y - frameHeight/2, frameWidth, frameHeight);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - frameWidth/2, y - frameHeight/2, frameWidth, frameHeight);

    // Role badge
    ctx.fillStyle = color;
    ctx.fillRect(centerX - frameWidth/2 + 5, y - frameHeight/2 + 5, 80, frameHeight - 10);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(role, centerX - frameWidth/2 + 45, y + 4);

    // Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(name.toUpperCase(), centerX - frameWidth/2 + 100, y + 4);
  }

  private drawGeometricPattern(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Diagonal grid pattern
    const spacing = 50;
    for (let i = -h; i < w + h; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
  }

  private drawTechGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Corner indicators
    const cornerSize = 20;
    ctx.strokeStyle = '#00FF41';
    ctx.lineWidth = 2;
    
    // Top corners
    [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x - cornerSize, y);
      ctx.lineTo(x + cornerSize, y);
      ctx.moveTo(x, y - cornerSize);
      ctx.lineTo(x, y + cornerSize);
      ctx.stroke();
    });
  }
}