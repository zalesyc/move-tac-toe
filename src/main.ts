import { GameBoard, TileClickEvent } from "./board";
import { type Position, Player } from "./utils";

function main() {
  const board = document.querySelector("#board")! as GameBoard;
  board!.addEventListener("tile-click", (e) =>
    onTileClick(board, (e as TileClickEvent).position),
  );
  const newGameDialog = document.querySelector(
    "#new-game-dialog",
  ) as HTMLDialogElement;
  document
    .querySelector("#new-game-btn")
    ?.addEventListener("click", () => newGameDialog.showModal());

  document.querySelector("#new-game-form")?.addEventListener("submit", (e) => {
    if ((e as SubmitEvent).submitter?.id === "new-game-close-btn") {
      return;
    }
    const data = new FormData(
      document.querySelector("#new-game-form") as HTMLFormElement,
    );

    // TODO: data validation

    board.newGame(
      parseInt((data.get("board-size") as string | null) ?? "4"),
      parseInt((data.get("win-len") as string | null) ?? "3"),
      data.get("allow-diagonals") === "on",
    );
    gameEnded = false;
  });
}

function onTileClick(board: GameBoard, position: Position): void {
  if (gameEnded) {
    return;
  }

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

    if (playingPlayer == Player.Player2) {
      playingPlayer = Player.Player1;
      document
        .getElementById("currently-playing")
        ?.classList.remove("player-2");
    } else {
      playingPlayer = Player.Player2;
      document.getElementById("currently-playing")?.classList.add("player-2");
    }

    const winning = board.winning();
    if (winning) {
      document.querySelector("#win-player-text")!.innerHTML =
        `${winning == Player.Player1 ? "red" : "green"}`;
      (document.querySelector("#win-dialog") as HTMLDialogElement).showModal();
      gameEnded = true;
    }
  }
}

customElements.define("game-board", GameBoard);
let playingPlayer: Player = Player.Player1;
let gameEnded = false;
let availableMoves: { start: Position; moves: Array<Position> } | null = null;

main();
