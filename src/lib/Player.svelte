<script>
    export let x;
    export let y;
    export let direction;
    
    $: angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
  </script>
  
  <div
    class="player"
    style="left: {x}px; top: {y}px; transform: rotate({angle}deg)"
  />
  
  <style>
    .player {
      position: absolute;
      width: 30px;
      height: 30px;
      background-color: #4CAF50;
      border-radius: 50%;
      transform-origin: center;
      z-index: 10;
      
      /* Robot design */
      border: 3px solid #333;
      box-shadow: 0 0 0 2px #555;
      
      &::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: #ff0;
        border-radius: 50%;
        top: 5px;
        left: 5px;
      }
    }
  </style>