export function generateDungeon(roomCount, canvasWidth = 800, canvasHeight = 600) {
  const rooms = [];
  const roomSize = 300;
  const margin = 50;
  const maxAttempts = 100; // To avoid infinite loops

  // Helper function to check if a new room overlaps with existing ones
  function isOverlapping(newRoom) {
    return rooms.some(room =>
      newRoom.x < room.x + room.width + margin &&
      newRoom.x + newRoom.width + margin > room.x &&
      newRoom.y < room.y + room.height + margin &&
      newRoom.y + newRoom.height + margin > room.y
    );
  }

  // Generate the first room at the center of the canvas
  const firstRoom = {
    x: 0,
    y: 0,
    width: roomSize,
    height: roomSize,
    center: {
      x: roomSize / 2,
      y: roomSize / 2,
    },
  };
  rooms.push(firstRoom);

  // Generate subsequent rooms
  for (let i = 1; i < roomCount; i++) {
    let newRoom = null;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const prevRoom = rooms[Math.floor(Math.random() * rooms.length)];
      const direction = Math.floor(Math.random() * 4);

      let x = prevRoom.x;
      let y = prevRoom.y;

      // Determine room position based on direction
      switch (direction) {
        case 0: // Right
          x = prevRoom.x + prevRoom.width + margin;
          break;
        case 1: // Left
          x = prevRoom.x - roomSize - margin;
          break;
        case 2: // Down
          y = prevRoom.y + prevRoom.height + margin;
          break;
        case 3: // Up
          y = prevRoom.y - roomSize - margin;
          break;
      }

      newRoom = {
        x,
        y,
        width: roomSize,
        height: roomSize,
        center: {
          x: x + roomSize / 2,
          y: y + roomSize / 2,
        },
      };

      // Add the room if it doesn't overlap with existing ones
      if (!isOverlapping(newRoom)) {
        rooms.push(newRoom);
        break;
      }
    }

    if (!newRoom) {
      console.warn(`Failed to place room ${i + 1} after ${maxAttempts} attempts`);
    }
  }

  return rooms;
}
