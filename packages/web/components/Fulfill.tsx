import { Button, Input } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { Seaport } from "@opensea/seaport-js";
import { useWeb3React } from "@web3-react/core";
import { Client } from "@xmtp/xmtp-js";
import { ethers, Wallet } from "ethers";
import React, { useState } from "react";

import { injected } from "../lib/web3/injected";

export const Fulfill: React.FC = () => {
  const { activate, library, account } = useWeb3React<Web3Provider>();
  const connect = async () => {
    activate(injected);
  };

  // urlのhashを起因にIPFSからの読み込み
  // const order = 

  const fulfill = async(order: any) => {
    if (!account || !library) return;
    const seaport = new Seaport(library);
    const tx = await seaport.fulfillOrder(order)
  };

  return (
    <div>
      <Button onClick={connect}> Connect</Button>
    </div>
  );
};
