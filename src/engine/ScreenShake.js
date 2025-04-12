// ScreenShake.js
export class ScreenShake {
    constructor() {
      this.intensity = 0;
      this.duration = 0;
      this.timer = 0;
    }
  
    shake(intensity = 5, duration = 200) {
      this.intensity = intensity;
      this.duration = duration;
      this.timer = duration;
    }
  
    update(deltaTime) {
      if (this.timer > 0) {
        this.timer -= deltaTime;
        this.intensity = this.intensity * (this.timer / this.duration);
      }
    }
  
    getOffset() {
      if (this.timer <= 0) return { x: 0, y: 0 };
      
      return {
        x: (Math.random() - 0.5) * 2 * this.intensity,
        y: (Math.random() - 0.5) * 2 * this.intensity
      };
    }
  }