import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class ModernCardTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, w, h);

    // Main card background
    const cardMargin = 40;
    const cardRadius = 20;
    ctx.fillStyle = '#FFFFFF';
    this.roundedRect(ctx, cardMargin, cardMargin, w - (cardMargin * 2), h - (cardMargin * 2), cardRadius);

    // Accent bar
    ctx.fillStyle = primary;
    ctx.fillRect(cardMargin, cardMargin, w - (cardMargin * 2), 8);

    // Header section with background
    const headerHeight = 120;
    ctx.fillStyle = secondary;
    this.roundedRect(ctx, cardMargin + 20, cardMargin + 30, w - (cardMargin * 2) - 40, headerHeight, 12);

    // Header text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(crew.clubName, w / 2, cardMargin + 70);

    ctx.font = '24px Arial';
    ctx.fillText(crew.name, w / 2, cardMargin + 105);

    ctx.font = '18px Arial';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, cardMargin + 130);

    // Crew member cards
    const memberStartY = cardMargin + 180;
    const memberHeight = 50;
    const memberSpacing = 60;
    const membersPerRow = 2;
    const memberWidth = (w - (cardMargin * 2) - 60) / membersPerRow;

    crew.crewNames.forEach((name, index) => {
      const row = Math.floor(index / membersPerRow);
      const col = index % membersPerRow;
      const x = cardMargin + 30 + (col * (memberWidth + 30));
      const y = memberStartY + (row * memberSpacing);

      // Member card
      ctx.fillStyle = '#F1F5F9';
      this.roundedRect(ctx, x, y, memberWidth, memberHeight, 8);

      // Position badge
      const position = crew.boatType.seats === 8 ? 
        ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', '2', '3', 'Stroke'][index] :
        `${index + 1}`;

      ctx.fillStyle = primary;
      this.roundedRect(ctx, x + 10, y + 10, 40, 30, 4);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(position, x + 30, y + 30);

      // Name
      ctx.fillStyle = '#1E293B';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(name, x + 60, y + 30);
    });

    // Additional roles
    let additionalY = memberStartY + (Math.ceil(crew.crewNames.length / membersPerRow) * memberSpacing) + 20;

    if (crew.coxName) {
      ctx.fillStyle = '#EF4444';
      this.roundedRect(ctx, cardMargin + 30, additionalY, w - (cardMargin * 2) - 60, 40, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Cox: ${crew.coxName}`, w / 2, additionalY + 25);
      additionalY += 60;
    }

    if (crew.coachName) {
      ctx.fillStyle = '#10B981';
      this.roundedRect(ctx, cardMargin + 30, additionalY, w - (cardMargin * 2) - 60, 40, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Coach: ${crew.coachName}`, w / 2, additionalY + 25);
    }
  }

  private roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
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
    ctx.fill();
  }
}