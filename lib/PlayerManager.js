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
}
