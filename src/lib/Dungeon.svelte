<script>
  export let rooms;
  export let currentRoom;

  import Wall from '../sprites/wall.png';
  import Floor from '../sprites/floor.png';

  const TILE_SIZE = 32;
  const WALL_SIZE =32; 

  // Seeded random generator to ensure consistent randomness per tile
  function seededRandom(x, y) {
    const seed = x * 73856093 ^ y * 19349663;
    return Math.abs(Math.sin(seed) * 10000) % 1;
  }

  // Generate randomized tile data for each room
  function generateFloorTiles(room) {
    const cols = Math.floor(room.width / TILE_SIZE);
    const rows = Math.floor(room.height / TILE_SIZE);
    const tiles = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const rand = seededRandom(room.x + x, room.y + y);
        const rotation = Math.floor(rand * 4) * 90; // 0, 90, 180, 270
        const brightness = 0.8 + rand * 0.4;        // 0.8 - 1.2

        tiles.push({ x, y, rotation, brightness });
      }
    }

    return tiles;
  }
</script>

{#each rooms as room, i (i)}
  <div 
    class="room {i === currentRoom ? 'active' : ''}" 
    style="left: {room.x}px; top: {room.y}px; width: {room.width}px; height: {room.height}px"
  >
    <!-- Floor tiles -->
    {#each generateFloorTiles(room) as tile}
      <img 
        src="{Floor}" 
        class="tile"
        style="
          position: absolute;
          left: {tile.x * TILE_SIZE}px;
          top: {tile.y * TILE_SIZE}px;
          width: {TILE_SIZE}px;
          height: {TILE_SIZE}px;
          transform: rotate({tile.rotation}deg);
          filter: brightness({tile.brightness});
        "
        alt="Floor Tile"
      />
    {/each}

    <!-- Top wall -->
    {#each Array.from({ length: Math.floor(room.width / TILE_SIZE) }) as _, index}
      <img src="{Wall}" style="left: {index * WALL_SIZE}px; top: 0" class="wall" alt="Wall" />
    {/each}

    

</div>
{/each}

<style>
  .room {
    position: absolute;
    background-color: #222;
    overflow: hidden;
  }

  .room.active {
    border: 2px solid gold;
  }

  .tile, .wall {
    position: absolute;
    width: 32px;
    height: 32px;
    image-rendering: pixelated;
  }

  .wall {
    z-index: 5;
  }
</style>
