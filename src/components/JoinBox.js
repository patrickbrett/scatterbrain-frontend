import React, { Component } from "react";
import PlayerManager from "../lib/PlayerManager";
import Router from "next/router";
import styles from "../styles/Home.module.css";
import clsx from "clsx";
import { CustomButton } from "../components/Material/CustomButton";
import { styled } from "@material-ui/core/styles";
import ArrowRight from "@material-ui/icons/ArrowRight";
import ArrowLeft from "@material-ui/icons/ArrowLeft";
import config from "../config.json";
import { Loader } from "../components/Loader";
import { CustomButtonGrey } from "./Material/CustomButton";

const JoinButton = styled(CustomButton)({
  margin: "0 auto",
});

const randomNames = [
  "Patrick",
  "Chance",
  "Jacob",
  "Naomi",
  "Lidia",
  "Preston",
  "Julia",
  "Kareem",
  "Tiff",
  "Jack",
  "Ryan",
  "Lachie",
  "BG",
  "Emile",
  "Callum",
  "Stuey",
  "Jed",
  "Sam",
  "Elise",
];

const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

export default class Player extends Component {
  state = {
    gameCode: "",
    playerName: config.autoFillPlayerNames ? randomName : "",
    playerCode: null,
    isVip: null,
  };

  componentDidMount() {
    const playerManager = PlayerManager.getInstance();
    playerManager.setSocketListener(this.socketListener);
  }

  updateGameCode = (e) => {
    const { value } = e.target;
    // Letters only, make upper case, up to four characters.
    const filteredValue = (value.toUpperCase().match(/[A-Z]/g) || [])
      .join("")
      .slice(0, 4);
    this.setState({ gameCode: filteredValue });
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

      Router.push(
        `/play/[gameCode]/[playerCode]`,
        `/play/${gameCode}/${playerCode}`
      );
      return;
    }
  };

  startGame = () => {
    const playerManager = PlayerManager.getInstance();
    playerManager.startGame();
  };

  render() {
    const { gameCode, playerName, playerCode, isVip } = this.state;

    if (!playerCode) {
      return (
        <div>
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
              <input
                className={styles["text-field"]}
                type="text"
                placeholder="ABCD"
                value={gameCode}
                onChange={this.updateGameCode}
              />
            </div>
          </div>
          <div className={styles["field-row"]}>
            <div
              className={clsx(
                styles["field-cell"],
                styles["align-right"],
                styles["text-field-label"]
              )}
            >
              Player name
            </div>
            <div className={styles["field-cell"]}>
              <input
                className={styles["text-field"]}
                type="text"
                placeholder={randomName}
                value={playerName}
                onChange={this.updatePlayerName}
              />
            </div>
          </div>
          <div className={styles["join-button-container"]}>
            <JoinButton onClick={this.joinGame}>
              Join Game <ArrowRight />
            </JoinButton>
          </div>
        </div>
      );
    }

    return (
      <div>
        {isVip ? (
          <CustomButton onClick={this.startGame}>
            Everybody's in, let's start!
          </CustomButton>
        ) : (
          <>
            <div>Waiting for the VIP to start the game...</div>
            <Loader />
          </>
        )}
        <CustomButtonGrey onClick={() => this.setState({ playerCode: null })}>
          <ArrowLeft /> Cancel
        </CustomButtonGrey>
      </div>
    );
  }
}
