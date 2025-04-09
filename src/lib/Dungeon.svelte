<script>
  export let rooms;
  export let currentRoom;
</script>

{#each rooms as room, i (i)}
  <div
    class="room {i === currentRoom ? 'active' : ''}"
    style="left: {room.x}px; top: {room.y}px; width: {room.width}px; height: {room.height}px"
  />
{/each}

<style>
  .room {
    position: absolute;
    background-color: #222;
    border: 2px solid #444;
  }
  
  .active {
    background-color: #333;
    border-color: #666;
  }
</style>