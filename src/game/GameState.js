import { writable } from 'svelte/store';
import { weapons } from '../weapons';

// Export initialState function
export const initialState = () => ({
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
});

// Create writable store
export const gameState = writable(initialState());

// Initialize function
export function initGameState(rooms) {
	gameState.update(state => ({
		...initialState(),
		rooms: rooms || state.rooms
	}));
}