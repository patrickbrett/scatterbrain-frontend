import io from 'socket.io-client';
import config from '../config.json';

export default class HostManager {
  static instance;
  playerCode;
  playerName;
  gameCode;
  isVip;
  socket;
  listener;

  constructor() {
    const socket = io(process.env.NEXT_PUBLIC_WS_HOST, { transport : ['websocket'], secure: true });
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

    socket.on('start-round', data => {
      this.listener({ event: 'start-round', ...data })
    })

    socket.on('times-up', data => {
      this.listener({ event: 'times-up', ...data })
    })

    socket.on('submissions-ready', data => {
      console.log('sub ready', data);
      this.listener({ event: 'submissions-ready', ...data })
    })

    socket.on('review-next-toplayer', data => {
      console.log('[player] review next!', data)
      this.listener({ event: 'review-next-toplayer', ...data })
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

  refetchGameInfo(gameCode, playerCode) {
    this.gameCode = gameCode;
    this.playerCode = playerCode;

    console.log('Emitting reload-player');
    this.socket.emit("reload-player", { playerCode, gameCode });
  }

  sendAnswers(answers) {
    const { playerCode, gameCode } = this;
    this.socket.emit('send-answers', { answers, playerCode, gameCode });
  }

  markAnswer(playerName, questionIndex, isApproved) {
    const { playerCode, gameCode } = this;
    this.socket.emit('mark-answer', { mark: { playerName, questionIndex, isApproved }, playerCode, gameCode })
  }
}
