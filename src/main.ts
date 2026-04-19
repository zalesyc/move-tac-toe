import "@awesome.me/webawesome/dist/styles/webawesome.css";
// components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/tab/tab.js";
import "@awesome.me/webawesome/dist/components/tab-group/tab-group.js";
import "@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";
import "@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js";

import { GameBoard, TileClickEvent } from "./board";
import { type Position, Player } from "./utils";

import { allDefined } from "@awesome.me/webawesome";
import type WaInput from "@awesome.me/webawesome/dist/components/input/input.js";

async function main() {
  const board = document.querySelector("#board")! as GameBoard;
  board!.addEventListener("tile-click", (e) =>
    onTileClick(board, (e as TileClickEvent).position),
  );

  await allDefined();
  newGameDialogSetup(board);
  joinGameDialogSetup();
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
      // document.querySelector("#win-player-text")!.innerHTML =
      //   `${winning == Player.Player1 ? "red" : "green"}`;
      document.querySelector("#win-dialog")?.toggleAttribute("open");
      gameEnded = true;
    }
  }
}

function newGameDialogSetup(board: GameBoard) {
  const newGameDialog = document.querySelector("#new-game-dialog");
  const newGameForm = document.querySelector("#new-game-form")!;
  const waitForConnectionDiv = document.querySelector(
    "#online-game-wait-for-connection",
  )!;

  document.querySelector("#new-game-btn")?.addEventListener("click", () => {
    newGameDialog?.toggleAttribute("open");
    newGameForm.removeAttribute("hidden");
    waitForConnectionDiv.setAttribute("hidden", "");
  });

  // TODO: data validation

  newGameForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if ((e as SubmitEvent).submitter?.classList.contains("new-online-game")) {
      console.log("online");
      newGameForm.setAttribute("hidden", "");
      waitForConnectionDiv.removeAttribute("hidden");
      return;
    }
    const data = new FormData(newGameForm as HTMLFormElement);

    board.newGame(
      parseInt((data.get("board-size") as string | null) ?? "4"),
      parseInt((data.get("win-len") as string | null) ?? "3"),
      data.get("allow-diagonals") === "on",
    );
    newGameDialog?.toggleAttribute("open");
    gameEnded = false;
  });
}

function joinGameDialogSetup() {
  const dialog = document.querySelector("#join-game-dialog")!;
  const joinGameBtn = document.querySelector("#join-game-btn")!;
  const joinBtn = document.querySelector("#join-game-dialog .join-btn")!;
  const progressBar = document.querySelector(
    "#join-game-dialog .connection-progress",
  )!;
  const joinForm = document.querySelector(
    "#join-online-form",
  )! as HTMLFormElement;
  const codeInput = document.querySelector(
    "#join-game-dialog .join-input",
  ) as WaInput;

  joinGameBtn.addEventListener("click", () => {
    dialog.toggleAttribute("open");
    codeInput.removeAttribute("disabled");
    joinBtn.removeAttribute("disabled");
    progressBar.setAttribute("hidden", "");
  });

  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const connectionCodeData = new FormData(joinForm).get("connection-code");
    if (!connectionCodeData) {
      return;
    }

    const connectionCode = (connectionCodeData as String).toUpperCase();

    codeInput.toggleAttribute("disabled");
    joinBtn.toggleAttribute("disabled");
    progressBar.removeAttribute("hidden");

    console.log("connectionCode:", connectionCode);
  });
}

customElements.define("game-board", GameBoard);
let playingPlayer: Player = Player.Player1;
let gameEnded = false;
let availableMoves: { start: Position; moves: Array<Position> } | null = null;

main();
