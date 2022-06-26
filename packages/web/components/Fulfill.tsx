import { Button, Flex, Link, Text } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { Seaport } from "@opensea/seaport-js";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import React, { useEffect, useState } from "react";

import { injected } from "../lib/web3/injected";

export const Fulfill: React.FC = () => {
  const { activate, library, account } = useWeb3React<Web3Provider>();
  const [order, setOrder] = useState() as any;
  const [path, setPath] = useState<string>();
  const [offerer, setOfferer] = useState<string>();
  const [offer1, setOffer1] = useState("") as any;
  const [offer2, setOffer2] = useState("") as any;
  const [consideration, setConsideration] = useState("") as any;
  const connect = async () => {
    activate(injected);
  };
  useEffect(() => {
    const sss = window.location.pathname;
    setPath(sss.substring(6));
  },[]);

  // urlのhashを起因にIPFSからの読み込み
  const load = async () => {
    const ipfsUrl = "https://ipfs.io/ipfs/" + path
    const res = await axios.get(ipfsUrl);
    setOrder(res.data);
    setOfferer(res.data.parameters.offerer)
    setConsideration(res.data.parameters.consideration[0]);
    res.data.parameters.offer.forEach((offer: any, i: number) => {
      if (i == 0) {
        setOffer1(offer)
      }
      if (i == 1) {
        setOffer2(offer)
      }
    })
      console.log(res.data, "res");
  };

  const fulfill = async (order: any) => {
    if (!account || !library) {
      console.log("error");
      return;
    }
    console.log(order, "order");
    const seaport = new Seaport(library);
    const { actions } = await seaport.fulfillOrders({
      fulfillOrderDetails: [{ order }],
      accountAddress: account,
    });
    const action = actions[0];
    const tx = await action.transactionMethods.transact();
    console.log(tx, "tx");
  };

  return (
    <div>
      <Text fontWeight="bold" fontSize={"md"} mb="8">
        Fulfill Order
      </Text>
      <Text fontWeight={"bold"} fontSize={"xs"}>
        Order :{path}
      </Text>
      {offerer && offer1 && offer2 && consideration && (
        <>
          <Text fontWeight={"bold"} fontSize={"xs"}>
            Offerer :{offerer}
          </Text>
          <Text fontWeight={"bold"} fontSize={"xs"}>
            Offer1 :{offer1.token} ID: {offer1.identifierOrCriteria}
          </Text>
          <Text fontWeight={"bold"} fontSize={"xs"}>
            Offer2 :{offer2.token} ID: {offer2.identifierOrCriteria}
          </Text>
          <Text fontWeight={"bold"} fontSize={"xs"}>
            consideration :{consideration.token} ID:{" "}
            {consideration.identifierOrCriteria}
          </Text>
        </>
      )}

      {!account ? (
        <Button width="100%" onClick={connect} fontSize={"sm"} rounded="2xl">
          Connect Wallet
        </Button>
      ) : (
        <Flex mt="10">
          <Button
            width="100%"
            marginRight={"2"}
            fontSize={"sm"}
            rounded="2xl"
            onClick={() => load()}
          >
            Load Order
          </Button>
          <Button
            width="100%"
            marginRight={"2"}
            fontSize={"sm"}
            rounded="2xl"
            onClick={() => fulfill(order)}
          >
            Execute Your Order
          </Button>
        </Flex>
      )}
    </div>
  );
};
