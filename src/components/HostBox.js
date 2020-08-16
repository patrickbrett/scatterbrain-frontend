import clsx from "clsx";
import Router from "next/router";
import React, { Component } from "react";
import { CustomDivider } from "../components/Material/CustomDivider";
import HostManager from "../lib/HostManager";
import styles from "../styles/Home.module.css";
import { StarIcon } from "./StarIcon";

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
            <div className={"game-code-box"}>{gameCode}</div>
          </div>
        </div>
        <CustomDivider />
        <div className={styles["player-names"]}>
          {players.length ? players.map((player) => (
            <div className={styles["player-name-container"]} key={player.playerName}>
              <div>{player.playerName}</div> {player.isVip ? <div><StarIcon /></div> : null}
            </div>
          )) : <span>Nobody's here yet 😢</span>}
        </div>
      </div>
    );
  }
}
