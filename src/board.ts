import { type Tile, type Position, Player, type Piece } from "./utils";

const baseStyle = `
.tile {
  border: 1px solid gray;
}

.piece {
  position: absolute;
  width: calc((100% / var(--board-size)) * 0.3);
  height: calc((100% / var(--board-size)) * 0.3);
  border-radius: 5px;
  pointer-events: none;
  box-shadow: 1px 2px 3px rgb(20 20 20 / 0.2);
  translate: -50% -50%;
  transition: all 50ms ease-in-out;
}

.piece-player1 {
  background-color: var(--player-1-color);
}

.piece-player2 {
  background-color: var(--player-2-color);
}

#board {
  display: grid;
  position: relative;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(var(--board-size), minmax(0, 1fr));
}

.tile.highlight {
  background-color: rgb(0 0 0 / 0.3);
}`;

export class GameBoard extends HTMLElement {
  #tiles: Array<Array<Tile>> = []; // in the format [y][x]
  #allowDiagonalMoves: boolean = true;
  #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  #winLength: number = 3;
  #board: HTMLElement;
  #highlightedTiles: Array<Position> = [];

  // size must be divisible by 2
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.#board = document.createElement("div");
    this.#board.setAttribute("id", "board");
    this.shadowRoot?.appendChild(this.#board);

    this.#styleSheet.replaceSync(baseStyle);

    this.shadowRoot!.adoptedStyleSheets.push(this.#styleSheet);

    this.newGame(4, 3, true);
  }

  newGame(size: number, winLength: number, allowDiagonalMoves: boolean) {
    this.#allowDiagonalMoves = allowDiagonalMoves;
    this.#winLength = winLength;
    this.#board.style.setProperty("--board-size", size.toString());
    if (this.#tiles.length > 0) {
      this.#board.innerHTML = "";
    }

    this.#tiles = Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => {
        const tile = this.#createTile({ x: x, y: y });
        this.#board.appendChild(tile);
        return { piece: null, gridElement: tile };
      }),
    );

    this.#populateRow(0, Player.Player1, 0);
    this.#populateRow(size - 1, Player.Player2, size);
    this.#render();
  }

  at(position: Position): Tile | undefined {
    if (position.x < 0 || position.y < 0) return undefined;
    return this.#tiles.at(position.y)?.at(position.x);
  }

  // there must be a piece on oldPos and newPos must be empty
  move(oldPos: Position, newPos: Position) {
    const oldTile = this.at(oldPos)!;
    const newTile = this.at(newPos)!;

    newTile.piece = oldTile.piece;
    oldTile.piece = null;
    this.#render([newPos]);
  }

  findAvailableMoves(start: Position): Array<Position> {
    const x = start.x;
    const y = start.y;
    let availableTiles: Array<Position> = [];

    if (this.#isEmpty({ x: x - 1, y: y })) {
      availableTiles.push({ x: x - 1, y: y });
    }
    if (this.#isEmpty({ x: x + 1, y: y })) {
      availableTiles.push({ x: x + 1, y: y });
    }
    if (this.#isEmpty({ x: x, y: y - 1 })) {
      availableTiles.push({ x: x, y: y - 1 });
    }
    if (this.#isEmpty({ x: x, y: y + 1 })) {
      availableTiles.push({ x: x, y: y + 1 });
    }

    // diagonal
    if (this.#allowDiagonalMoves) {
      if (this.#isEmpty({ x: x - 1, y: y - 1 })) {
        availableTiles.push({ x: x - 1, y: y - 1 });
      }
      if (this.#isEmpty({ x: x + 1, y: y + 1 })) {
        availableTiles.push({ x: x + 1, y: y + 1 });
      }
      if (this.#isEmpty({ x: x + 1, y: y - 1 })) {
        availableTiles.push({ x: x + 1, y: y - 1 });
      }
      if (this.#isEmpty({ x: x - 1, y: y + 1 })) {
        availableTiles.push({ x: x - 1, y: y + 1 });
      }
    }
    return availableTiles;
  }

  setHighlightedTiles(tiles: Array<Position>): void {
    for (const oldTile of this.#highlightedTiles) {
      this.at(oldTile)?.gridElement.classList.remove("highlight");
    }
    for (const newTile of tiles) {
      this.at(newTile)?.gridElement.classList.add("highlight");
    }
    this.#highlightedTiles = tiles;
  }

  winning(): Player | null {
    const directions = [
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    for (const [y, row] of this.#tiles.entries()) {
      for (const [x, start] of row.entries()) {
        for (const [directionX, directionY] of directions) {
          let isWinning = true;

          for (let i = 1; i < this.#winLength; i++) {
            const nextTile = this.at({
              y: y + directionY * i,
              x: x + directionX * i,
            });
            if (
              nextTile?.piece?.player == undefined ||
              nextTile?.piece?.player !== start.piece?.player
            ) {
              isWinning = false;
              break;
            }
          }
          if (isWinning) {
            return start.piece?.player ?? null;
          }
        }
      }
    }
    return null;
  }

  // if changes is array then only the positions in the
  // array will update, otherwise everything will update
  #render(changes?: Array<Position>): void {
    if (changes) {
      for (const position of changes) {
        const tile = this.at(position)!;
        if (tile.piece === null) {
          continue;
        }

        this.#board.style.setProperty(
          `--anchor-piece-${tile.piece.id}`,
          `--anchor-tile-${position.x}-${position.y}`,
        );
      }
      return;
    }

    for (const [y, row] of this.#tiles.entries()) {
      for (const [x, tile] of row.entries()) {
        if (tile.piece === null) {
          continue;
        }

        this.#board.style.setProperty(
          `--anchor-piece-${tile.piece.id}`,
          `--anchor-tile-${x}-${y}`,
        );
      }
    }
  }

  #populateRow(row: number, firstPiece: Player, startId: number): void {
    const secondPiece =
      firstPiece == Player.Player1 ? Player.Player2 : Player.Player1;

    for (let index = 0; index < this.#tiles[row].length; index++) {
      const piece = {
        id: index + startId,
        player: index % 2 == 0 ? firstPiece : secondPiece,
      };
      const element = this.#createPiece(piece);
      this.#tiles[row][index].piece = piece;

      this.#board.appendChild(element);
    }
  }

  #createPiece(piece: Piece): HTMLElement {
    const element = document.createElement("div");
    const elementId = `piece${piece.id}`;
    element.setAttribute("id", elementId);
    element.setAttribute("class", `piece piece-player${piece.player}`);
    this.#styleSheet.insertRule(
      `#${elementId} {
        left: anchor(var(--anchor-piece-${piece.id}) 50%);
        top: anchor(var(--anchor-piece-${piece.id}) 50%);
      }`,
    );
    return element;
  }

  #createTile(pos: Position): HTMLElement {
    let element = document.createElement("div");
    const elementId = `tile-${pos.x}-${pos.y}`;
    element.setAttribute("id", elementId);
    element.setAttribute("class", "tile");
    this.#styleSheet.insertRule(
      `#${elementId} { anchor-name: --anchor-tile-${pos.x}-${pos.y}; }`,
    );
    element.addEventListener("click", () =>
      this.dispatchEvent(new TileClickEvent(pos)),
    );
    return element;
  }

  #isEmpty(p: Position): boolean {
    const tile = this.at(p);
    if (tile === undefined) {
      return false;
    }
    return tile.piece === null;
  }
}

export class TileClickEvent extends Event {
  position: Position;

  constructor(pos: Position) {
    super("tile-click");
    this.position = pos;
  }
}
