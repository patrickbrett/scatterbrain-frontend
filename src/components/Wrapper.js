import React, { Component } from "react";
import clsx from "clsx";
import Head from "next/head";
import { Footer } from "./Footer";

export default class Wrapper extends Component {
  render() {
    return (
      <div className={"bg-container"}>
        <Head>
          <title>Scatterbrain | Categories online with friends</title>
          <meta name="viewport" content="width=device-width, user-scalable=no" />
        </Head>
        <div className={"container-inner"}>{this.props.children}</div>
        <Footer />
      </div>
    );
  }
}
