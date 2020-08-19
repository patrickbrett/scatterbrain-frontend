import io from "socket.io-client";
import config from "../config.json";

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

    const socket = io(process.env.NEXT_PUBLIC_WS_HOST, { transport : ['websocket'] });
    this.socket = socket;

    socket.on("new-player-joined", (data) => {
      const { playerName, isVip } = data;
      this.players.push({ playerName, isVip });
      console.log('players now: ', this.players)
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
    
    socket.on('disconnect', () => {
      this.handleDisconnect()
    })
  }

  handleDisconnect() {
    console.log('sock discon')
    this.players = []
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

  async requestRoundStart(players) {
    const { hostCode, gameCode } = this;
    return new Promise((resolve, reject) => {
      this.socket.emit("request-round-start", { hostCode, gameCode, players });

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
