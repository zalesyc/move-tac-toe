import type { GameBoard } from "./board";
import type { ConnectionMgr } from "./connectionMgr";

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

export interface GlobalState {
  playingPlayer: Player;
  gameEnded: boolean;
  board: GameBoard;
  connectionMgr: ConnectionMgr;
  onlinePlayer: Player | null; // if null, the game is local
  availableMoves: { start: Position; moves: Array<Position> } | null;
}

export interface NewGameData {
  size: number;
  winLength: number;
  allowDiagonalMoves: boolean;
}

export function randomNumber(max: number): number {
  return Math.floor(Math.random() * max);
}

export const peerCodeCharacters = "abcdefghijklmnopqrstuvwxyz123456789";
