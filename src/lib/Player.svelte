<script>
  export let x, y;
  export let direction = { x: 0, y: 1 }; // Default direction (facing down)

  import Player from '../sprites/player.png'; // Ensure sprites are correctly imported

  // Sprite animation states
  let frame = 0;
  let animationTimer = 0;
  const animationSpeed = 0.1;

  // Determine sprite based on direction
  $: spriteDirection = 
    Math.abs(direction.x) > Math.abs(direction.y) 
      ? (direction.x > 0 ? 'right' : 'left')
      : (direction.y > 0 ? 'down' : 'up');

  // Animation logic
  $: {
    animationTimer += animationSpeed;
    if (animationTimer >= 1) {
      frame = (frame + 1) % 4; // Assuming 4 frames per direction
      animationTimer = 0;
    }
  }
</script>

<div class="player" style="transform: translate({x}px, {y}px);">
  <img 
    src={`${Player}_${spriteDirection}_${Math.floor(frame)}.png`} 
    alt="Player"
    class="sprite"
  />
</div>

<style>
  .player {
    position: absolute;
    width: 32px;
    height: 32px;
    transform-origin: center;
    z-index: 10;
  }

  .sprite {
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }
</style>