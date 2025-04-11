<script>
  export let health;
  export let maxHealth;
  export let energy;
  export let maxEnergy;
  export let score;
  export let weapon;

  // Notification system
  let showItemNotification = false;
  let notificationText = '';
  let notificationColor = '#FFFFFF';

  // Function to show notifications
  function showNotification(text, color = '#FFFFFF') {
    notificationText = text;
    notificationColor = color;
    showItemNotification = true;
    setTimeout(() => showItemNotification = false, 2000);
  }

  // Example usage (you'll call this from your main game when items are collected)
  // showNotification('Weapon Upgraded!', '#00FF00');
</script>

<div class="hud">
  <!-- Score display -->
  <div class="score">
    SCORE: {score}
  </div>

  <!-- Health bar -->
  <div class="health-bar">
    <div 
      class="health-fill" 
      style="width: {Math.max(0, (health / maxHealth) * 100)}%; background-color: {health < maxHealth * 0.3 ? '#FF0000' : '#F44336'}" 
    />
    <span>HEALTH: {Math.floor(health)}/{maxHealth}</span>
  </div>
  
  <!-- Energy bar -->
  <div class="energy-bar">
    <div 
      class="energy-fill" 
      style="width: {Math.max(0, (energy / maxEnergy) * 100)}%; background-color: {energy < weapon.energyCost ? '#FF5722' : '#2196F3'}" 
    />
    <span>ENERGY: {Math.floor(energy)}/{maxEnergy}</span>
  </div>
  
  <!-- Weapon info -->
  <div class="weapon-info" style="color: {weapon.color || '#FFC107'}">
    {weapon.name} (DMG: {weapon.damage}, COST: {weapon.energyCost}, RATE: {weapon.fireRate})
  </div>

  <!-- Notification system -->
  {#if showItemNotification}
    <div class="notification" style="color: {notificationColor}">
      {notificationText}
    </div>
  {/if}
</div>

<style>
  .hud {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    color: white;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    text-shadow: 1px 1px 2px black;
    z-index: 100;
    pointer-events: none; /* Allows clicking through the HUD */
  }
  
  .health-bar, .energy-bar {
    position: relative;
    height: 20px;
    margin-bottom: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;
  }
  
  .health-fill, .energy-fill {
    height: 100%;
    transition: width 0.1s ease-out, background-color 0.2s;
  }
  
  .health-bar span, .energy-bar span {
    position: absolute;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
  }
  
  .weapon-info {
    margin-top: 10px;
    font-size: 13px;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 3px 6px;
    border-radius: 3px;
    display: inline-block;
  }
  
  .score {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 2px 8px;
    border-radius: 3px;
  }

  .notification {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 5px 15px;
    border-radius: 5px;
    animation: fadeOut 2s ease-out forwards;
    white-space: nowrap;
  }

  @keyframes fadeOut {
    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
</style>