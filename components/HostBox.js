import React, { Component } from "react";
import HostManager from "../lib/HostManager";
import styles from "../styles/Home.module.css";
import Router from "next/router";
import Link from "next/link";
import clsx from "clsx";
import { CustomDivider } from "../components/Material/CustomDivider";

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
      Router.push(
        `/host/[gameCode]/[hostCode]`,
        `/host/${gameCode}/${hostCode}`
      );
    }
  };

  render() {
    const { gameCode, hostCode, players } = this.state;

    return (
      <div>
        <div>Players can join your game using the code below!</div>
        <CustomDivider />
        <div className={styles["field-row"]}>
          <div
            className={clsx(
              styles["field-cell"],
              styles["align-right"],
              styles["text-field-label"]
            )}
          >
            Game code
          </div>
          <div className={styles["field-cell"]}>
            <div className={styles["game-code-box"]}>{gameCode}</div>
          </div>
        </div>
        <CustomDivider />
        <h2>Players</h2>
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
