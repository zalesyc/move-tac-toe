import type WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import type WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import { peerCodeCharacters, randomNumber, type NewGameData } from "./utils";

export function newGameDialogSetup({
  onNewLocalGame,
  onNewOnlineGame,
  onClosedWaitingForConnection,
}: {
  onNewLocalGame: (data: NewGameData) => void;
  onNewOnlineGame: (
    gameData: NewGameData,
    peerCode: string,
    onFinished: (error: string | null) => void,
  ) => void;
  onClosedWaitingForConnection: () => void;
}): void {
  const dialog = document.querySelector("#new-game-dialog")! as WaDialog;
  const newGameForm = document.querySelector("#new-game-form")!;
  const waitForConnectionDiv = document.querySelector(
    "#online-game-wait-for-connection",
  )!;
  const connectionCodeLabel = document.querySelector("#connection-code-label")!;

  document.querySelector("#new-game-btn")?.addEventListener("click", () => {
    dialog?.toggleAttribute("open");
    newGameForm.removeAttribute("hidden");
    waitForConnectionDiv.setAttribute("hidden", "");
  });

  let isOnline = false;
  dialog.addEventListener("wa-after-hide", () => {
    if (isOnline) {
      onClosedWaitingForConnection();
    }   
  });

  // TODO: data validation

  newGameForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(newGameForm as HTMLFormElement);

    isOnline =
      (e as SubmitEvent).submitter?.classList.contains("new-online-game") ??
      false;

    const newGameData: NewGameData = {
      size: parseInt((data.get("board-size") as string | null) ?? "4"),
      winLength: parseInt((data.get("win-len") as string | null) ?? "3"),
      allowDiagonalMoves: data.get("allow-diagonals") === "on",
    };

    if (!isOnline) {
      dialog.toggleAttribute("open");
      onNewLocalGame(newGameData);
      return;
    }

    console.log("online");
    newGameForm.setAttribute("hidden", "");
    const peerUserCode = `${peerCodeCharacters[randomNumber(35)]}${peerCodeCharacters[randomNumber(35)]}${peerCodeCharacters[randomNumber(35)]}${peerCodeCharacters[randomNumber(35)]}`;
    connectionCodeLabel.innerHTML = peerUserCode.toUpperCase();
    waitForConnectionDiv.removeAttribute("hidden");

    onNewOnlineGame(newGameData, peerUserCode, (error) => {
      if (error === null) {
        dialog.toggleAttribute("open");
        isOnline = false;
        return;
      }
      console.log("connecting unsuccessful; e: ", error); // TODO: proper handling
    });
  });
}

//connectionFinished:success:if null, then close the dialog, otherwise show the error
export function joinGameDialogSetup(
  onJoinCode: (
    userCode: string,
    onFinished: (error: string | null) => void,
  ) => void,
) {
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

    const connectionCode = (connectionCodeData as String).toLowerCase();

    codeInput.toggleAttribute("disabled");
    joinBtn.toggleAttribute("disabled");
    progressBar.removeAttribute("hidden");

    onJoinCode(connectionCode, (error) => {
      if (error === null) {
        dialog.toggleAttribute("open");
        return;
      }
      console.log("connection unsuccessful; e: ", error); // TODO: proper handling
    });
  });
}
