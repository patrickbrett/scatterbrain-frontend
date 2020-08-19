import { withRouter } from "next/router";
import React, { Component } from "react";
import Timer from "../../../components/Timer";
import Wrapper from "../../../components/Wrapper";
import HostManager from "../../../lib/HostManager";
import styles from "../../../styles/Home.module.css";
import { CustomButtonGrey } from "../../../components/Material/CustomButton";
import Cross from "@material-ui/icons/Close";
import config from "../../../config.json";
import { StarIcon } from "../../../components/StarIcon";
import clsx from "clsx";

class HostGame extends Component {
  state = {
    roundStarted: false,
    reviewStarted: false,
    categoryList: [],
    letter: null,
    players: [],
    playersWhoHaveSubmitted: new Set(),
    activeRoundReview: null,
    reviewQuestionIndex: 0,
    isMarkingComplete: false,
    answerScores: {}, // e.g. { "Tiff": true, "Kareem": false } when Tiff gets a point and Kareem is striked out
  };

  componentDidMount() {
    const hostManager = HostManager.getInstance();
    hostManager.setSocketListener(this.socketListener);

    if (hostManager.gameCode) {
      this.startRound();
      const { players } = hostManager;
      this.setState({ players });
    }
  }

  componentDidUpdate() {
    const { gameCode, hostCode } = this.props.router.query;

    if (!gameCode || !hostCode) return;

    const hostManager = HostManager.getInstance();
    if (!hostManager.gameCode) {
      // host manager has lost game info, get it back
      hostManager.refetchGameInfo(gameCode, hostCode);
    }
  }

  socketListener = (data) => {
    const { event } = data;

    if (event === "reload-host-accepted") {
      const { players } = data;
      this.startRound();
      this.setState({ players });
    } else if (event === "player-has-submitted") {
      const { playerName } = data;
      console.log(playerName);
      const { playersWhoHaveSubmitted } = this.state;
      playersWhoHaveSubmitted.add(playerName);
      this.setState({ playersWhoHaveSubmitted });
    } else if (event === "submissions-ready") {
      const activeRoundReview = data.activeRound;
      this.setState({
        activeRoundReview,
        reviewStarted: true,
        roundStarted: false,
        reviewQuestionIndex: 0,
      });
    } else if (event === "marked-answer") {
      const { submissions } = data;
      this.setState((prevState) => {
        const { activeRoundReview } = prevState;
        activeRoundReview.submissions = submissions;

        const isMarkingComplete = this.checkIfMarkingIsComplete();

        if (isMarkingComplete) {
          this.notifyPlayersMarkingComplete();
        }

        return { activeRoundReview, isMarkingComplete };
      });
    }
  };

  checkIfMarkingIsComplete = () => {
    const { players, activeRoundReview, reviewQuestionIndex } = this.state;

    const submissions = Object.values(activeRoundReview.submissions);
    const markingIsComplete = submissions.every((sub) => {
      const currentQMarks =
        sub.marks &&
        sub.marks[reviewQuestionIndex] &&
        Object.values(sub.marks[reviewQuestionIndex]);
      if (!currentQMarks) return false;
      return currentQMarks.length >= players.length - 1; // mark given by every player except the person who gave the answer
    });

    if (!this.state.isMarkingComplete && markingIsComplete) {
      // marking just became complete
      this.scoreAnswers();
    }

    return markingIsComplete;
  };

  scoreAnswers = () => {
    const { activeRoundReview, players, reviewQuestionIndex } = this.state;

    const scoreAnswers = {};

    const playersUpdated = players.map((player) => {
      const submission = Object.values(activeRoundReview.submissions).find(
        (sub) => sub.playerName === player.playerName
      );
      if (submission.marks[reviewQuestionIndex]) {
        const marks = Object.values(submission.marks[reviewQuestionIndex]);
        const acceptedMarks = marks.filter(Boolean);
        const playerDidScore = acceptedMarks.length > marks.length / 2;
        scoreAnswers[player.playerName] = playerDidScore;
  
        if (playerDidScore) {
          player.score += 100;
        }
      } else {
        scoreAnswers[player.playerName] = false;
      }

      return player;
    });

    this.setState({ players: playersUpdated, scoreAnswers });
  };

  roundReviewToQNA = (roundReview) => {
    const qAndA = roundReview.categoryList.categories.map((cat, i) => {
      const answersByPlayer = Object.values(roundReview.submissions);
      const answers = answersByPlayer.map((playerAnswer) => ({
        playerName: playerAnswer.playerName,
        answer: playerAnswer.answers[i],
      }));

      return {
        question: cat,
        answers,
      };
    });

    return qAndA;
  };

