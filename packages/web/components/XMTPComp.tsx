import { Button, Input } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Client } from "@xmtp/xmtp-js";
import { ethers, Wallet } from "ethers";
import React, { useState } from "react";

import { injected } from "../lib/web3/injected";

export const XMTPComp: React.FC = () => {
  let toAlice: any;
  const { activate, library, account } = useWeb3React<Web3Provider>();
  const [message, setMessage] = useState("");
  const [user, setUser] = useState() as any;
  const [conversation, setConversation] = useState() as any;

  const connect = async () => {
    activate(injected);
  };

  const handleMessageChange = (e: any) => {
    const inputValue = e.target.value;
    setMessage(inputValue);
  };

  const sendMessage = async () => {
    if (!conversation) {
      console.log("no conversation")
      return
    }
    await conversation.send(message);
  }

  const test = async () => {
    if (!account || !library) {
      console.log("error");
      return;
    }
    const signer = library.getSigner(account);
    const a = await Client.create(signer);
    setUser(a)
    console.log(user, "user")
    const alice = await Client.create(Wallet.createRandom());
    const b = await user.conversations.newConversation(alice.address);
    setConversation(b)
    console.log(conversation, "conversation");
    const stream = await conversation.streamMessages();
    await conversation.send("hey, mwen");
    await conversation.send("What's up?");

    const msg = await (await stream.next()).value;
    const msg2 = await (await stream.next()).value;
    console.log(msg.content, "msg");
    console.log(msg2.content, "msg");

    const message = await conversation.messages();
    console.log(message);
  };

  return (
    <div>
      <Button onClick={connect}> Connect</Button>
      <Button onClick={test}> Test</Button>
      <Input onChange={handleMessageChange}></Input>
      <Button onClick={sendMessage}>Send</Button>
    </div>
  );
};
