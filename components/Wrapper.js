import React, { Component } from "react";
import clsx from "clsx";
import Head from "next/head";

export default class Wrapper extends Component {
  render() {
    return (
      <div className={"bg-container"}>
        <Head>
          <title>Scatterbrain | Categories online with friends</title>
        </Head>
        <div className={"container-inner"}>
        {this.props.children}
        </div>
      </div>
    );
  }
}
