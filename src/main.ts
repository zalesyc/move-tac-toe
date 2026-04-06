import { GameBoard, TileClickEvent } from "./board";
import { type Position, Player } from "./utils";

function main() {
  const board = document.querySelector("#board")! as GameBoard;
  board!.addEventListener("tile-click", (e) =>
    onTileClick(board, (e as TileClickEvent).position),
  );
}

function onTileClick(board: GameBoard, position: Position): void {
  const tile = board.at(position)!;

  if (tile.piece !== null && tile.piece.player === playingPlayer) {
    const moves = board.findAvailableMoves(position);
    board.setHighlightedTiles(moves);
    availableMoves = { moves: moves, start: position };
    return;
  }

  if (
    availableMoves &&
    availableMoves.moves.some((e) => e.x === position.x && e.y === position.y)
  ) {
    board.move(availableMoves.start, position);
    board.setHighlightedTiles([]);
    availableMoves = null;
    playingPlayer =
      playingPlayer == Player.Player1 ? Player.Player2 : Player.Player1;
    document.getElementById("curently-playing")!.innerHTML =
      playingPlayer == Player.Player1 ? "red" : "green";
    const winning = board.winning();
    if (winning) {
      alert(`${winning == Player.Player1 ? "red" : "green"} has won`);
    }
  }
}

customElements.define("game-board", GameBoard);
let playingPlayer: Player = Player.Player1;
let availableMoves: { start: Position; moves: Array<Position> } | null = null;
main();
