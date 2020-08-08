import io from 'socket.io-client';
import axios from 'axios';

export default class HostManager {
  static instance;
  playerCode;
  playerName;
  gameCode;
  isVip;
  socket;
  listener;

  constructor() {
    const socket = io("ws://localhost:3000");
    this.socket = socket;

    socket.on('join-game-accepted', data => {
      this.playerCode = data.playerCode;
      this.listener({ event: 'join-game-accepted', ...data });
    })

    socket.on('game-started', data => {
      this.listener({ event: 'game-started', ...data });
    })

    socket.on("reload-player-accepted", (data) => {
      this.isVip = data.isVip;
      this.listener({ event: 'reload-player-accepted', ...data });
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new HostManager();
    }
    return this.instance;
  }

  getCodes() {
    const { playerCode, playerName, gameCode, isVip } = this;
    return { playerCode, gameCode, playerName, isVip };
  }

  joinGame(gameCode, playerName) {
    this.socket.emit(
      "join-game",
      { gameCode, playerName },
    );

    this.gameCode = gameCode;
    this.playerName = playerName;
  }

  setSocketListener(listener) {
    this.listener = listener;
  }

  startGame() {
    const { gameCode, playerCode } = this;
    console.log('gcpc', gameCode, playerCode);

    this.socket.emit(
      'start-game',
      { gameCode, playerCode }
    )
  }

  refetchGameInfo(gameCode, playerCode) {
    this.gameCode = gameCode;
    this.playerCode = playerCode;

    console.log('Emitting reload-player');
    this.socket.emit("reload-player", { playerCode, gameCode });
  }
}
