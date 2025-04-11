<script>
	import { onMount } from 'svelte';
	import Player from './lib/Player.svelte';
	import Enemy from './lib/Enemy.svelte';
	import Projectile from './lib/Projectile.svelte';
	import Dungeon from './lib/Dungeon.svelte';
	import HUD from './lib/HUD.svelte';
	import Item from './lib/Item.svelte';
	import { generateDungeon } from './dungeonGenerator';
	import { weapons } from './weapons';
	import { items } from './items';

	const canvasWidth = 800;
	const canvasHeight = 600;

	let gameState = {
		player: {
			x: 0,
			y: 0,
			health: 100,
			maxHealth: 100,
			energy: 100,
			maxEnergy: 100,
			weapon: weapons[0],
			direction: { x: 1, y: 0 }
		},
		enemies: [],
		projectiles: [],
		items: [],
		currentRoom: 0,
		rooms: [],
		score: 0,
		gameOver: false,
		gameStarted: false
	};

	let keys = {};
	let lastTime = 0;
	let animationFrame;

	// Camera position (reactive)
	$: camera = {
		x: gameState.player.x - canvasWidth / 2,
		y: gameState.player.y - canvasHeight / 2
	};

	onMount(() => {
		gameState.rooms = generateDungeon(5);
		gameState.player.x = gameState.rooms[0].center.x;
		gameState.player.y = gameState.rooms[0].center.y;

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('click', handleShoot);

		gameLoop(0);

		return () => {
			window.cancelAnimationFrame(animationFrame);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('click', handleShoot);
		};
	});

	function handleKeyDown(e) {
		keys[e.key] = true;
		if (e.key === '1') gameState.player.weapon = weapons[0];
		if (e.key === '2') gameState.player.weapon = weapons[1];
		if (e.key === '3') gameState.player.weapon = weapons[2];
		if (e.key === '4') gameState.player.weapon = weapons[3];
	}

	function handleKeyUp(e) {
		keys[e.key] = false;
	}

	function handleShoot(e) {
		if (gameState.gameOver || !gameState.gameStarted) return;
		if (gameState.player.energy < gameState.player.weapon.energyCost) return;

		const rect = document.querySelector('#game-canvas').getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Convert screen coordinates to world coordinates
		const worldX = mouseX + camera.x;
		const worldY = mouseY + camera.y;

		const angle = Math.atan2(worldY - gameState.player.y, worldX - gameState.player.x);

		gameState.player.direction = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		};

		gameState.player.energy -= gameState.player.weapon.energyCost;

		const weapon = gameState.player.weapon;
		const projectileSpeed = weapon.projectileSpeed || 10;
		
		gameState.projectiles.push({
			x: gameState.player.x,
			y: gameState.player.y,
			dx: Math.cos(angle) * projectileSpeed,
			dy: Math.sin(angle) * projectileSpeed,
			damage: weapon.damage,
			lifetime: 60,
			type: 'player',
			color: weapon.color || '#FFFFFF', // Ensure color is defined
			weaponType: weapon.name
		});

		console.log('Player projectile created:', {
			position: { x: gameState.player.x, y: gameState.player.y },
			direction: { dx: Math.cos(angle), dy: Math.sin(angle) },
			color: weapon.color
		});
	}

	function spawnEnemies() {
		const room = gameState.rooms[gameState.currentRoom];
		const enemyCount = 3 + Math.floor(Math.random() * 3);
		const itemCount = 1 + Math.floor(Math.random() * 2);

		gameState.enemies = [];
		gameState.items = [];

		for (let i = 0; i < enemyCount; i++) {
			const x = room.x + 50 + Math.random() * (room.width - 100);
			const y = room.y + 50 + Math.random() * (room.height - 100);

			gameState.enemies.push({
				x,
				y,
				health: 30,
				speed: 1 + Math.random(),
				damage: 10,
				lastShot: 0,
				shootCooldown: 60 + Math.random() * 60
			});
		}

		for (let i = 0; i < itemCount; i++) {
			const x = room.x + 50 + Math.random() * (room.width - 100);
			const y = room.y + 50 + Math.random() * (room.height - 100);
			const itemType = Math.random() > 0.5 ? 'healthPack' : 'weaponUpgrade';
			gameState.items.push({
				x,
				y,
				...items[itemType]
			});
		}
	}

	function gameLoop(timestamp) {
		const deltaTime = timestamp - lastTime;
		lastTime = timestamp;

		update(deltaTime);
		render();

		animationFrame = window.requestAnimationFrame(gameLoop);
	}

	function update(deltaTime) {
		if (gameState.gameOver || !gameState.gameStarted) return;

		const speed = 5;
		if (keys['ArrowUp'] || keys['w']) gameState.player.y -= speed;
		if (keys['ArrowDown'] || keys['s']) gameState.player.y += speed;
		if (keys['ArrowLeft'] || keys['a']) gameState.player.x -= speed;
		if (keys['ArrowRight'] || keys['d']) gameState.player.x += speed;

		gameState.player.energy = Math.min(
			gameState.player.energy + 0.2, 
			gameState.player.maxEnergy
		);

		// Update enemies
		for (let i = gameState.enemies.length - 1; i >= 0; i--) {
			const enemy = gameState.enemies[i];
			const dx = gameState.player.x - enemy.x;
			const dy = gameState.player.y - enemy.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist > 150) {
				enemy.x += (dx / dist) * enemy.speed;
				enemy.y += (dy / dist) * enemy.speed;
			}

			enemy.lastShot++;
			if (enemy.lastShot > enemy.shootCooldown && dist < 300) {
				enemy.lastShot = 0;
				gameState.projectiles.push({
					x: enemy.x,
					y: enemy.y,
					dx: (dx / dist) * 5,
					dy: (dy / dist) * 5,
					damage: enemy.damage,
					lifetime: 120,
					type: 'enemy',
					color: '#FF0000'
				});
			}

			if (dist < 30) {
				gameState.player.health -= 0.5;
				if (gameState.player.health <= 0) gameState.gameOver = true;
			}
		}

		// Update items
		for (let i = gameState.items.length - 1; i >= 0; i--) {
			const item = gameState.items[i];
			const dx = gameState.player.x - item.x;
			const dy = gameState.player.y - item.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < 30) {
				if (item.type === 'health') {
					gameState.player.health = Math.min(
						gameState.player.health + item.amount,
						gameState.player.maxHealth
					);
				} else if (item.type === 'weapon') {
					const currentIndex = weapons.indexOf(gameState.player.weapon);
					const nextIndex = (currentIndex + 1) % weapons.length;
					gameState.player.weapon = weapons[nextIndex];
				}
				gameState.items.splice(i, 1);
				gameState.score += 50;
			}
		}

		// Update projectiles
		for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
			const proj = gameState.projectiles[i];
			proj.x += proj.dx;
			proj.y += proj.dy;
			proj.lifetime--;

			if (proj.lifetime <= 0) {
				gameState.projectiles.splice(i, 1);
				continue;
			}

			if (proj.type === 'player') {
				let shouldRemove = !proj.piercing;
				
				for (let j = gameState.enemies.length - 1; j >= 0; j--) {
					const enemy = gameState.enemies[j];
					const dx = proj.x - enemy.x;
					const dy = proj.y - enemy.y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (proj.splashRadius > 0 && dist < proj.splashRadius) {
						const splashDamage = proj.damage * (1 - (dist / proj.splashRadius));
						enemy.health -= splashDamage;
					} 
					else if (dist < 20) {
						enemy.health -= proj.damage;
					}

					if (enemy.health <= 0) {
						gameState.enemies.splice(j, 1);
						gameState.score += 100;
					}
				}

				if (shouldRemove) {
					gameState.projectiles.splice(i, 1);
				}
			}

			if (proj.type === 'enemy') {
				const dx = proj.x - gameState.player.x;
				const dy = proj.y - gameState.player.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < 20) {
					gameState.player.health -= proj.damage;
					gameState.projectiles.splice(i, 1);
					if (gameState.player.health <= 0) gameState.gameOver = true;
				}
			}
		}

		// Room transitions
		const currentRoom = gameState.rooms[gameState.currentRoom];
		if (
			gameState.player.x < currentRoom.x ||
			gameState.player.x > currentRoom.x + currentRoom.width ||
			gameState.player.y < currentRoom.y ||
			gameState.player.y > currentRoom.y + currentRoom.height
		) {
			for (let i = 0; i < gameState.rooms.length; i++) {
				const room = gameState.rooms[i];
				if (
					i !== gameState.currentRoom &&
					gameState.player.x >= room.x &&
					gameState.player.x <= room.x + room.width &&
					gameState.player.y >= room.y &&
					gameState.player.y <= room.y + room.height
				) {
					gameState.currentRoom = i;
					spawnEnemies();
					break;
				}
			}
		}
	}

	function render() {}

	function startGame() {
		gameState.gameStarted = true;
		gameState.gameOver = false;
		gameState.score = 0;
		gameState.player.health = gameState.player.maxHealth;
		gameState.player.energy = gameState.player.maxEnergy;
		gameState.currentRoom = 0;
		gameState.enemies = [];
		gameState.projectiles = [];
		gameState.items = [];
		gameState.player.x = gameState.rooms[0].center.x;
		gameState.player.y = gameState.rooms[0].center.y;
		gameState.player.weapon = weapons[0];
		spawnEnemies();
	}
