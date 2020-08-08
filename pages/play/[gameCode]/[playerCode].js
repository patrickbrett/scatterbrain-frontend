import React, { Component } from "react";
import { withRouter } from "next/router";
import PlayerManager from "../../../lib/PlayerManager";

class PlayGame extends Component {
  state = {
    playerName: null,
    isVip: null,
    categoryList: null,
    letter: null,
    roundStarted: false,
    reviewStarted: false,
    listAnswers: [],
  };

  componentDidMount() {
    const playerManager = PlayerManager.getInstance();
    playerManager.setSocketListener(this.socketListener);

    if (playerManager.gameCode) {
      this.setState({
        playerName: playerManager.playerName,
        isVip: playerManager.isVip,
      });
    }
  }

  componentDidUpdate() {
    const { gameCode, playerCode } = this.props.router.query;

    if (!gameCode || !playerCode) return;

    const playerManager = PlayerManager.getInstance();
    if (!playerManager.gameCode) {
      // player manager has lost game info, get it back
      playerManager.refetchGameInfo(gameCode, playerCode);
    }
  }

  socketListener = (data) => {
    const { event } = data;
    if (event === "reload-player-accepted") {
      const { playerName, isVip } = data;
      this.setState({ playerName, isVip });
    } else if (event === "start-round") {
      const { categoryList, letter } = data;
      const listAnswers = categoryList.categories.map(() => "");
      this.setState({ categoryList, letter, listAnswers, roundStarted: true });
    } else if (event === "submissions-ready") {
      this.setState({ roundStarted: false, reviewStarted: true });
    }
  };

  updateListAnswer(e, index) {
    const { value } = e.target;
    const { listAnswers } = this.state;
    listAnswers[index] = value;
    this.setState({ listAnswers });
  }

  sendAnswers = () => {
    const { listAnswers } = this.state;
    const playerManager = PlayerManager.getInstance();
    playerManager.sendAnswers(listAnswers);
  };

  render() {
    const { gameCode } = this.props.router.query;
    const {
      playerName,
      isVip,
      categoryList,
      letter,
      roundStarted,
      reviewStarted,
      listAnswers,
    } = this.state;

    const header = (
      <>
        <div>Playing game</div>
        <div>Game code: {gameCode}</div>
        <div>
          Player name: {playerName} {isVip ? "(VIP)" : null}
        </div>
      </>
    );

    if (reviewStarted) {
      <div>
        {header}
        <div>Reviewing...</div>
      </div>
    }

    return (
      <div>
        {header}
        {roundStarted ? (
          <div>
            <h3>{categoryList.name}</h3>
            <p>Letter: {letter}</p>
            <ol>
              {categoryList.categories.map((cat, i) => (
                <li key={cat}>
                  {cat}{" "}
                  <input
                    type="text"
                    value={listAnswers[i]}
                    onChange={(e) => this.updateListAnswer(e, i)}
                  />
                </li>
              ))}
            </ol>
            <div>
              <button onClick={this.sendAnswers}>I'm done</button>
            </div>
          </div>
        ) : (
          <div>Waiting for round to start...</div>
        )}
      </div>
    );
  }
}

export default withRouter(PlayGame);
