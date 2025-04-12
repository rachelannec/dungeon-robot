// ParticleSystem.js
export class ParticleSystem {
    constructor() {
      this.particles = [];
      this.textures = new Map();
    }
  
    async loadTexture(name, url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          this.textures.set(name, img);
          resolve();
        };
      });
    }
  
    emit(options) {
      const count = options.count || 1;
      
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: options.x,
          y: options.y,
          vx: (options.vx || 0) + (options.spread ? (Math.random() - 0.5) * options.spread : 0),
          vy: (options.vy || 0) + (options.spread ? (Math.random() - 0.5) * options.spread : 0),
          life: options.life || 1000,
          maxLife: options.life || 1000,
          size: options.size || 8,
          growth: options.growth || 0,
          rotation: options.rotation || 0,
          rotationSpeed: options.rotationSpeed || 0,
          color: options.color || '#ffffff',
          texture: options.texture ? this.textures.get(options.texture) : null,
          alpha: 1,
          gravity: options.gravity || 0
        });
      }
    }
  
    update(deltaTime) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        
        p.x += p.vx * (deltaTime / 16);
        p.y += p.vy * (deltaTime / 16);
        p.vy += p.gravity * (deltaTime / 16);
        p.life -= deltaTime;
        p.size += p.growth * (deltaTime / 16);
        p.rotation += p.rotationSpeed * (deltaTime / 16);
        p.alpha = p.life / p.maxLife;
        
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  
    render(ctx) {
      this.particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = p.alpha;
        
        if (p.texture) {
          ctx.drawImage(
            p.texture,
            -p.size / 2,
            -p.size / 2,
            p.size,
            p.size
          );
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(
            -p.size / 2,
            -p.size / 2,
            p.size,
            p.size
          );
        }
        
        ctx.restore();
      });
    }
  }