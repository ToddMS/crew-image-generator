import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class RaceDayTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Dynamic background with racing stripes
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, w, h);

    // Racing stripes
    ctx.fillStyle = secondary;
    const stripeWidth = 40;
    for (let i = 0; i < w + h; i += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(i - h, 0);
      ctx.lineTo(i, h);
      ctx.lineTo(i + stripeWidth, h);
      ctx.lineTo(i + stripeWidth - h, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Semi-transparent overlay for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Bold header banner
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 60, w, 100);

    ctx.fillStyle = primary;
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RACE DAY', w / 2, 100);

    ctx.font = 'bold 32px Arial';
    ctx.fillText(crew.raceName.toUpperCase(), w / 2, 140);

    // Team info section
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(crew.clubName, w / 2, 220);

    ctx.font = '36px Arial';
    ctx.fillText(crew.name, w / 2, 270);

    ctx.font = '24px Arial';
    ctx.fillText(crew.boatType.name, w / 2, 310);

    // Dynamic crew display
    const crewStartY = 370;
    const leftColumnX = w * 0.25;
    const rightColumnX = w * 0.75;

    ctx.font = 'bold 32px Arial';
    ctx.fillText('CREW LINEUP', w / 2, crewStartY);

    // Split crew into two columns for better visual balance
    ctx.font = '24px Arial';
    const halfwayPoint = Math.ceil(crew.crewNames.length / 2);

    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', '2', '3', 'Stroke'][index] :
        `${index + 1}`;

      const isLeftColumn = index < halfwayPoint;
      const columnIndex = isLeftColumn ? index : index - halfwayPoint;
      const x = isLeftColumn ? leftColumnX : rightColumnX;
      const y = crewStartY + 50 + (columnIndex * 40);

      ctx.textAlign = 'center';
      ctx.fillText(`${position}: ${name}`, x, y);
    });

    // Special roles in prominent boxes
    let specialRoleY = crewStartY + 50 + (halfwayPoint * 40) + 40;

    if (crew.coxName) {
      // Cox box
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fillRect(w / 2 - 150, specialRoleY - 20, 300, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`COX: ${crew.coxName.toUpperCase()}`, w / 2, specialRoleY + 5);
      specialRoleY += 60;
    }

    if (crew.coachName) {
      // Coach box
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.fillRect(w / 2 - 150, specialRoleY - 20, 300, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`COACH: ${crew.coachName.toUpperCase()}`, w / 2, specialRoleY + 5);
    }

    // Bottom banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, h - 80, w, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('READY • SET • ROW', w / 2, h - 35);
  }
}