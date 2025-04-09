<script>
    export let x;
    export let y;
    export let dx;
    export let dy;
    export let type;
    
    $: angle = Math.atan2(dy, dx) * (180 / Math.PI);
  </script>
  
  <div
    class="projectile {type}"
    style="left: {x}px; top: {y}px; transform: rotate({angle}deg)"
  />
  
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
  </style>