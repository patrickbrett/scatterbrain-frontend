import React, { Component } from "react";
import HostManager from "../lib/HostManager";
import Router from "next/router";

export default class Host extends Component {
  state = {
    gameCode: null,
    hostCode: null,
    players: [],
  };

  componentDidMount() {
    this.initialiseGame();
  }

  initialiseGame = async () => {
    const hostManager = HostManager.getInstance();
    const { hostCode, gameCode } = await hostManager.createGame();
    hostManager.setPlayersRefreshListener(this.refreshPlayersList);
    hostManager.setSocketListener(this.socketListener);
    this.setState({ hostCode, gameCode });
  };

  refreshPlayersList = (newPlayersList) => {
    this.setState({ players: newPlayersList });
  };

  socketListener = (data) => {
    const { event } = data;
    const { gameCode, hostCode } = this.state;

    if (event === "game-started") {
      Router.push(`/host/${gameCode}/${hostCode}`)
    }
  }

  render() {
    const { gameCode, hostCode, players } = this.state;

    return (
      <div>
        <div>Hosting game...</div>
        <div>Game code: {gameCode}</div>
        <div>Players joined:</div>
        <ul>
          {players.map((player) => (
            <li key={player.playerName}>
              {player.playerName} {player.isVip ? "(VIP)" : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
