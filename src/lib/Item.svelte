<script>
    export let x;
    export let y;
    export let type;
    export let color = '#FFFFFF';
    export let size = 10;
  </script>
  
  <circle cx={x} cy={y} r={size} fill={color} stroke="#FFF" stroke-width={type === 'weapon' ? 2 : 1} />
  
  <style>
    circle {
      position: absolute;
      z-index: 30;
    }
  </style>


<!-- <script>
    export let x;
    export let y;
    export let type;
    export let color = '#FFFFFF';  // Default color if none provided
    export let size = 10;         // Default size if none provided

    // Visual feedback when item is collected
    let isCollected = false;
    
    // Function to handle collection (can be called from parent)
    function collect() {
        isCollected = true;
    }
</script>

<circle 
    class="item"
    cx={x}
    cy={y}
    r={size}
    fill={color}
    stroke="#FFFFFF"
    stroke-width={type === 'weapon' ? 2 : 1}
    opacity={isCollected ? 0 : 1}
    style="transition: opacity 0.3s ease-out;"
/>

{#if isCollected}
    <animate 
        attributeName="r"
        from={size} 
        to={size * 2}
        dur="0.3s"
        fill="freeze"
    />
{/if}

<style>
    .item {
        position: absolute;
        z-index: 30;  /* Above dungeon but below player */
        filter: drop-shadow(0 0 3px currentColor);
    }
</style> -->