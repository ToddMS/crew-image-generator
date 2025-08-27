import { TemplateComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';
import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../../types/crew.types.js';

export class OxbridgeHeraldTemplate implements TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, config: { dimensions: CanvasDimensions; colors: ColorScheme }): void {
    const { width: w, height: h } = config.dimensions;
    const { primary, secondary } = config.colors;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Academic parchment background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#FDF6E3');
    gradient.addColorStop(0.5, '#F7F3E9');
    gradient.addColorStop(1, '#EDE4D3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Parchment aging effect
    this.drawParchmentTexture(ctx, w, h);

    // Academic heraldic border
    this.drawHeraldricBorder(ctx, w, h, primary);

    // University crest area
    ctx.fillStyle = primary;
    this.drawHeraldricShield(ctx, w / 2 - 80, 50, 160, 120);

    // Academic title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('UNIVERSITAS', w / 2, 90);
    ctx.font = 'bold 16px "Times New Roman", serif';
    ctx.fillText('REGIUM COLLEGIUM', w / 2, 110);
    ctx.font = '14px "Times New Roman", serif';
    ctx.fillText('ROWING CLUB', w / 2, 130);

    // Formal Latin motto
    ctx.fillStyle = secondary;
    ctx.font = 'italic 18px "Times New Roman", serif';
    ctx.fillText('Per Mare Per Terram', w / 2, 155);

    // Academic divider
    this.drawAcademicDivider(ctx, w / 2, 175, 200, primary);

    // Club name in formal academic style
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 42px "Times New Roman", serif';
    ctx.fillText(crew.clubName, w / 2, 220);

    // Crew designation with academic honors
    ctx.fillStyle = primary;
    ctx.font = '28px "Times New Roman", serif';
    ctx.fillText(`The ${crew.name}`, w / 2, 260);

    // Academic classification
    ctx.fillStyle = secondary;
    ctx.font = '22px "Times New Roman", serif';
    ctx.fillText(`${crew.boatType.name} • ${crew.raceName}`, w / 2, 290);

    // Formal crew presentation
    const crewStartY = 340;
    const lineHeight = 28;

    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.fillText('COLLEGIUM REMIGUM', w / 2, crewStartY);

    // Academic crew listing with Latin positions
    const latinPositions = crew.boatType.seats === 8 ? 
      ['Prora', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Sextus', 'Septimus', 'Primus'] :
      crew.boatType.seats === 4 ?
      ['Prora', 'Secundus', 'Tertius', 'Primus'] :
      null;

    ctx.font = '18px "Times New Roman", serif';
    ctx.textAlign = 'left';

    const listStartX = w / 2 - 180;
    const numberStartX = w / 2 - 200;

    crew.crewNames.forEach((name, index) => {
      const position = latinPositions ? 
        latinPositions[index] :
        `Remex ${index + 1}`;

      const y = crewStartY + 40 + (index * lineHeight);

      // Academic position numbering
      ctx.fillStyle = primary;
      ctx.font = 'bold 16px "Times New Roman", serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${index + 1}.`, numberStartX, y);

      // Latin position title
      ctx.fillStyle = secondary;
      ctx.font = 'italic 16px "Times New Roman", serif';
      ctx.textAlign = 'left';
      ctx.fillText(position, listStartX, y);

      // Crew member name
      ctx.fillStyle = '#2C1810';
      ctx.font = '18px "Times New Roman", serif';
      ctx.fillText(name, listStartX + 80, y);

      // Academic flourishes
      ctx.fillStyle = primary;
      ctx.font = '12px "Times New Roman", serif';
      ctx.textAlign = 'center';
      if (index < crew.crewNames.length - 1) {
        ctx.fillText('⁂', w / 2 + 150, y - 8);
      }
    });

    // Special academic roles
    let academicRoleY = crewStartY + 40 + (crew.crewNames.length * lineHeight) + 30;

    if (crew.coxName) {
      this.drawAcademicRole(ctx, w / 2, academicRoleY, 'Gubernator', crew.coxName, primary);
      academicRoleY += 40;
    }

    if (crew.coachName) {
      this.drawAcademicRole(ctx, w / 2, academicRoleY, 'Magister', crew.coachName, secondary);
    }

    // Academic seal and date
    this.drawAcademicSeal(ctx, w / 2, h - 80, primary);

    // Latin inscription at bottom
    ctx.fillStyle = '#6B7280';
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Anno Domini MMXXIV • Pro Gloria Et Honore', w / 2, h - 30);
  }

  private drawParchmentTexture(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Age spots and stains
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.1;
      
      ctx.fillStyle = `rgba(139, 125, 107, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Paper grain
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const opacity = Math.random() * 0.05;
      
      ctx.fillStyle = `rgba(160, 142, 120, ${opacity})`;
      ctx.fillRect(x, y, 1, Math.random() * 5 + 1);
    }
  }

  private drawHeraldricBorder(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    
    // Outer border
    ctx.strokeRect(30, 30, w - 60, h - 60);
    
    // Inner decorative border
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, w - 90, h - 90);
    
    // Corner heraldic decorations
    const cornerSize = 25;
    ctx.lineWidth = 3;
    
    // Heraldic corner flourishes
    const corners = [
      [45, 45], [w - 45, 45], [45, h - 45], [w - 45, h - 45]
    ];
    
    corners.forEach(([x, y]) => {
      this.drawHeraldricCorner(ctx, x, y, cornerSize, color);
    });
  }

  private drawHeraldricCorner(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Cross pattern
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
    
    // Diagonal decorations
    ctx.beginPath();
    ctx.moveTo(x - size/2, y - size/2);
    ctx.lineTo(x + size/2, y + size/2);
    ctx.moveTo(x + size/2, y - size/2);
    ctx.lineTo(x - size/2, y + size/2);
    ctx.stroke();
  }

  private drawHeraldricShield(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 4);
    ctx.lineTo(x + width, y + height * 3 / 4);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height * 3 / 4);
    ctx.lineTo(x, y + height / 4);
    ctx.closePath();
    ctx.fill();
    
    // Shield trim
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  private drawAcademicDivider(ctx: CanvasRenderingContext2D, centerX: number, y: number, width: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // Main dividing line
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, y);
    ctx.lineTo(centerX + width / 2, y);
    ctx.stroke();
    
    // Academic ornaments
    ctx.fillStyle = color;
    const ornaments = [-60, -30, 0, 30, 60];
    ornaments.forEach(offset => {
      ctx.beginPath();
      ctx.arc(centerX + offset, y, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      if (offset === 0) {
        // Central academic star
        this.drawAcademicStar(ctx, centerX, y, 6, color);
      }
    });
  }

  private drawAcademicStar(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  }

  private drawAcademicRole(ctx: CanvasRenderingContext2D, centerX: number, y: number, latinTitle: string, name: string, color: string): void {
    // Academic scroll background
    const scrollWidth = 300;
    const scrollHeight = 30;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(centerX - scrollWidth / 2, y - scrollHeight / 2, scrollWidth, scrollHeight);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - scrollWidth / 2, y - scrollHeight / 2, scrollWidth, scrollHeight);
    
    // Latin title
    ctx.fillStyle = color;
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${latinTitle}: `, centerX - 40, y + 5);
    
    // Name
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 16px "Times New Roman", serif';
    ctx.fillText(name, centerX + 40, y + 5);
  }

  private drawAcademicSeal(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, color: string): void {
    // Outer seal ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner academic symbols
    ctx.fillStyle = color;
    
    // Central book
    ctx.fillRect(centerX - 15, centerY - 10, 30, 20);
    
    // Academic cross
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY);
    ctx.lineTo(centerX + 8, centerY);
    ctx.moveTo(centerX, centerY - 6);
    ctx.lineTo(centerX, centerY + 6);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Surrounding academic text (simulated)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Small academic marks around seal
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x = centerX + Math.cos(angle) * 45;
      const y = centerY + Math.sin(angle) * 45;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}