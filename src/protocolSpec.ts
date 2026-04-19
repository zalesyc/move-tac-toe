import type { Player, Position } from "./utils";

export type ProtocolSpec =
  | {
      type: "move";
      start: Position;
      end: Position;
    }
  | {
      type: "start";
      boardSize: number;
      winLength: number;
      allowDiagonals: boolean;
      player: Player; // which player is the receiving player
    };
