import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class ClassicLineupTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(1, secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Header section
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(crew.clubName, w / 2, 80);

    ctx.font = '32px Arial';
    ctx.fillText(crew.name, w / 2, 130);

    // Boat type and race info
    ctx.font = '24px Arial';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, 170);

    // Crew lineup section
    const startY = 220;
    const lineHeight = 45;
    ctx.font = '28px Arial';
    ctx.textAlign = 'left';

    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', '2', '3', 'Stroke'][index] :
        `${index + 1}`;

      ctx.fillText(`${position}: ${name}`, 100, startY + (index * lineHeight));
    });

    // Cox if present
    if (crew.coxName) {
      ctx.fillText(`Cox: ${crew.coxName}`, 100, startY + (crew.crewNames.length * lineHeight));
    }

    // Coach if present
    if (crew.coachName) {
      ctx.fillText(`Coach: ${crew.coachName}`, 100, startY + ((crew.crewNames.length + (crew.coxName ? 1 : 0)) * lineHeight));
    }

    // Decorative elements
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 190);
    ctx.lineTo(w - 80, 190);
    ctx.stroke();
  }
}