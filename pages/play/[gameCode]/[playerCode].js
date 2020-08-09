import React, { Component } from "react";
import { withRouter } from "next/router";
import PlayerManager from "../../../lib/PlayerManager";
import Link from "next/link";

class PlayGame extends Component {
  state = {
    playerName: null,
    isVip: null,
    categoryList: null,
    letter: null,
    roundStarted: false,
    reviewStarted: false,
    listAnswers: [],
    activeRound: null,
    reviewQuestionIndex: 0,
    answerMarks: {},
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
      console.log("[player] submissions ready! active round:", activeRound);
      const { activeRound } = data;
      this.setState({
        activeRound,
        roundStarted: false,
        reviewQuestionIndex: 0,
        reviewStarted: true,
      });
    } else if (event === "times-up") {
      console.log("Player: received 'time is up' message");
      this.sendAnswers();
    } else if (event === "review-next-toplayer") {
      const { currentIndex } = data;

      console.log("Player: review go to next");
      this.setState({ reviewQuestionIndex: currentIndex + 1, answerMarks: {} });
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
    this.setState({ roundStarted: false, reviewStarted: true });
  };

  markAnswer = (playerName, questionIndex, isApproved) => {
    const playerManager = PlayerManager.getInstance();
    playerManager.markAnswer(playerName, questionIndex, isApproved);
    this.setState((prevState) => {
      const { answerMarks } = prevState;
      answerMarks[playerName] = isApproved;
      return { answerMarks }
    });
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
      activeRound: activeRoundReview,
      reviewQuestionIndex,
      listAnswers,
      answerMarks,
    } = this.state;

    const header = (
      <>
      <div><Link href="/play"><a href="/host">Back to Play page</a></Link></div>
        <div>Playing game</div>
        <div>Game code: {gameCode}</div>
        <div>
          Player name: {playerName} {isVip ? "(VIP)" : null}
        </div>
      </>
    );

    if (!reviewStarted) {
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

    if (!activeRoundReview) return <div>Waiting for other players...</div>;

    const qAndA = activeRoundReview.categoryList.categories.map((cat, i) => {
      const answersByPlayer = Object.values(activeRoundReview.submissions);
      const answers = answersByPlayer.map((playerAnswer) => ({
        playerName: playerAnswer.playerName,
        answer: playerAnswer.answers[i],
      }));

      return {
        question: cat,
        answers,
      };
    });

    console.log(qAndA);

    const markButtons = (playerName) =>
      (() => {
        if (playerName === this.state.playerName) {
          return null;
        } else if (!answerMarks.hasOwnProperty(playerName)) {
          return (
            <>
              <button
                onClick={() =>
                  this.markAnswer(playerName, reviewQuestionIndex, true)
                }
              >
                ✅
              </button>
              <button
                onClick={() =>
                  this.markAnswer(playerName, reviewQuestionIndex, false)
                }
              >
                ❌
              </button>
            </>
          );
        } else if (answerMarks[playerName] === true) {
          return <div>✅</div>;
        } else {
          return <div>❌</div>;
        }
      })();

    const isMarkingComplete = false; // TODO:

    return (
      <div>
        <div>Reviewing...</div>
        <div>{JSON.stringify(qAndA)}</div>
        <div>
          <h3>Question {reviewQuestionIndex + 1}</h3>
          <div>{qAndA[reviewQuestionIndex].question}</div>
          <div>
            {qAndA[reviewQuestionIndex].answers.map((answer) => (
              <div key={answer.playerName}>
                {(isMarkingComplete || answer.playerName === playerName) ? answer.playerName : '?????'}: {answer.answer}{" "}
                {markButtons(answer.playerName)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PlayGame);
