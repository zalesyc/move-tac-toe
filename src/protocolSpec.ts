import type { Player, Position, NewGameData } from "./utils";

export interface Move {
  type: "move";
  oldPos: Position;
  newPos: Position;
}

export interface StartGameData {
  type: "start";
  player: Player; // which player the receiving player is
  newGame: NewGameData;
}

export type ProtocolSpec = Move | StartGameData;
