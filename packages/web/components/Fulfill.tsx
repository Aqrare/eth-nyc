import { Button, Input } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { Seaport } from "@opensea/seaport-js";
import { useWeb3React } from "@web3-react/core";
import { Client } from "@xmtp/xmtp-js";
import axios from "axios";
import { ethers, Wallet } from "ethers";
import createClient from "ipfs-http-client";
import React, { useState } from "react";

import { injected } from "../lib/web3/injected";

export const Fulfill: React.FC = () => {
  const { activate, library, account } = useWeb3React<Web3Provider>();
  const connect = async () => {
    activate(injected);
  };

  const ipfs = createClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  // urlのhashを起因にIPFSからの読み込み
  const load = async () => {
    const res = await axios.get(
      "https://ipfs.io/ipfs/QmRvxHc8RB3HW2Jb5xuVSp8EK8ziucNUpxtLZJyycciMu9"
    );
    const order = res.data
    console.log(order, "res");
  };

  const fulfill = async (order: any) => {
    if (!account || !library) {
      console.log("error")
      return;
    }
    const seaport = new Seaport(library);
    const tx = await seaport.fulfillOrder(order);
  };

  return (
    <div>
      <Button onClick={connect}> Connect</Button>
      {/* <Button onClick={test}> Test</Button> */}
      <Button onClick={load}> load</Button>
      <Button onClick={fulfill}> fulfill</Button>
    </div>
  );
};
