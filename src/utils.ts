export interface Position {
  x: number;
  y: number;
}

export enum Player {
  Player1 = 1,
  Player2 = 2,
}

export interface Piece {
  id: number; // in the format #tile{htmlId}
  player: Player;
}

export interface Tile {
  piece: Piece | null;
  gridElement: HTMLElement;
}