</script>

<div id="game-container">
	{#if !gameState.gameStarted}
		<div class="start-screen">
			<h1>Robot Dungeon</h1>
			<button on:click={startGame}>Start Game</button>
			<div class="controls">
				<p>WASD or Arrow Keys to move</p>
				<p>Mouse to aim and shoot</p>
				<p>1-4 to switch weapons</p>
			</div>
		</div>
	{:else if gameState.gameOver}
		<div class="game-over">
			<h1>Game Over</h1>
			<p>Score: {gameState.score}</p>
			<button on:click={startGame}>Play Again</button>
		</div>
	{:else}
		<div id="game-canvas">
			<div style="position: absolute; left: {-camera.x}px; top: {-camera.y}px;">
				<Dungeon rooms={gameState.rooms} currentRoom={gameState.currentRoom} />

				<Player
					x={gameState.player.x}
					y={gameState.player.y}
					direction={gameState.player.direction}
				/>

				{#each gameState.enemies as enemy (enemy.x + enemy.y)}
					<Enemy x={enemy.x} y={enemy.y} />
				{/each}

				{#each gameState.projectiles as proj (proj.x + proj.y)}
					<Projectile 
						x={proj.x}
						y={proj.y}
						color={proj.color}
						type={proj.type}
					/>
				{/each}

				{#each gameState.items as item (item.x + item.y)}
					<Item 
						x={item.x}
						y={item.y}
						type={item.type}
						color={item.color}
						size={item.size}
					/>
				{/each}
			</div>

			<HUD
				health={gameState.player.health}
				maxHealth={gameState.player.maxHealth}
				energy={gameState.player.energy}
				maxEnergy={gameState.player.maxEnergy}
				score={gameState.score}
				weapon={gameState.player.weapon}
			/>
		</div>
	{/if}
</div>

<style>
	#game-container {
		position: relative;
		width: 800px;
		height: 600px;
		margin: 0 auto;
		background-color: #111;
		overflow: hidden;
	}

	#game-canvas {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}

	.start-screen, .game-over {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: white;
		text-align: center;
	}

	button {
		padding: 10px 20px;
		font-size: 1.2rem;
		margin-top: 20px;
		background: #4CAF50;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background: #45a049;
	}

	.controls {
		margin-top: 30px;
		color: #aaa;
	}
</style>