// AnimationManager.js
export class AnimationManager {
    constructor() {
      this.animations = new Map();
      this.currentAnimations = new Map();
    }
  
    addAnimation(name, frames, options = {}) {
      const config = {
        frames: frames,
        frameRate: options.frameRate || 10,
        loop: options.loop !== false,
        flipX: options.flipX || false,
        flipY: options.flipY || false
      };
      this.animations.set(name, config);
    }
  
    playAnimation(spriteId, animationName) {
      if (!this.currentAnimations.has(spriteId)) {
        this.currentAnimations.set(spriteId, {
          currentAnimation: animationName,
          currentFrame: 0,
          frameTimer: 0,
          flipped: { x: false, y: false }
        });
      } else {
        const anim = this.currentAnimations.get(spriteId);
        if (anim.currentAnimation !== animationName) {
          anim.currentAnimation = animationName;
          anim.currentFrame = 0;
          anim.frameTimer = 0;
        }
      }
    }
  
    update(deltaTime) {
      this.currentAnimations.forEach((animState, spriteId) => {
        const animConfig = this.animations.get(animState.currentAnimation);
        
        animState.frameTimer += deltaTime;
        const frameDuration = 1000 / animConfig.frameRate;
        
        if (animState.frameTimer >= frameDuration) {
          animState.frameTimer -= frameDuration;
          animState.currentFrame++;
          
          if (animState.currentFrame >= animConfig.frames.length) {
            if (animConfig.loop) {
              animState.currentFrame = 0;
            } else {
              animState.currentFrame = animConfig.frames.length - 1;
            }
          }
        }
        
        // Update flip states
        animState.flipped.x = animConfig.flipX;
        animState.flipped.y = animConfig.flipY;
      });
    }
  
    getCurrentFrame(spriteId) {
      if (!this.currentAnimations.has(spriteId)) return null;
      
      const animState = this.currentAnimations.get(spriteId);
      const animConfig = this.animations.get(animState.currentAnimation);
      
      return {
        frame: animConfig.frames[animState.currentFrame],
        flipped: animState.flipped
      };
    }
  }