<script>
    export let x;
    export let y;
  </script>
  
  <div class="enemy" style="left: {x}px; top: {y}px;" />
  
  <style>
    .enemy {
      position: absolute;
      width: 25px;
      height: 25px;
      background-color: #f44336;
      border-radius: 50%;
      z-index: 5;
      
      /* Enemy design */
      border: 2px solid #900;
      box-shadow: 0 0 0 1px #c00;
      
      &::before {
        content: '';
        position: absolute;
        width: 15px;
        height: 5px;
        background-color: #900;
        top: -8px;
        left: 5px;
      }
    }
  </style>