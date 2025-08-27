import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class ChampionshipGoldTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Luxurious golden gradient background
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
    gradient.addColorStop(0, '#FDF4C4');
    gradient.addColorStop(0.3, primary);
    gradient.addColorStop(1, secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Championship banner at top
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 40, w, 120);

    // Gold accent borders
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 40, w, 8);
    ctx.fillRect(0, 152, w, 8);

    // Championship text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHAMPIONSHIP', w / 2, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px serif';
    ctx.fillText(crew.raceName.toUpperCase(), w / 2, 115);

    ctx.font = '20px serif';
    ctx.fillText('REPRESENTING', w / 2, 145);

    // Club name in prestigious style
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px serif';
    ctx.fillText(crew.clubName, w / 2, 210);

    // Crew name with golden accent
    ctx.fillStyle = '#FFD700';
    ctx.font = '32px serif';
    ctx.fillText(crew.name, w / 2, 250);

    // Boat class badge
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(w / 2 - 60, 270, 120, 40);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 60, 270, 120, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px serif';
    ctx.fillText(crew.boatType.name, w / 2, 295);

    // Elegant crew display
    const crewStartY = 350;
    const lineHeight = 32;

    // Left and right columns for visual balance
    const leftX = w * 0.3;
    const rightX = w * 0.7;

    ctx.font = '22px serif';
    
    crew.crewNames.forEach((name, index) => {
      const position = crew.boatType.seats === 8 ? 
        ['Bow', '2', '3', '4', '5', '6', '7', 'Stroke'][index] :
        crew.boatType.seats === 4 ?
        ['Bow', '2', '3', 'Stroke'][index] :
        `${index + 1}`;

      const isLeft = index % 2 === 0;
      const x = isLeft ? leftX : rightX;
      const y = crewStartY + (Math.floor(index / 2) * lineHeight);

      // Golden position marker
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x - 20, y - 8, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px serif';
      ctx.textAlign = 'center';
      ctx.fillText(position, x - 20, y - 3);

      // Name in elegant white
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px serif';
      ctx.textAlign = isLeft ? 'left' : 'right';
      ctx.fillText(name, isLeft ? x : x, y);
    });

    // Special roles in gold frames
    let specialY = crewStartY + (Math.ceil(crew.crewNames.length / 2) * lineHeight) + 40;

    if (crew.coxName) {
      this.drawGoldFrame(ctx, w / 2 - 120, specialY - 25, 240, 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Cox: ${crew.coxName}`, w / 2, specialY - 5);
      specialY += 50;
    }

    if (crew.coachName) {
      this.drawGoldFrame(ctx, w / 2 - 120, specialY - 25, 240, 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Coach: ${crew.coachName}`, w / 2, specialY - 5);
    }

    // Championship laurels decoration
    this.drawLaurels(ctx, w / 2, h - 80);
  }

  private drawGoldFrame(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  private drawLaurels(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    // Left laurel branch
    ctx.beginPath();
    ctx.arc(centerX - 40, centerY, 30, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Right laurel branch  
    ctx.beginPath();
    ctx.arc(centerX + 40, centerY, 30, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Leaves
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 0.8 / 5) * i + 0.2;
      const leafX = centerX - 40 + Math.cos(angle) * 30;
      const leafY = centerY - Math.sin(angle) * 30;
      
      ctx.beginPath();
      ctx.ellipse(leafX, leafY, 4, 2, angle + Math.PI / 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      
      // Right side leaves
      const leafX2 = centerX + 40 - Math.cos(angle) * 30;
      const leafY2 = centerY - Math.sin(angle) * 30;
      
      ctx.beginPath();
      ctx.ellipse(leafX2, leafY2, 4, 2, -angle + Math.PI / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}