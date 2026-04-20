import Peer from "peerjs";
import type { DataConnection } from "peerjs";
import type { Move, ProtocolSpec, StartGameData } from "./protocolSpec";

const peerSharedCode = "hybneskvorky_joincode_";

export class ConnectionMgr {
  peer: Peer | undefined = undefined;
  connection: DataConnection | undefined = undefined;

  #onMoveReceived: (move: Move) => void;
  #onStartGameReceived: (startGameData: StartGameData) => void;

  constructor({
    onMoveReceived,
    onStartGameReceived,
  }: {
    onMoveReceived: (move: Move) => void;
    onStartGameReceived: (startGameData: StartGameData) => void;
  }) {
    this.#onMoveReceived = onMoveReceived;
    this.#onStartGameReceived = onStartGameReceived;
  }

  newPeerServer(userCode: string, onFinished: (success: boolean) => void) {
    this.closeConnection();
    this.peer = new Peer(peerSharedCode + userCode);

    this.peer.on("connection", (connection) => {
      this.connection = connection;
      this.#setupConnection(onFinished);
    });
  }

  newPeerClient(userJoinCode: string, onFinished: (success: boolean) => void) {
    this.closeConnection();
    this.peer = new Peer();

    const peerJoinCode = peerSharedCode + userJoinCode;
    this.peer.on("open", () => {
      this.connection = this.peer!.connect(peerJoinCode);
      this.#setupConnection(onFinished);
    });
  }

  sendData(data: ProtocolSpec) {
    console.log("Sent:", data);
    this.connection?.send(data);
  }

  closeConnection(): void {
    this.connection = undefined;
    if (this.peer === undefined) {
      return;
    }
    console.log("connection closed");
    this.peer.destroy();
  }

  // must be called in onConnection handler
  #setupConnection(onFinished: (success: boolean) => void): void {
    this.connection!.on("open", () => {
      onFinished(true);
      // data handler; I know I should implement proper type checking, but I'm to lazy to do so
      this.connection?.on("data", (data: any) => {
        console.log("Received:", data);
        if (data?.type === "move") {
          this.#onMoveReceived(data as Move);
          return;
        }
        if (data?.type === "start") {
          this.#onStartGameReceived(data as StartGameData);
          return;
        }
      });
    });
  }
}