  reviewNext = () => {
    if (
      this.state.reviewQuestionIndex <
      this.state.categoryList.categories.length - 1
    ) {
      const hostManager = HostManager.getInstance();
      hostManager.reviewNext(this.state.reviewQuestionIndex);
      console.log("send review next");

      this.setState((prevState) => ({
        reviewQuestionIndex: prevState.reviewQuestionIndex + 1,
        isMarkingComplete: false,
      }));
    } else {
      this.startRound();
    }
  };

  startRound = async () => {
    console.log("starting round!");
    const { players } = this.state;
    const hostManager = HostManager.getInstance();
    const { categoryList, letter } = await hostManager.requestRoundStart(
      players
    );
    this.setState({
      reviewStarted: false,
      roundStarted: true,
      categoryList,
      letter,
    });
  };

  handleTimerFinish = () => {
    console.log("Host: timer finished, time is up");
    const hostManager = HostManager.getInstance();
    hostManager.roundTimesUp();
  };

  returnHome = () => {
    if (
      config.confirmExit &&
      !confirm(
        "Are you sure you want to quit the current game and return to the home page?"
      )
    ) {
      return;
    }

    this.props.router.push("/");
  };

  handleMarkingTimeout = () => {
    this.scoreAnswers();
    this.setState({ isMarkingComplete: true })
    this.notifyPlayersMarkingComplete()
  }

  notifyPlayersMarkingComplete = () => {
    // TODO:
  }

  render() {
    const { gameCode } = this.props.router.query;
    const {
      roundStarted,
      reviewStarted,
      categoryList,
      letter,
      players,
      playersWhoHaveSubmitted,
      activeRoundReview,
      reviewQuestionIndex,
      isMarkingComplete,
      scoreAnswers,
    } = this.state;

    const header = (
      <>
        <h1 className={styles["heading-main"]}>
          Scatterbrain<span className={styles["heading-light"]}>.tv</span>
        </h1>
        <CustomButtonGrey onClick={this.returnHome}>
          <Cross /> Quit
        </CustomButtonGrey>
            {/* <div className={"game-code-box-abs"}>{gameCode}</div> */}
      </>
    );

    if (!reviewStarted) {
      return (
        <Wrapper>
          {header}
          {roundStarted ? (
            <div>
              <h3>{categoryList.name}</h3>
              <div className="letter-box">{letter}</div>
              <ol>
                {categoryList.categories.map((cat) => (
                  <li key={cat}>{cat}</li>
                ))}
              </ol>
              <div>
                <div className={styles["player-names"]}>
                  {players.map((player) => (
                    <div
                      className={clsx(
                        styles["player-name-container"],
                        playersWhoHaveSubmitted.has(player.playerName)
                          ? styles["player-name-container-subm"]
                          : styles["player-name-container-not-subm"]
                      )}
                      key={player.playerName}
                    >
                      <div>{player.playerName}</div>{" "}
                      {player.isVip ? (
                        <div>
                          <StarIcon />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              <Timer
                duration={config.timerDuration}
                onFinish={this.handleTimerFinish}
              />
            </div>
          ) : (
            <div>Round starting in a few seconds...</div>
          )}
        </Wrapper>
      );
    }

    const qAndA = this.roundReviewToQNA(activeRoundReview);

    const debug = config.debug ? (
      <>
        <div>{JSON.stringify(activeRoundReview)}</div>
        <div>{JSON.stringify(players)}</div>
        <div>{JSON.stringify(scoreAnswers)}</div>
      </>
    ) : null;

    return (
      <Wrapper>
        {header}
        {debug}
        <div>
          <h3>Question {reviewQuestionIndex + 1}</h3>
          <div>{qAndA[reviewQuestionIndex].question}</div>
          <div>
            {qAndA[reviewQuestionIndex].answers.map((answer) => (
              <div>
                {isMarkingComplete ? answer.playerName : "?????"}:{" "}
                {answer.answer}{" "}
                {isMarkingComplete ? (
                  scoreAnswers[answer.playerName] ? (
                    <span>👍🏻 +100</span>
                  ) : (
                    <span>👺</span>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div>
          {isMarkingComplete ? <div>Next category in... <Timer
              hash={reviewQuestionIndex + Math.random()}
              duration={10}
              onFinish={this.reviewNext}
            /></div>
           : 
            <div>Waiting for players to review... <Timer
              hash={reviewQuestionIndex + Math.random()}
              duration={30}
              onFinish={this.handleMarkingTimeout}
            /></div>
          }
        </div>
      </Wrapper>
    );
  }
}

export default withRouter(HostGame);
