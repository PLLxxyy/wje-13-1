const BOARD_SIZE = 8;
const COLOR_COUNT = 5;
const COLORS = ["color-0", "color-1", "color-2", "color-3", "color-4"];

const NORMAL = 0;
const STONE = 1;
const LINE_H = 2;
const LINE_V = 3;
const BOMB = 4;

class Game {
  constructor() {
    this.board = [];
    this.selected = null;
    this.score = 0;
    this.moves = 0;
    this.target = 1000;
    this.level = 1;
    this.isProcessing = false;
    this.boardEl = document.getElementById("board");
    this.scoreEl = document.getElementById("score");
    this.movesEl = document.getElementById("moves");
    this.targetEl = document.getElementById("target");
    this.levelEl = document.getElementById("level");
    this.progressEl = document.getElementById("progressFill");
    this.overlayEl = document.getElementById("overlay");
    this.modalTitleEl = document.getElementById("modalTitle");
    this.modalTextEl = document.getElementById("modalText");
    this.modalBtn = document.getElementById("modalBtn");
    this.restartBtn = document.getElementById("restartBtn");
    this.modalBtn.addEventListener("click", () => this.handleModalAction());
    this.restartBtn.addEventListener("click", () => this.restartGame());
  }

  getLevelConfig(level) {
    return {
      moves: Math.max(15, 30 - (level - 1) * 2),
      target: 1000 + (level - 1) * 800,
      stoneCount: Math.min(level - 1, 6)
    };
  }

  startGame(level = 1) {
    this.level = level;
    this.score = 0;
    this.selected = null;
    this.isProcessing = false;
    const cfg = this.getLevelConfig(level);
    this.moves = cfg.moves;
    this.target = cfg.target;
    this.hideModal();
    this.generateBoard(cfg.stoneCount);
    this.render();
    this.updateUI();
  }

  restartGame() {
    this.startGame(1);
  }

  handleModalAction() {
    if (this.score >= this.target) {
      this.startGame(this.level + 1);
    } else {
      this.restartGame();
    }
  }

  createCell(color, type = NORMAL) {
    return { color, type };
  }

