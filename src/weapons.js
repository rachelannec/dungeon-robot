export const weapons = [
  {
    name: "Pistol",
    damage: 15,
    energyCost: 5,
    fireRate: 10,  // Lower number = faster firing
    projectileSpeed: 12,
    spread: 0.1,   // Small spread for accuracy
    color: "#FFFFFF"
  },
  {
    name: "Shotgun",
    damage: 8,     // Per pellet (will fire multiple)
    energyCost: 15,
    fireRate: 30,
    projectileSpeed: 10,
    spread: 0.5,   // Wide spread
    pellets: 5,    // Number of projectiles
    color: "#FFA500"
  },
  {
    name: "Laser",
    damage: 30,
    energyCost: 20,
    fireRate: 20,
    projectileSpeed: 15,
    spread: 0.05,
    piercing: true, // Goes through enemies
    color: "#00FFFF"
  },
  {
    name: "Plasma Cannon",
    damage: 50,
    energyCost: 30,
    fireRate: 40,
    projectileSpeed: 8,
    spread: 0.2,
    splashDamage: true, // Area of effect
    splashRadius: 40,
    color: "#FF00FF"
  }
];