export function generateDungeon(roomCount, canvasWidth = 800, canvasHeight = 600) {
  const rooms = [];
  const minRoomSize = 300;
  const maxRoomSize = 500;
  const margin = 30;
  const maxAttempts = 200;
  const connectionWidth = 40;

  // Helper function to check overlaps
  function isOverlapping(newRoom, ignoreRoom = null) {
    return rooms.some(room => {
      if (ignoreRoom && room === ignoreRoom) return false;
      return (
        newRoom.x < room.x + room.width + margin &&
        newRoom.x + newRoom.width + margin > room.x &&
        newRoom.y < room.y + room.height + margin &&
        newRoom.y + newRoom.height + margin > room.y
      );
    });
  }

  // Create connection between rooms
  function connectRooms(room1, room2) {
    const overlapStart = {
      x: Math.max(room1.x, room2.x),
      y: Math.max(room1.y, room2.y)
    };
    const overlapEnd = {
      x: Math.min(room1.x + room1.width, room2.x + room2.width),
      y: Math.min(room1.y + room1.height, room2.y + room2.height)
    };

    // Vertical connection
    if (overlapEnd.x - overlapStart.x > connectionWidth) {
      const centerX = (overlapStart.x + overlapEnd.x) / 2;
      return {
        x: centerX - connectionWidth/2,
        y: room1.y < room2.y ? room1.y + room1.height : room2.y + room2.height,
        width: connectionWidth,
        height: Math.abs(room1.center.y - room2.center.y) - room1.height/2 - room2.height/2
      };
    }
    // Horizontal connection
    else if (overlapEnd.y - overlapStart.y > connectionWidth) {
      const centerY = (overlapStart.y + overlapEnd.y) / 2;
      return {
        x: room1.x < room2.x ? room1.x + room1.width : room2.x + room2.width,
        y: centerY - connectionWidth/2,
        width: Math.abs(room1.center.x - room2.center.x) - room1.width/2 - room2.width/2,
        height: connectionWidth
      };
    }
    return null;
  }

  // Generate first room near center
  const firstRoom = {
    x: Math.floor(canvasWidth/2 - minRoomSize/2),
    y: Math.floor(canvasHeight/2 - minRoomSize/2),
    width: minRoomSize,
    height: minRoomSize,
    center: { x: 0, y: 0 }, // Calculated below
    connections: []
  };
  firstRoom.center = {
    x: firstRoom.x + firstRoom.width/2,
    y: firstRoom.y + firstRoom.height/2
  };
  rooms.push(firstRoom);

  // Generate additional rooms
  for (let i = 1; i < roomCount; i++) {
    let newRoom = null;
    let parentRoom = null;
    let connection = null;
    let attempts = 0;

    while (attempts < maxAttempts && !newRoom) {
      attempts++;
      parentRoom = rooms[Math.floor(Math.random() * rooms.length)];
      
      // Random room size
      const width = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize));
      const height = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize));

      // Try all 4 directions
      const directions = [
        { x: parentRoom.x + parentRoom.width + margin, y: parentRoom.y }, // Right
        { x: parentRoom.x - width - margin, y: parentRoom.y }, // Left
        { x: parentRoom.x, y: parentRoom.y + parentRoom.height + margin }, // Down
        { x: parentRoom.x, y: parentRoom.y - height - margin } // Up
      ];

      for (const dir of directions) {
        const testRoom = {
          x: dir.x,
          y: dir.y,
          width,
          height,
          center: { x: dir.x + width/2, y: dir.y + height/2 },
          connections: []
        };

        if (!isOverlapping(testRoom, parentRoom)) {
          connection = connectRooms(parentRoom, testRoom);
          if (connection && !isOverlapping(connection)) {
            newRoom = testRoom;
            parentRoom.connections.push(connection);
            newRoom.connections.push(connection);
            break;
          }
        }
      }
    }

    if (newRoom) {
      rooms.push(newRoom);
    } else {
      console.warn(`Failed to place room ${i} after ${maxAttempts} attempts`);
    }
  }

  return {
    roomsArray: rooms, // The original array format
    dungeonData: {    // The enhanced object format
      rooms,
      startRoom: 0,
      bossRoom: rooms.length - 1,
      connections: rooms.flatMap(room => room.connections)
    }
  };
}