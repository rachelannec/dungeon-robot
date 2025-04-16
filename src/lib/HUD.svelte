<script>
  export let health;
  export let maxHealth;
  export let energy;
  export let maxEnergy;
  export let score;
  export let weapon;
  export let currentRoom;
  export let totalRooms;
  export let roomsCleared;
  export let enemiesDefeated;
</script>

<div class="hud">

  <div class="progress-stats">
    <div>Room: {currentRoom}/{totalRooms}</div>
    <div>Cleared: {roomsCleared}</div>
    <div>Enemies: {enemiesDefeated}</div>
  </div>

  <div class="health-bar">
    <div class="health-fill" style="width: {(health / maxHealth) * 100}%" />
    <span>HEALTH: {Math.floor(health)}/{maxHealth}</span>
  </div>
  
  <div class="energy-bar">
    <div class="energy-fill" style="width: {(energy / maxEnergy) * 100}%" />
    <span>ENERGY: {Math.floor(energy)}/{maxEnergy}</span>
  </div>
  
  <div class="weapon-info">
    {weapon.name} (DMG: {weapon.damage}, COST: {weapon.energyCost})
  </div>
  
  <div class="score">
    SCORE: {score}
  </div>

  
</div>

<style>
  .hud {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 14px;
    text-shadow: 1px 1px 1px black;
    z-index: 100;
  }
  
  .health-bar, .energy-bar {
    position: relative;
    height: 20px;
    margin-bottom: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #444;
  }
  
  .health-fill {
    height: 100%;
    background-color: #f44336;
    transition: width 0.1s;
  }
  
  .energy-fill {
    height: 100%;
    background-color: #2196F3;
    transition: width 0.1s;
  }
  
  .health-bar span, .energy-bar span {
    position: absolute;
    left: 5px;
    top: 2px;
  }
  
  .weapon-info {
    margin-top: 10px;
    color: #FFC107;
  }
  
  .score {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
  }

  .progress-stats {
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    font-family: monospace;
    text-align: right;
    padding-bottom: 50px;
  }
</style>