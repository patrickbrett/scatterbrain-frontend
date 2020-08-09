import io from "socket.io-client";
import {WEBSOCKET_HOST} from './config';

export default class HostManager {
  static instance;
  hostCode;
  gameCode;
  socket;
  playersRefreshListener;
  players;
  listener;

  constructor() {
    this.players = [];

    const socket = io(WEBSOCKET_HOST);
    this.socket = socket;

    socket.on("new-player-joined", (data) => {
      const { playerName, isVip } = data;
      this.players.push({ playerName, isVip });
      this.playersRefreshListener(this.players);
    });

    socket.on("game-started", (data) => {
      this.listener({ event: "game-started", ...data });
    });

    socket.on("reload-host-accepted", (data) => {
      this.players = data.players.map(({ playerName, isVip }) => ({
        playerName,
        isVip,
      }));
      this.listener({ event: "reload-host-accepted", ...data });
    });

    socket.on('player-has-submitted', (data) => {
      this.listener({ event: 'player-has-submitted', ...data })
    })

    socket.on('submissions-ready', data => {
      this.listener({ event: 'submissions-ready', ...data })
    })

    socket.on('marked-answer', data => {
      this.listener({ event: 'marked-answer', ...data })
    })
  }

  async createGame() {
    return new Promise((resolve, reject) => {
      this.socket.emit("create-game");
      this.socket.on("create-game-accepted", (data) => {
        const { gameCode, hostCode } = data;
        this.gameCode = gameCode;
        this.hostCode = hostCode;
        resolve({ gameCode, hostCode });
      });
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new HostManager();
    }
    return this.instance;
  }

  getCodes() {
    return { hostCode: this.hostCode, gameCode: this.gameCode };
  }

  setPlayersRefreshListener(listener) {
    this.playersRefreshListener = listener;
  }

  setSocketListener(listener) {
    this.listener = listener;
  }

  refetchGameInfo(gameCode, hostCode) {
    this.hostCode = hostCode;
    this.gameCode = gameCode;

    console.log("Emitting reload-host");
    this.socket.emit("reload-host", { hostCode, gameCode });
  }

  async requestRoundStart() {
    const { hostCode, gameCode } = this;
    return new Promise((resolve, reject) => {
      this.socket.emit("request-round-start", { hostCode, gameCode });

      this.socket.on("start-round", (data) => {
        resolve({ ...data });
      });
    });
  }

  roundTimesUp() {
    const { hostCode, gameCode } = this;
    this.socket.emit("round-times-up", { hostCode, gameCode });
  }

  reviewNext(currentIndex) {
    const { hostCode, gameCode } = this;
    this.socket.emit("review-next", { hostCode, gameCode, currentIndex });
  }
}
