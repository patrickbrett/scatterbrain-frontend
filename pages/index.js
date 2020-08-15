import Link from "next/link";
import styles from "../styles/Home.module.css";
import { Button, CssBaseline } from "@material-ui/core";
import Head from "next/head";
import clsx from "clsx";
import { styled } from "@material-ui/core/styles";
import ArrowLeft from "@material-ui/icons/ArrowLeft";
import ArrowRight from "@material-ui/icons/ArrowRight";

const CustomButton = styled(Button)({
  background: "#D93EE7",
  color: "#FFF",
  textTransform: "uppercase",
  fontSize: "18px",
  fontWeight: "bold",
  padding: "10px 20px",
  borderRadius: "10px",
  margin: "20px"
});

const JoinButton = styled(CustomButton)({
  margin: "0 auto"
})

export default function Home() {
  return (
    <div className={"bg-container"}>
      <Head>
        <title>Scatterbrain | Categories online with friends</title>
      </Head>
      <div className={"container-inner"}>
        <h1 className={styles["heading-main"]}>
          Scatterbrain<span className={styles["heading-light"]}>.tv</span>
        </h1>
        <div className={styles["para"]}>
          Like the board game Scattegories, but online with friends!
        </div>
        <div className={styles["section-join-game"]}>
          <div>
            <div className={styles["field-row"]}>
              <div className={clsx(styles["field-cell"], styles["align-right"], styles["text-field-label"])}>Game code</div>
              <div className={styles["field-cell"]}>
                <input className={styles["text-field"]} type="text" placeholder="ABCD" />
              </div>
            </div>
            <div className={styles["field-row"]}>
              <div className={clsx(styles["field-cell"], styles["align-right"], styles["text-field-label"])}>Player name</div>
              <div className={styles["field-cell"]}>
                <input className={styles["text-field"]} type="text" placeholder="Julia" />
              </div>
            </div>
            <div className={styles["join-button-container"]}><JoinButton>Join Game <ArrowRight /></JoinButton></div>
          </div>
        </div>
          <div>or</div>
          <CustomButton className={clsx(styles["btn"], styles["btn-host-game"])}>
            Host Game <ArrowRight />
          </CustomButton>
      </div>
    </div>
  );
}
