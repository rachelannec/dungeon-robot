<script>
	import { onMount } from 'svelte';
	import Player from './lib/Player.svelte';
	import Enemy from './lib/Enemy.svelte';
	import Projectile from './lib/Projectile.svelte';
	import Dungeon from './lib/Dungeon.svelte';
	import HUD from './lib/HUD.svelte';
	import { generateDungeon } from './game/dungeonGenerator';
	import { weapons } from './weapons';

	let canvasWidth = 800;
	let canvasHeight = 600;

	let gameState = {
		player: {
			x: 0,
			y: 0,
			health: 100,
			maxHealth: 100,
			energy: 100,
			maxEnergy: 100,
			weapon: weapons[2],
			direction: { x: 1, y: 0 }
		},
		enemies: [],
		projectiles: [],
		currentRoom: 0,
		rooms: [],
		score: 0,
		gameOver: false,
		gameStarted: false
	};

	let keys = {};
	let lastTime = 0;
	let animationFrame;

	// Camera offset to keep player in center
	$: cameraOffset = {
		x: gameState.player.x - canvasWidth / 2,
		y: gameState.player.y - canvasHeight / 2
	};

	onMount(() => {
		gameState.rooms = generateDungeon(5);
		gameState.player.x = gameState.rooms[0].center.x;
		gameState.player.y = gameState.rooms[0].center.y;
		spawnEnemies();

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

	const minimap = {
        width: 200,
        height: 200,
        padding: 15,
        scale: 0.1,
        playerSize: 6,
        enemySize: 4,
        playerColor: '#00FF00',
        enemyColor: '#FF0000',
        roomColor: 'rgba(80, 80, 80, 0.4)',
        currentRoomColor: 'rgba(120, 120, 120, 0.6)',
        borderColor: '#AAA',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    };

    // Calculate minimap data for all rooms
    function getMinimapData() {
        if (!gameState.rooms.length) return {};
        
        // Find bounds of all rooms
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        gameState.rooms.forEach(room => {
            minX = Math.min(minX, room.x);
            minY = Math.min(minY, room.y);
            maxX = Math.max(maxX, room.x + room.width);
            maxY = Math.max(maxY, room.y + room.height);
        });

        // Calculate scale to fit all rooms in minimap
        const roomWidth = maxX - minX;
        const roomHeight = maxY - minY;
        const scaleX = (minimap.width - minimap.padding * 2) / roomWidth;
        const scaleY = (minimap.height - minimap.padding * 2) / roomHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // Slightly smaller to keep padding

        // Calculate center offset
        const centerX = minimap.width / 2;
        const centerY = minimap.height / 2;
        const centerRoomX = (gameState.rooms[gameState.currentRoom].x + gameState.rooms[gameState.currentRoom].width/2 - minX) * scale;
        const centerRoomY = (gameState.rooms[gameState.currentRoom].y + gameState.rooms[gameState.currentRoom].height/2 - minY) * scale;
        const offsetX = centerX - centerRoomX;
        const offsetY = centerY - centerRoomY;

        return {
            rooms: gameState.rooms.map(room => ({
                x: (room.x - minX) * scale + offsetX,
                y: (room.y - minY) * scale + offsetY,
                width: room.width * scale,
                height: room.height * scale,
                isCurrent: gameState.rooms.indexOf(room) === gameState.currentRoom
            })),
            player: {
                x: (gameState.player.x - minX) * scale + offsetX,
                y: (gameState.player.y - minY) * scale + offsetY
            },
            enemies: gameState.enemies.map(enemy => ({
                x: (enemy.x - minX) * scale + offsetX,
                y: (enemy.y - minY) * scale + offsetY
            })),
            scale
        };
    }


	function handleKeyDown(e) {
		keys[e.key] = true;

		if (e.key === '1') gameState.player.weapon = weapons[0];
		else if (e.key === '2') gameState.player.weapon = weapons[1];
		else if (e.key === '3') gameState.player.weapon = weapons[2];
	}

	function handleKeyUp(e) {
		keys[e.key] = false;
	}

	function handleShoot(e) {
		if (gameState.gameOver || !gameState.gameStarted) return;

		const rect = document.querySelector('#game-canvas').getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const worldMouseX = mouseX + cameraOffset.x;
		const worldMouseY = mouseY + cameraOffset.y;
		const angle = Math.atan2(worldMouseY - gameState.player.y, worldMouseX - gameState.player.x);

		gameState.player.direction = { x: Math.cos(angle), y: Math.sin(angle) };

		if (gameState.player.energy >= gameState.player.weapon.energyCost) {
			gameState.player.energy -= gameState.player.weapon.energyCost;
			gameState.projectiles.push({
				x: gameState.player.x,
				y: gameState.player.y,
				dx: Math.cos(angle) * 10,
				dy: Math.sin(angle) * 10,
				damage: gameState.player.weapon.damage,
				lifetime: 60,
				type: 'player'
			});
		}
	}

	function spawnEnemies() {
		const room = gameState.rooms[gameState.currentRoom];
		const count = 3 + Math.floor(Math.random() * 3);
		gameState.enemies = [];

		for (let i = 0; i < count; i++) {
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

		// Player movement
		const speed = 5;
		if (keys['ArrowUp'] || keys['w']) gameState.player.y -= speed;
		if (keys['ArrowDown'] || keys['s']) gameState.player.y += speed;
		if (keys['ArrowLeft'] || keys['a']) gameState.player.x -= speed;
		if (keys['ArrowRight'] || keys['d']) gameState.player.x += speed;

		gameState.player.energy = Math.min(gameState.player.energy + 0.2, gameState.player.maxEnergy);

		// Enemy updates
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
					type: 'enemy'
				});
			}

			if (dist < 30) {
				gameState.player.health -= 0.5;
				if (gameState.player.health <= 0) gameState.gameOver = true;
			}
		}

		// Projectile updates
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
				for (let j = gameState.enemies.length - 1; j >= 0; j--) {
					const enemy = gameState.enemies[j];
					const dx = proj.x - enemy.x;
					const dy = proj.y - enemy.y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < 20) {
						enemy.health -= proj.damage;
						gameState.projectiles.splice(i, 1);

						if (enemy.health <= 0) {
							gameState.enemies.splice(j, 1);
							gameState.score += 100;
							if (Math.random() < 0.3) {
								gameState.player.energy = Math.min(
									gameState.player.energy + 20,
									gameState.player.maxEnergy
								);
							}
						}
						break;
					}
				}
			} else if (proj.type === 'enemy') {
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

		// Room transitions - FIXED ENEMY SPAWNING
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
					gameState.projectiles = [];
					spawnEnemies(); // THIS FIXES THE ENEMY SPAWNING
					break;
				}
			}
		}
	}

	function render() {}

	function startGame() {
		gameState = {
			player: {
				x: gameState.rooms[0].center.x,
				y: gameState.rooms[0].center.y,
				health: 100,
				maxHealth: 100,
				energy: 100,
				maxEnergy: 100,
				weapon: weapons[2],
				direction: { x: 1, y: 0 }
			},
			enemies: [],
			projectiles: [],
			currentRoom: 0,
			rooms: gameState.rooms,
			score: 0,
			gameOver: false,
			gameStarted: true
		};
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
			<div style="position: absolute; left: {-cameraOffset.x}px; top: {-cameraOffset.y}px;">
				<Dungeon rooms={gameState.rooms} currentRoom={gameState.currentRoom} />

				<Player
					x={gameState.player.x}
					y={gameState.player.y}
					direction={gameState.player.direction}
				/>

				{#each gameState.enemies as enemy (enemy.x + '-' + enemy.y)}
					<Enemy x={enemy.x} y={enemy.y} />
				{/each}

				{#each gameState.projectiles as proj (proj.x + '-' + proj.y)}
					<Projectile x={proj.x} y={proj.y} dx={proj.dx} dy={proj.dy} type={proj.type} />
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
			<div class="minimap-container">
				<div class="minimap" 
					 style="width: {minimap.width}px; 
							height: {minimap.height}px;
							background: {minimap.backgroundColor}">
					{#each getMinimapData().rooms as room}
						<div class="minimap-room {room.isCurrent ? 'current-room' : ''}"
							 style="left: {room.x}px;
									top: {room.y}px;
									width: {room.width}px;
									height: {room.height}px;">
						</div>
					{/each}
					
					<!-- Player indicator -->
					<div class="minimap-player"
						 style="left: {getMinimapData().player?.x || 0}px;
								top: {getMinimapData().player?.y || 0}px;
								width: {minimap.playerSize}px;
								height: {minimap.playerSize}px;">
					</div>
					
					<!-- Enemy indicators -->
					{#each getMinimapData().enemies as enemy}
						<div class="minimap-enemy"
							 style="left: {enemy.x}px;
									top: {enemy.y}px;
									width: {minimap.enemySize}px;
									height: {minimap.enemySize}px;">
						</div>
					{/each}
				</div>
			</div>
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


	/* Minimap Styles */
    .minimap-container {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 10;
        border: 2px solid #444;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .minimap {
        position: relative;
    }
    
    .minimap-room {
        position: absolute;
        background:  rgba(0, 0, 0, 0.7);
        border: 1px solid #aaa;
    }
    
    .current-room {
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid #FFF;
    }
    
    .minimap-player {
        position: absolute;
        background: #00ff00;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
    }
    
    .minimap-enemy {
        position: absolute;
        background: #ff0000;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }
</style>