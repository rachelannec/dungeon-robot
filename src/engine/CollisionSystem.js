// CollisionSystem.js
export class CollisionSystem {
  constructor() {
    this.collisionMaps = new Map();
  }

  async loadCollisionMap(spriteUrl) {
    if (this.collisionMaps.has(spriteUrl)) {
      return this.collisionMaps.get(spriteUrl);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = spriteUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const collisionMap = [];
        
        for (let y = 0; y < img.height; y++) {
          collisionMap[y] = [];
          for (let x = 0; x < img.width; x++) {
            const alpha = imageData.data[(y * img.width + x) * 4 + 3];
            collisionMap[y][x] = alpha > 128; // Consider pixel solid if alpha > 50%
          }
        }
        
        this.collisionMaps.set(spriteUrl, collisionMap);
        resolve(collisionMap);
      };
    });
  }

  checkPixelCollision(sprite1, sprite2) {
    // Get bounding box intersection first for performance
    if (!this.boundingBoxCollision(sprite1, sprite2)) return false;
    
    // Get collision maps
    const map1 = this.collisionMaps.get(sprite1.image.src);
    const map2 = this.collisionMaps.get(sprite2.image.src);
    
    // Calculate overlap area
    const left = Math.max(sprite1.x, sprite2.x);
    const right = Math.min(sprite1.x + sprite1.width, sprite2.x + sprite2.width);
    const top = Math.max(sprite1.y, sprite2.y);
    const bottom = Math.min(sprite1.y + sprite1.height, sprite2.y + sprite2.height);
    
    // Check each pixel in overlap area
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        const x1 = x - sprite1.x;
        const y1 = y - sprite1.y;
        const x2 = x - sprite2.x;
        const y2 = y - sprite2.y;
        
        if (map1[y1][x1] && map2[y2][x2]) {
          return true;
        }
      }
    }
    
    return false;
  }

  boundingBoxCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}