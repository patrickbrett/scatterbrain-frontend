import React, { Component } from "react";
import PlayerManager from "../lib/PlayerManager";
import Router from "next/router";

export default class Player extends Component {
  state = {
    gameCode: "",
    playerName: "Patrick",
    playerCode: null,
    isVip: null,
  };

  componentDidMount() {
    const playerManager = PlayerManager.getInstance();
    playerManager.setSocketListener(this.socketListener);
  }

  updateGameCode = (e) => {
    const { value } = e.target;
    this.setState({ gameCode: value });
  };

  updatePlayerName = (e) => {
    const { value } = e.target;
    this.setState({ playerName: value });
  };

  joinGame = () => {
    const playerManager = PlayerManager.getInstance();
    const { gameCode, playerName } = this.state;
    playerManager.joinGame(gameCode, playerName);
  };

  socketListener = (data) => {
    const { event } = data;

    if (event === "join-game-accepted") {
      const { playerCode, isVip } = data;
      this.setState({ playerCode, isVip });
      return;
    }

    if (event === "game-started") {
      const { gameCode, playerCode } = this.state;

      Router.push(`/play/${gameCode}/${playerCode}`)
      return;
    }
  };

  startGame = () => {
    const playerManager = PlayerManager.getInstance();
    playerManager.startGame();
  }

  render() {
    const { gameCode, playerName, playerCode, isVip } = this.state;

    if (!playerCode) {
      return (
        <div>
          <div>
            Enter player name:{" "}
            <input
              type="text"
              value={playerName}
              onChange={this.updatePlayerName}
            ></input>
          </div>
          <div>
            Enter game code:{" "}
            <input
              type="text"
              value={gameCode}
              onChange={this.updateGameCode}
            ></input>
          </div>
          <div>
            <button onClick={this.joinGame}>Join</button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div>Successfully joined!</div>
        <div>Game code: {gameCode}</div>
        <div>
          Your name: {playerName} {isVip ? "(VIP)" : null}
        </div>
        <div>{isVip ? <button onClick={this.startGame}>Everybody's in, let's start!</button> : 'Please wait for the VIP to start the game.'}</div>
      </div>
    );
  }
}
