import React, { Component } from "react";
import TimerIcon from "@material-ui/icons/Timer";
import styles from "../styles/Timer.module.css";

export default class Timer extends Component {
  state = {
    startTime: null,
    remainingDuration: null,
    isFinished: false,
    isStarted: false,
  };

  componentDidMount() {
    const { duration } = this.props;

    const startTime = new Date().getTime();

    const intervalRef = setInterval(this.timerInterval, 500);

    this.setState({
      startTime,
      remainingDuration: duration * 1000,
      intervalRef,
      isStarted: true,
    });
  }

  timerInterval = () => {
    if (!this.state.isStarted) return;

    const now = new Date().getTime();
    const { startTime, intervalRef } = this.state;
    const elapsedDuration = now - startTime;
    const remainingDuration = this.props.duration * 1000 - elapsedDuration;

    if (remainingDuration <= 0) {
      this.setState({ isFinished: true, remainingDuration: 0 });
      if (intervalRef) clearInterval(intervalRef);
      this.props.onFinish();
    } else {
      this.setState({ remainingDuration });
    }
  };

  componentWillUnmount() {
    const { intervalRef } = this.state;

    if (intervalRef) clearInterval(intervalRef);
  }

  componentDidUpdate(prevProps) {
    if (this.props.hash !== prevProps.hash) {
      this.componentDidMount();
    }
  }

  render() {
    const { remainingDuration } = this.state;
    const durationSecs = Math.ceil(remainingDuration / 1000);

    return (
      <div>
        {this.props.message ? (
          this.props.message(durationSecs)
        ) : (
          <div className={styles["timer-inner"]}>
            <TimerIcon /> {durationSecs}
          </div>
        )}
      </div>
    );
  }
}
