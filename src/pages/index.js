import ArrowLeft from "@material-ui/icons/ArrowLeft";
import ArrowRight from "@material-ui/icons/ArrowRight";
import React, { Component } from "react";
import HostBox from "../components/HostBox";
import JoinBox from "../components/JoinBox";
import { CustomButton, CustomButtonGrey } from "../components/Material/CustomButton";
import Wrapper from "../components/Wrapper";
import styles from "../styles/Home.module.css";
import HostManager from "../lib/HostManager";

export default class Home extends Component {
  state = {
    isHosting: false
  }

  stopHosting = () => {
    this.setState({ isHosting: false });
    const hostManager = HostManager.getInstance();
    if (hostManager) {
      hostManager.handleDisconnect();
    }
  }

  render() {
    const { isHosting } = this.state;

    return isHosting ? (
      <Wrapper>
        <CustomButtonGrey onClick={this.stopHosting}><ArrowLeft /> Back</CustomButtonGrey>
        <HostBox />
      </Wrapper>
    ) : (
      <Wrapper>
        <h1 className={styles["heading-main"]}>
          Scatterbrain<span className={styles["heading-light"]}>.tv</span>
        </h1>
        <div className={styles["para"]}>
          Like the board game Scattergories, but online with friends!
        </div>
        <div className={styles["section-join-game"]}>
          <JoinBox />
        </div>
        <div className={styles["host-button-container"]}>
          <div>or</div>
          <div>
            <CustomButton onClick={() => this.setState({ isHosting: true })}>
              Host Game <ArrowRight />
            </CustomButton>
          </div>
        </div>
      </Wrapper>
    );
  }
}
