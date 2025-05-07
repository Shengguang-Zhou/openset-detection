
import { Label } from "@/hooks/useDummyData";

// Format coordinates display for different label types
export function formatCoordinates(label: Label): string {
  if (label.type === 'rect' && label.coordinates?.length === 2) {
    const [topLeft, bottomRight] = label.coordinates;
    const x = Math.round(Math.min(topLeft[0], bottomRight[0]));
    const y = Math.round(Math.min(topLeft[1], bottomRight[1]));
    const width = Math.round(Math.abs(bottomRight[0] - topLeft[0]));
    const height = Math.round(Math.abs(bottomRight[1] - topLeft[1]));
    return `X:${x} Y:${y} W:${width} H:${height}`;
  } else if (label.type === 'polygon') {
    return `多边形: ${label.coordinates.length} 点`;
  } else {
    const [point] = label.coordinates;
    return `X:${Math.round(point[0])} Y:${Math.round(point[1])}`;
  }
}

// Get bounding box for any label type
export function getLabelBounds(label: Label): { x: number, y: number, width: number, height: number } {
  if (label.type === 'rect' && label.coordinates?.length === 2) {
    const [topLeft, bottomRight] = label.coordinates;
    const x = Math.min(topLeft[0], bottomRight[0]);
    const y = Math.min(topLeft[1], bottomRight[1]);
    const width = Math.abs(bottomRight[0] - topLeft[0]);
    const height = Math.abs(bottomRight[1] - topLeft[1]);
    return { x, y, width, height };
  } else if (label.type === 'point' && label.coordinates?.length === 1) {
    const [point] = label.coordinates;
    return { x: point[0] - 5, y: point[1] - 5, width: 10, height: 10 };
  } else if (label.type === 'polygon' && label.coordinates?.length > 0) {
    // For polygon, calculate the bounding box
    const xCoords = label.coordinates.map(coord => coord[0]);
    const yCoords = label.coordinates.map(coord => coord[1]);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    return {
      x: minX,
      y: minY, 
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  return { x: 0, y: 0, width: 0, height: 0 };
}

// Check if a point is inside a label
export function isPointInLabel(label: Label, x: number, y: number): boolean {
  if (label.type === 'rect' && label.coordinates?.length === 2) {
    const [topLeft, bottomRight] = label.coordinates;
    const minX = Math.min(topLeft[0], bottomRight[0]);
    const maxX = Math.max(topLeft[0], bottomRight[0]);
    const minY = Math.min(topLeft[1], bottomRight[1]);
    const maxY = Math.max(topLeft[1], bottomRight[1]);
    
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else if (label.type === 'point' && label.coordinates?.length === 1) {
    const [point] = label.coordinates;
    // Use a radius of 10 pixels around the point
    const dx = x - point[0];
    const dy = y - point[1];
    return Math.sqrt(dx * dx + dy * dy) <= 10;
  } else if (label.type === 'polygon' && label.coordinates?.length > 2) {
    // Ray casting algorithm for polygon
    let inside = false;
    for (let i = 0, j = label.coordinates.length - 1; i < label.coordinates.length; j = i++) {
      const xi = label.coordinates[i][0], yi = label.coordinates[i][1];
      const xj = label.coordinates[j][0], yj = label.coordinates[j][1];
      
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  
  return false;
}

// Get label type icon component name
export function getLabelTypeIconName(type: string): string {
  switch (type) {
    case 'rect':
      return 'RectangleHorizontal';
    case 'polygon':
      return 'Hexagon';
    case 'point':
      return 'CircleDot';
    default:
      return 'Tag';
  }
}