  generateBoard(stoneCount) {
    this.board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        row.push(this.createCell(this.randomColor()));
      }
      this.board.push(row);
    }

    let stonesPlaced = 0;
    let attempts = 0;
    while (stonesPlaced < stoneCount && attempts < 200) {
      const r = Math.floor(Math.random() * BOARD_SIZE);
      const c = Math.floor(Math.random() * BOARD_SIZE);
      if (this.board[r][c].type !== STONE) {
        this.board[r][c] = this.createCell(-1, STONE);
        stonesPlaced++;
      }
      attempts++;
    }

    while (this.findMatches().length > 0) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (this.board[r][c].type === NORMAL) {
            this.board[r][c] = this.createCell(this.randomColor());
          }
        }
      }
    }
  }

  randomColor() {
    return Math.floor(Math.random() * COLOR_COUNT);
  }

  inBounds(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
  }

  isAdjacent(a, b) {
    return (Math.abs(a.r - b.r) === 1 && a.c === b.c) ||
           (Math.abs(a.c - b.c) === 1 && a.r === b.r);
  }

  handleTileClick(r, c) {
    if (this.isProcessing || this.moves <= 0) return;
    const cell = this.board[r][c];
    if (cell.type === STONE) return;

    if (this.selected === null) {
      this.selected = { r, c };
      this.render();
      return;
    }

    if (this.selected.r === r && this.selected.c === c) {
      this.selected = null;
      this.render();
      return;
    }

    if (this.isAdjacent(this.selected, { r, c })) {
      this.trySwap(this.selected, { r, c });
    } else {
      this.selected = { r, c };
      this.render();
    }
  }

  async trySwap(a, b) {
    this.isProcessing = true;
    this.swapCells(a, b);
    this.selected = null;
    this.render();

    const matches = this.findMatches();
    if (matches.length === 0) {
      await this.delay(200);
      this.shakeTiles([a, b]);
      await this.delay(300);
      this.swapCells(a, b);
      this.render();
      this.isProcessing = false;
      return;
    }

    this.moves--;
    this.updateUI();
    await this.processMatches();
    this.checkGameEnd();
    this.isProcessing = false;
  }

  shakeTiles(positions) {
    positions.forEach(p => {
      const el = this.getTileEl(p.r, p.c);
      if (el) {
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 300);
      }
    });
  }

  swapCells(a, b) {
    const tmp = this.board[a.r][a.c];
    this.board[a.r][a.c] = this.board[b.r][b.c];
    this.board[b.r][b.c] = tmp;
  }

  getTileEl(r, c) {
    return this.boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  }

  findMatches() {
    const matched = new Set();
    const groups = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      let c = 0;
      while (c < BOARD_SIZE) {
        const cell = this.board[r][c];
        if (cell.type === STONE || cell.type === NORMAL) {
          const color = cell.color;
          let end = c + 1;
          while (end < BOARD_SIZE) {
            const nc = this.board[r][end];
            if (nc.type === STONE) break;
            if (nc.color !== color) break;
            end++;
          }
          const len = end - c;
          if (len >= 3 && cell.type !== STONE) {
            const group = [];
            for (let i = c; i < end; i++) {
              group.push({ r, c: i });
              matched.add(`${r},${i}`);
            }
            groups.push({ cells: group, direction: "h", length: len, color });
          }
          c = end;
        } else {
          c++;
        }
      }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
      let r = 0;
      while (r < BOARD_SIZE) {
        const cell = this.board[r][c];
        if (cell.type === STONE || cell.type === NORMAL) {
          const color = cell.color;
          let end = r + 1;
          while (end < BOARD_SIZE) {
            const nc = this.board[end][c];
            if (nc.type === STONE) break;
            if (nc.color !== color) break;
            end++;
          }
          const len = end - r;
          if (len >= 3 && cell.type !== STONE) {
            const group = [];
            for (let i = r; i < end; i++) {
              group.push({ r: i, c });
              matched.add(`${i},${c}`);
            }
            groups.push({ cells: group, direction: "v", length: len, color });
          }
          r = end;
        } else {
          r++;
        }
      }
    }

    return groups;
  }

  async processMatches() {
    let cascade = 0;
    while (true) {
      const groups = this.findMatches();
      if (groups.length === 0) break;
      cascade++;
      await this.removeMatches(groups, cascade);
      await this.delay(350);
      this.applyGravity();
      this.render(true);
      await this.delay(400);
    }
  }

  async removeMatches(groups, cascade) {
    const toRemove = new Map();
    const specialSpawns = [];

    for (const group of groups) {
      const len = group.length;
      if (len >= 5) {
        const mid = group.cells[Math.floor(group.cells.length / 2)];
        specialSpawns.push({ r: mid.r, c: mid.c, color: group.color, type: BOMB });
      } else if (len === 4) {
        const mid = group.cells[1];
        const type = group.direction === "h" ? LINE_H : LINE_V;
        specialSpawns.push({ r: mid.r, c: mid.c, color: group.color, type });
      }
      for (const pos of group.cells) {
        toRemove.set(`${pos.r},${pos.c}`, { ...pos, color: group.color });
      }
    }

    const triggeredSpecials = new Set();
    for (const [key, pos] of toRemove) {
      const cell = this.board[pos.r][pos.c];
      if (cell.type === LINE_H || cell.type === LINE_V || cell.type === BOMB) {
        if (!triggeredSpecials.has(key)) {
          triggeredSpecials.add(key);
          this.triggerSpecial(pos.r, pos.c, cell, toRemove, triggeredSpecials);
        }
      }
    }

    let totalScore = 0;
    const removeList = Array.from(toRemove.values());

    for (const pos of removeList) {
      const el = this.getTileEl(pos.r, pos.c);
      if (el) {
        const cell = this.board[pos.r][pos.c];
        if (cell.type === BOMB) {
          el.classList.add("exploding");
        } else {
          el.classList.add("removing");
        }
        const pts = 10 * cascade;
        totalScore += pts;
        this.showScorePopup(el, pts);
      }
    }

    this.score += totalScore;
    this.updateUI();

    await this.delay(300);

    for (const pos of removeList) {
      this.board[pos.r][pos.c] = null;
    }

    for (const sp of specialSpawns) {
      if (!toRemove.has(`${sp.r},${sp.c}`)) {
        this.board[sp.r][sp.c] = this.createCell(sp.color, sp.type);
      } else {
        let placed = false;
        for (const pos of sp.cells || []) {
          if (this.board[pos.r] && this.board[pos.r][pos.c] === null) {
            this.board[pos.r][pos.c] = this.createCell(sp.color, sp.type);
            placed = true;
            break;
          }
        }
        if (!placed) {
          this.board[sp.r][sp.c] = this.createCell(sp.color, sp.type);
        }
      }
    }
  }

  triggerSpecial(r, c, cell, toRemove, triggered) {
    if (cell.type === LINE_H) {
      for (let cc = 0; cc < BOARD_SIZE; cc++) {
        const key = `${r},${cc}`;
        const tgt = this.board[r][cc];
        if (!toRemove.has(key) && tgt && tgt.type !== STONE) {
          toRemove.set(key, { r, c: cc });
          if ((tgt.type === LINE_H || tgt.type === LINE_V || tgt.type === BOMB) && !triggered.has(key)) {
            triggered.add(key);
            this.triggerSpecial(r, cc, tgt, toRemove, triggered);
          }
        }
        if (tgt && tgt.type === STONE) {
          toRemove.set(key, { r, c: cc });
        }
      }
    } else if (cell.type === LINE_V) {
      for (let rr =  0; rr < BOARD_SIZE; rr++) {
        const key = `${rr},${c}`;
        const tgt = this.board[rr][c];
        if (!toRemove.has(key) && tgt && tgt.type !== STONE) {
          toRemove.set(key, { r: rr, c });
          if ((tgt.type === LINE_H || tgt.type === LINE_V || tgt.type === BOMB) && !triggered.has(key)) {
            triggered.add(key);
            this.triggerSpecial(rr, c, tgt, toRemove, triggered);
          }
        }
        if (tgt && tgt.type === STONE) {
          toRemove.set(key, { r: rr, c });
        }
      }
    } else if (cell.type === BOMB) {
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) + Math.abs(dc) > 3) continue;
          const rr = r + dr;
          const cc = c + dc;
          if (!this.inBounds(rr, cc)) continue;
          const key = `${rr},${cc}`;
          const tgt = this.board[rr][cc];
          if (!toRemove.has(key) && tgt && tgt.type !== STONE) {
            toRemove.set(key, { r: rr, c: cc });
            if ((tgt.type === LINE_H || tgt.type === LINE_V || tgt.type === BOMB) && !triggered.has(key)) {
              triggered.add(key);
              this.triggerSpecial(rr, cc, tgt, toRemove, triggered);
            }
          }
          if (tgt && tgt.type === STONE) {
            toRemove.set(key, { r: rr, c: cc });
          }
        }
      }
    }
  }

  showScorePopup(el, points) {
    const rect = el.getBoundingClientRect();
    const boardRect = this.boardEl.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.className = "score-popup";
    popup.textContent = `+${points}`;
    popup.style.left = (rect.left - boardRect.left + rect.width / 2 - 15) + "px";
    popup.style.top = (rect.top - boardRect.top) + "px";
    this.boardEl.appendChild(popup);
    setTimeout(() => popup.remove(), 900);
  }

  applyGravity() {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const column = [];
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (this.board[r][c] !== null) {
          column.push(this.board[r][c]);
        }
      }
      while (column.length < BOARD_SIZE) {
        column.push(this.createCell(this.randomColor()));
      }
      for (let r = BOARD_SIZE - 1, i = 0; r >= 0; r--, i++) {
        this.board[r][c] = column[i];
      }
    }
  }

  render(falling = false) {
    this.boardEl.innerHTML = "";
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.board[r][c];
        if (!cell) continue;
        const el = document.createElement("div");
        el.className = "tile";
        el.dataset.r = r;
        el.dataset.c = c;

        if (cell.type === STONE) {
          el.classList.add("stone");
        } else {
          el.classList.add(COLORS[cell.color]);
          if (cell.type === LINE_H) el.classList.add("special-line-h");
          else if (cell.type === LINE_V) el.classList.add("special-line-v");
          else if (cell.type === BOMB) el.classList.add("special-bomb");
        }

        if (this.selected && this.selected.r === r && this.selected.c === c) {
          el.classList.add("selected");
        }
        if (falling && cell.type !== STONE) {
          el.classList.add("falling");
        }

        el.addEventListener("click", () => this.handleTileClick(r, c));
        this.boardEl.appendChild(el);
      }
    }
  }

  updateUI() {
    this.scoreEl.textContent = this.score;
    this.movesEl.textContent = this.moves;
    this.targetEl.textContent = this.target;
    this.levelEl.textContent = this.level;
    const progress = Math.min(100, (this.score / this.target) * 100);
    this.progressEl.style.width = progress + "%";
  }

  checkGameEnd() {
    if (this.score >= this.target) {
      this.showModal("🎉 恭喜过关！", `得分：${this.score} / 目标：${this.target}`, "下一关");
    } else if (this.moves <= 0) {
      this.showModal("💔 游戏结束", `最终得分：${this.score} / 目标：${this.target}`, "重新开始");
    }
  }

  showModal(title, text, btnText) {
    this.modalTitleEl.textContent = title;
    this.modalTextEl.textContent = text;
    this.modalBtn.textContent = btnText;
    this.overlayEl.classList.add("show");
  }

  hideModal() {
    this.overlayEl.classList.remove("show");
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const game = new Game();
game.startGame(1);
