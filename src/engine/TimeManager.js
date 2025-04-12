// TimeManager.js
export class TimeManager {
    constructor() {
      this.timeScale = 1;
      this.hitStopFrames = 0;
    }
  
    hitStop(frames = 3) {
      this.hitStopFrames = frames;
      this.timeScale = 0.1;
    }
  
    update() {
      if (this.hitStopFrames > 0) {
        this.hitStopFrames--;
        if (this.hitStopFrames === 0) {
          this.timeScale = 1;
        }
      }
    }
  
    getDeltaTime(deltaTime) {
      return deltaTime * this.timeScale;
    }
  }