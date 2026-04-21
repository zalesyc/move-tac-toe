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
import { allDefined } from "@awesome.me/webawesome";

import { GameBoard, TileClickEvent } from "./board";
import {
  type GlobalState,
  type NewGameData,
  type Position,
  Player,
} from "./utils";

import { joinGameDialogSetup, newGameDialogSetup } from "./uiSetup";
import { ConnectionMgr } from "./connectionMgr";

async function main() {
  await allDefined();

  const state: GlobalState = {
    playingPlayer: Player.Player1,
    onlinePlayer: null,
    gameEnded: false,
    availableMoves: null,
    board: document.querySelector("#board")! as GameBoard,
    connectionMgr: new ConnectionMgr({
      onStartGameReceived: (startGameData) => {
        newGame(state, startGameData.newGame, startGameData.player);
      },

      onMoveReceived: (moveData) => {
        move(state, moveData.oldPos, moveData.newPos, true);
      },
    }),
  };

  state.board!.addEventListener("tile-click", (e) =>
    onTileClick(state, (e as TileClickEvent).position),
  );

  newGameDialogSetup({
    onNewLocalGame: (data) => {
      newGame(state, data);
    },

    onNewOnlineGame: (newGameData, peerUserCode, onFinished) => {
      state.connectionMgr.newPeerServer(peerUserCode, (success) => {
        onFinished(success ? null : "error");
        newGame(state, newGameData, Player.Player1);
        state.connectionMgr.sendData({
          type: "start",
          player: Player.Player2,
          newGame: newGameData,
        });
      });
    },
    onClosedWaitingForConnection: () => state.connectionMgr.closeConnection(),
  });

  joinGameDialogSetup((userJoinCode, onFinished) => {
    state.connectionMgr.newPeerClient(userJoinCode, (success) =>
      onFinished(success ? null : "error"),
    );
  });

  newGame(state, { size: 4, winLength: 3, allowDiagonalMoves: true });
}

function newGame(
  state: GlobalState,
  data: NewGameData,
  onlinePlayer: Player | null = null,
) {
  state.onlinePlayer = onlinePlayer;
  state.gameEnded = false;
  state.board.newGame(data);

  const yourPlayer = document.querySelector("#you-are-player")!;
  if (state.onlinePlayer === null) {
    yourPlayer.setAttribute("hidden", "");
  } else {
    const yourPlayerIndicator = document.querySelector(
      "#you-are-player-indicator",
    )!;

    yourPlayer.removeAttribute("hidden");
    if (state.onlinePlayer == Player.Player1) {
      yourPlayerIndicator.classList.remove("player-2");
    } else {
      yourPlayerIndicator.classList.add("player-2");
    }
  }
}

function move(
  state: GlobalState,
  oldPos: Position,
  newPos: Position,
  wasReceived: boolean = false,
) {
  if (state.gameEnded) {
    return;
  }

  state.board.move(oldPos, newPos);

  if (state.onlinePlayer !== null && !wasReceived) {
    state.connectionMgr.sendData({
      type: "move",
      oldPos: oldPos,
      newPos: newPos,
    });
  }

  if (state.playingPlayer == Player.Player2) {
    state.playingPlayer = Player.Player1;
    document.getElementById("currently-playing")?.classList.remove("player-2");
  } else {
    state.playingPlayer = Player.Player2;
    document.getElementById("currently-playing")?.classList.add("player-2");
  }

  const winning = state.board.winning();
  if (winning) {
    state.gameEnded = true;
    state.connectionMgr.closeConnection();

    showWinDialog(winning);
  }
}

function onTileClick(state: GlobalState, pos: Position) {
  if (state.gameEnded) {
    return;
  }
  const tile = state.board.at(pos)!;

  if (
    tile.piece !== null &&
    tile.piece.player === state.playingPlayer &&
    (state.onlinePlayer === null || state.onlinePlayer === state.playingPlayer)
  ) {
    const moves = state.board.findAvailableMoves(pos);
    state.board.setHighlightedTiles(moves);
    state.availableMoves = { moves: moves, start: pos };
    return;
  }

  if (
    state.availableMoves &&
    state.availableMoves.moves.some((e) => e.x == pos.x && e.y == pos.y)
  ) {
    move(state, state.availableMoves.start, pos);
    state.board.setHighlightedTiles([]);
    state.availableMoves = null;
  }
}

function showWinDialog(winner: Player) {
  const winDialog = document.querySelector("#win-dialog")!;
  const winningPlayerLabel = document.querySelector("#win-player-name")!; 
  if (winner == Player.Player1) {
    winDialog.classList.remove("player-2");
    winningPlayerLabel.innerHTML = "Červený"
  } else {
    winDialog.classList.add("player-2");  
    winningPlayerLabel.innerHTML = "Zelený"
  }

 winDialog.toggleAttribute("open");
}

customElements.define("game-board", GameBoard);

main();
