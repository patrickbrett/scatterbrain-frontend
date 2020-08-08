import React, { Component } from "react";
import { withRouter } from "next/router";
import HostManager from "../../../lib/HostManager";

class HostGame extends Component {
  componentDidUpdate() {
    const { gameCode, hostCode } = this.props.router.query;

    if (!gameCode || !hostCode) return;

    const hostManager = HostManager.getInstance();
    if (!hostManager.gameCode) { // host manager has lost game info, get it back
      hostManager.refetchGameInfo(gameCode, hostCode);
    }
  }

  render() {
    const { gameCode, hostCode } = this.props.router.query;
    const hostManager = HostManager.getInstance();
    console.log(hostManager.players);

    return (
      <div>
        <div>Hosting game</div>
        <div>Game code: {gameCode}</div>
        <div>Round starting in a few seconds...</div>
      </div>
    );
  }
}

export default withRouter(HostGame);