<!-- <script>
  export let x;
  export let y;
  export let color = '#FFFFFF';
  export let type;
</script>

<circle 
  cx={x}
  cy={y}
  r={type === 'player' ? 6 : 4}
  fill={color}
  stroke={type === 'player' ? '#88F' : '#F00'}
  stroke-width="1"
/>

<style>
  circle {
    position: absolute;
    z-index: 50;
  }
</style> -->

<!-- Projectile.svelte -->
<script>
  export let x;
  export let y;
  export let color = '#FFFFFF';
  export let type;
  export let angle = 0; // Angle in degrees

  console.log(`Rendering projectile at ${x},${y} with color ${color}`);
</script>

<!-- <circle cx={x} cy={y} r={type === 'player' ? 5 : 4} fill={color} /> -->

<div 
  class="projectile {type}"
  style="left: {x}px; top: {y}px; transform: rotate({angle}deg)"></div>

<!-- <div
  class="projectile"
  class:player={type === 'player'}
  class:enemy={type === 'enemy'}
  style="
    left: {x}px;
    top: {y}px;
    background-color: {color};
    box-shadow: 0 0 5px {color};
    transform: rotate({angle}deg);
  "
></div> -->

<style>
  .projectile {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform-origin: center;
    z-index: 2;
  }


  .player {
    background-color: #2196F3;
    box-shadow: 0 0 5px #2196F3;
  }

  .enemy {
    background-color: #FF9800;
    box-shadow: 0 0 5px #FF9800;
  }

  /* circle {
  position: relative;
  z-index: 10;
} */
</style>