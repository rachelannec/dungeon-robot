import { CollisionSystem } from './CollisionSystem';
import { AnimationManager } from './AnimationManager';
import { ParticleSystem } from './ParticleSystem';
import { ScreenShake } from './ScreenShake';
import { TimeManager } from './TimeManager';

export class GameEngine {
  constructor() {
    // Core systems
    this.collision = new CollisionSystem();
    this.animation = new AnimationManager();
    this.particles = new ParticleSystem();
    this.screenShake = new ScreenShake();
    this.time = new TimeManager();
    
    // Game state tracking
    this.lastTime = 0;
    this.isRunning = false;
    this.systemsReady = false;
  }

  async initialize() {
    // Load all required assets
    await Promise.all([
      this.loadCollisionMaps(),
      this.loadAnimations(),
      this.loadParticleTextures()
    ]);
    
    this.systemsReady = true;
    return this;
  }

  async loadCollisionMaps() {
    await Promise.all([
      this.collision.loadCollisionMap('/sprites/player.png'),
      this.collision.loadCollisionMap('/sprites/enemy.png'),
      this.collision.loadCollisionMap('/sprites/wall.png')
    ]);
  }

  async loadAnimations() {
    this.animation.addAnimation('player_idle', [
      '/sprites/player_idle_0.png',
      '/sprites/player_idle_1.png'
    ], { frameRate: 5 });
    
    this.animation.addAnimation('player_run', [
      '/sprites/player_run_0.png',
      '/sprites/player_run_1.png',
      '/sprites/player_run_2.png',
      '/sprites/player_run_3.png'
    ], { frameRate: 10 });
  }

  async loadParticleTextures() {
    await Promise.all([
      this.particles.loadTexture('spark', '/sprites/particle_spark.png'),
      this.particles.loadTexture('smoke', '/sprites/particle_smoke.png')
    ]);
  }

  start(gameUpdateCallback, renderCallback) {
    if (!this.systemsReady) {
      console.error('Systems not ready! Call initialize() first');
      return;
    }
    
    this.isRunning = true;
    this.gameUpdate = gameUpdateCallback;
    this.render = renderCallback;
    this.gameLoop(0);
  }

  stop() {
    this.isRunning = false;
  }

  gameLoop(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time with time scaling
    const rawDelta = timestamp - this.lastTime;
    const deltaTime = this.time.getDeltaTime(Math.min(rawDelta, 100));
    this.lastTime = timestamp;
    
    // Update all systems
    this.time.update();
    this.animation.update(deltaTime);
    this.particles.update(deltaTime);
    this.screenShake.update(deltaTime);
    
    // Game logic update
    if (this.gameUpdate) {
      this.gameUpdate(deltaTime);
    }
    
    // Rendering
    if (this.render) {
      this.render({
        screenShake: this.screenShake.getOffset()
      });
    }
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // Helper methods
  emitParticles(options) {
    this.particles.emit(options);
  }

  triggerScreenShake(intensity, duration) {
    this.screenShake.shake(intensity, duration);
  }

  triggerHitStop(frames) {
    this.time.hitStop(frames);
  }
}