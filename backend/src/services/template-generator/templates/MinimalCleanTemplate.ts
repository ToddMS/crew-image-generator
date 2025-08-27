import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class MinimalCleanTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Subtle accent line at top
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, w, 6);

    // Header - clean and minimal
    ctx.fillStyle = '#1F2937';
    ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(crew.clubName, w / 2, 80);

    ctx.fillStyle = primary;
    ctx.font = '28px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(crew.name, w / 2, 120);

    // Boat type and race - subtle
    ctx.fillStyle = '#6B7280';
    ctx.font = '20px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, 160);

    // Clean divider line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 100, 180);
    ctx.lineTo(w / 2 + 100, 180);
    ctx.stroke();

    // Crew lineup - clean list format
    const lineupStartY = 220;
    const lineHeight = 35;
    
    ctx.fillStyle = '#374151';
    ctx.font = '22px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'left';

    const centerX = w / 2;
    const maxWidth = 400;
    const startX = centerX - (maxWidth / 2);

    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', '2', '3', 'Stroke'][index] :
        `${index + 1}`;

      const y = lineupStartY + (index * lineHeight);

      // Position number/name
      ctx.fillStyle = primary;
      ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(position, startX + 60, y);

      // Name
      ctx.fillStyle = '#374151';
      ctx.font = '22px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(name, startX + 80, y);

      // Subtle divider dots
      ctx.fillStyle = '#D1D5DB';
      ctx.font = '16px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'center';
      if (index < crew.crewNames.length - 1) {
        ctx.fillText('•', centerX, y + 17);
      }
    });

    // Special roles - clean placement
    let specialY = lineupStartY + (crew.crewNames.length * lineHeight) + 30;

    if (crew.coxName) {
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Cox', startX + 60, specialY);

      ctx.fillStyle = '#374151';
      ctx.font = '22px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(crew.coxName, startX + 80, specialY);

      specialY += lineHeight;
    }

    if (crew.coachName) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Coach', startX + 60, specialY);

      ctx.fillStyle = '#374151';
      ctx.font = '22px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(crew.coachName, startX + 80, specialY);
    }

    // Bottom accent
    ctx.fillStyle = primary;
    ctx.fillRect(w / 2 - 50, h - 20, 100, 3);
  }
}