import React, { Component } from "react";
import { withRouter } from "next/router";
import HostManager from "../../../lib/HostManager";
import Timer from "../../../components/Timer";

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

    } else if (event === 'marked-answer') {

      const { submissions } = data;
      this.setState(prevState => {
        const { activeRoundReview } = prevState;
        activeRoundReview.submissions = submissions;
        return { activeRoundReview };
      })

    }
  };

  reviewNext = () => {
    if (this.state.reviewQuestionIndex < this.state.categoryList.categories.length - 1) {
      const hostManager = HostManager.getInstance();
      hostManager.reviewNext(this.state.reviewQuestionIndex);

      this.setState((prevState) => ({
        reviewQuestionIndex: prevState.reviewQuestionIndex + 1,
      }));
    } else {
      this.startRound();
    }
  };

  startRound = async () => {
    console.log("starting round!");
    const hostManager = HostManager.getInstance();
    const { categoryList, letter } = await hostManager.requestRoundStart();
    this.setState({ reviewStarted: false, roundStarted: true, categoryList, letter });
  };

  handleTimerFinish = () => {
    console.log("Host: timer finished, time is up")
    const hostManager = HostManager.getInstance();
    hostManager.roundTimesUp();
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
    } = this.state;

    const header = (
      <>
        <div>Hosting game</div>
        <div>Game code: {gameCode}</div>
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
                {categoryList.categories.map((cat) => (
                  <li key={cat}>{cat}</li>
                ))}
              </ol>
              <div>
                <ul>
                  {players.map((player) => (
                    <li>
                      {player.playerName} {player.isVip ? "(VIP)" : null}{" "}
                      {playersWhoHaveSubmitted.has(player.playerName)
                        ? "(SUBMITTED)"
                        : null}
                    </li>
                  ))}
                </ul>
              </div>
              <Timer duration={45} onFinish={this.handleTimerFinish} />
            </div>
          ) : (
            <div>Round starting in a few seconds...</div>
          )}
        </div>
      );
    }

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

    return (
      <div>
        {header}
        <div>{JSON.stringify(activeRoundReview)}</div>
        <div>
          <h3>Question {reviewQuestionIndex + 1}</h3>
          <div>{qAndA[reviewQuestionIndex].question}</div>
          <div>
            {qAndA[reviewQuestionIndex].answers.map((answer) => (
              <div>
                {answer.playerName}: {answer.answer}
              </div>
            ))}
          </div>
        </div>
        <div>
          <button onClick={this.reviewNext}>Next</button>
        </div>
      </div>
    );
  }
}

export default withRouter(HostGame);
