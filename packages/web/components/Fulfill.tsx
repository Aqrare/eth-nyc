import { Button } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { Seaport } from "@opensea/seaport-js";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import React, { useState } from "react";

import { injected } from "../lib/web3/injected";

export const Fulfill: React.FC = () => {
  const { activate, library, account } = useWeb3React<Web3Provider>();
  const [order, setOrder] = useState() as any;
  const connect = async () => {
    activate(injected);
  };


  // urlのhashを起因にIPFSからの読み込み
  const load = async () => {
    const res = await axios.get(
      "https://ipfs.io/ipfs/QmUEWWJSJnUGBS7bDfYjbfc7CXrXLPZvHNck6Gb6wPPf8E"
    );
    setOrder(res.data)
    console.log(res, "res");
  };

  const fulfill = async (order: any) => {
    if (!account || !library) {
      console.log("error")
      return;
    }
    load()
    const seaport = new Seaport(library);
    const tx = await seaport.fulfillOrder({ order });
    console.log(tx)
  };

  return (
    <div>
      <Button onClick={connect}> Connect</Button>
      {/* <Button onClick={test}> Test</Button> */}
      <Button onClick={() => fulfill(order)}> fulfill</Button>
    </div>
  );
};
