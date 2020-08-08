import React, { Component } from "react";
import { withRouter } from "next/router";
import PlayerManager from "../../../lib/PlayerManager";

class PlayGame extends Component {
  state = {
    playerName: null,
    isVip: null
  }

  componentDidMount() {
    const playerManager = PlayerManager.getInstance();
    playerManager.setSocketListener(this.socketListener);

    if (playerManager.gameCode) {
      this.setState({ playerName: playerManager.playerName, isVip: playerManager.isVip });
    }
  }

  componentDidUpdate() {
    const { gameCode, playerCode } = this.props.router.query;

    if (!gameCode || !playerCode) return;

    const playerManager = PlayerManager.getInstance();
    if (!playerManager.gameCode) { // player manager has lost game info, get it back
      playerManager.refetchGameInfo(gameCode, playerCode);
    }
  }

  socketListener = (data) => {
    const { event } = data;
    if (event === 'reload-player-accepted') {
      const { playerName, isVip } = data;
      this.setState({ playerName, isVip })
    }
  }

  render() {
    const { gameCode } = this.props.router.query;
    const { playerName, isVip } = this.state;

    return (
      <div>
        <div>Playing game</div>
        <div>Game code: {gameCode}</div>
        <div>Player name: {playerName} {isVip ? '(VIP)' : null}</div>
      </div>
    );
  }
}

export default withRouter(PlayGame);