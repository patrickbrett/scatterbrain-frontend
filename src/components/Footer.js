import React, { Component } from "react";
import styles from "../styles/Footer.module.css";

export class Footer extends Component {
  render() {
    return (
      <div className={styles["footer-container"]}>
        <div className={styles["footer"]}>
          &copy; 2020{" "}
          <a href="https://linkedin.com/in/patrickbrett1" target="_blank">
            Patrick Brett
          </a>
        </div>
      </div>
    );
  }
}
