import React, { Component } from "react";
import { withRouter } from "next/router";
import HostManager from "../../../lib/HostManager";

class HostGame extends Component {
  state = {
    roundStarted: false,
    categoryList: [],
    letter: null,
    players: [],
    playersWhoHaveSubmitted: new Set()
  }

  componentDidMount() {
    const hostManager = HostManager.getInstance();
    hostManager.setSocketListener(this.socketListener);

    if (hostManager.gameCode) {
      this.startRound();
      const { players } = hostManager;
      this.setState({ players })
    }
  }

  componentDidUpdate() {
    const { gameCode, hostCode } = this.props.router.query;

    if (!gameCode || !hostCode) return;

    const hostManager = HostManager.getInstance();
    if (!hostManager.gameCode) { // host manager has lost game info, get it back
      hostManager.refetchGameInfo(gameCode, hostCode);
    }
  }

  socketListener = (data) => {
    const { event } = data;
    if (event === 'reload-host-accepted') {
      const { players } = data;
      this.startRound();
      this.setState({ players })
    } else if (event === 'player-has-submitted') {
      const { playerName } = data;
      console.log(playerName);
      const { playersWhoHaveSubmitted } = this.state;
      playersWhoHaveSubmitted.add(playerName);
      this.setState({ playersWhoHaveSubmitted });
    } else if (event === 'submissions-ready') {
      // TODO
    }
  }

  startRound = async () => {
    console.log('starting round!')
    const hostManager = HostManager.getInstance();
    const { categoryList, letter } = await hostManager.requestRoundStart();
    this.setState({ roundStarted: true, categoryList, letter })
  }

  render() {
    const { gameCode } = this.props.router.query;
    const { roundStarted, categoryList, letter, players, playersWhoHaveSubmitted } = this.state;

    console.log('p', players);

    return (
      <div>
        <div>Hosting game</div>
        <div>Game code: {gameCode}</div>
        {roundStarted ? (<div>
          <h3>{categoryList.name}</h3>
          <p>Letter: {letter}</p>
          <ol>
            {categoryList.categories.map(cat => <li key={cat}>{cat}</li>)}
          </ol>
          <div>
            <ul>
              {players.map(player => <li>{player.playerName} {player.isVip ? '(VIP)' : null} {playersWhoHaveSubmitted.has(player.playerName) ? '(SUBMITTED)' : null}</li>)}
            </ul>
          </div>
        </div>) : (<div>Round starting in a few seconds...</div>)}
      </div>
    );
  }
}

export default withRouter(HostGame);