import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  IconButton,
  Input,
  Link,
  Select,
  Stack,
  Text,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { Seaport } from "@opensea/seaport-js";
import { useWeb3React } from "@web3-react/core";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
import createClient from "ipfs-http-client";
import React, { useState } from "react";

import { ItemType } from "../constants";
import { abi } from "../lib/abi";
import config from "../lib/web3/config.json";
import { injected } from "../lib/web3/injected";
import { Chain, isChain } from "../types/chain";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const Request: React.FC = () => {
  const [assetURI, setAssetURI] = useState("");
  const [ownerAddress, setOwnerAddress] = useState(
    "0x231f0db1C13e176cfA1c98c713565F2E36bBA98e"
  );
  const [assetURIErrorMessage, setAssetURIErrorMessage] = useState("");
  const [network, setNetwork] = useState<Chain | "">("");
  const [nftContractAddress, setNFTContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tokenId1, setTokenId1] = useState("");
  const [tokenId2, setTokenId2] = useState("");
  const [contractAddress1, setContractAddress1] = useState("");
  const [contractAddress2, setContractAddress2] = useState("");
  const [tokenType1, setTokenType1] = React.useState() as any;
  const [tokenType2, setTokenType2] = React.useState() as any;
  const [orderURI, setOrderURI] = React.useState("");
    const toast = useToast();
  const rpc = "https://rinkeby.infura.io/v3/95f65ab099894076814e8526f52c9149";
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const { onCopy } = useClipboard(orderURI);
  const { activate, library, account } = useWeb3React<Web3Provider>();
  const clear = () => {
    setAssetURI("");
    setNFTContractAddress("");
    setTokenId("");
    setNetwork("");
    setOrderURI("");
  };

  const handleChangeContractAddress1 = (e: any) => {
    const inputValue = e.target.value;
    setContractAddress1(inputValue);
  };
  const handleChangeContractAddress2 = (e: any) => {
    const inputValue = e.target.value;
    setContractAddress2(inputValue);
  };
  const handleChangeTokenId1 = (e: any) => {
    const inputValue = e.target.value;
    setTokenId1(inputValue);
  };
  const handleChangeTokenId2 = (e: any) => {
    const inputValue = e.target.value;
    setTokenId2(inputValue);
  };

  const handleAssetURIChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    setAssetURI(inputValue);
    const [tokenId, nftContractAddress, network] = inputValue
      .split("/")
      .reverse();
    if (
      typeof tokenId !== "string" ||
      typeof nftContractAddress !== "string" ||
      !ethers.utils.isAddress(nftContractAddress) ||
      typeof network !== "string" ||
      !isChain(network) ||
      !config[network]
    ) {
      clear();
      setAssetURIErrorMessage("URI Invalid");
      return;
    }
    const contract = new ethers.Contract(nftContractAddress, abi, provider);
    const owner = await contract.ownerOf(tokenId);
    // const address = setAssetURIErrorMessage("");
    setNFTContractAddress(nftContractAddress);
    setTokenId(tokenId);
    setNetwork(network);
    setOwnerAddress(owner);
  };

  const handleTokenType1 = (e: any) => {
    switch (e.target.value) {
      case "ERC20":
        setTokenType1(ItemType.ERC20);
        break;
      case "ERC721":
        setTokenType1(ItemType.ERC721);
        break;
      case "ERC1155":
        setTokenType1(ItemType.ERC1155);
        break;
    }
  };
  const handleTokenType2 = (e: any) => {
    switch (e.target.value) {
      case "ERC20":
        setTokenType2(ItemType.ERC20);
        break;
      case "ERC721":
        setTokenType2(ItemType.ERC721);
        break;
      case "ERC1155":
        setTokenType2(ItemType.ERC1155);
        break;
    }
  };

  const ipfs = createClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  const createOrder = async () => {
    if (!account || !library) return;
    console.log(account, "account");
    const seaport = new Seaport(library);
    console.log(seaport, "seaport")
    console.log(tokenType1, "tokenType1");
    console.log(contractAddress1, "contractAddress1");
    console.log(tokenId1, "tokenId1");
    console.log(tokenType2, "tokenType2");
    console.log(contractAddress2, "contractAddress2");
    console.log(tokenId2, "tokenId2");
    const { actions } = await seaport.createOrder({
      offer: [
        {
          itemType: tokenType1,
          token: contractAddress1,
          identifier: tokenId1,
        },
        {
          itemType: tokenType2,
          token: contractAddress2,
          identifier: tokenId2,
        },
      ],
      consideration: [
        {
          itemType: ItemType.ERC721,
          token: nftContractAddress,
          identifier: tokenId,
          recipient: account,
        },
      ],
    });
    console.log(actions, "actions");
    const approvalAction = actions[0] as any;
    console.log(actions[0]);
    await approvalAction.transactionMethods.transact();
    const createOrderAction = actions[1] as any;
    const order = await createOrderAction.createOrder();

    const buffer = Buffer.from(JSON.stringify(order));
    const cid = await ipfs.add(buffer);
    sendMessage(ownerAddress, cid.path);

  };

  const connect = async () => {
    activate(injected);
  };

  const sendMessage = async (ownerAddress: string, path: string) => {
    if (!account || !library) {
      console.log("error");
      return;
    }
    const signer = library.getSigner(account);
    const offerer = await Client.create(signer);
    const offererToOwner = await offerer.conversations.newConversation(
      ownerAddress
    );
    const stream = await offererToOwner.streamMessages();

    // TODO: Send Link of Seaport
    await offererToOwner.send("New offer !!");
    const link = "https://otc-swap.vercel.app/fill/" + path;
    await offererToOwner.send(link);

    const msg = await (await stream.next()).value;
    console.log(msg + "was sent to" + ownerAddress);

    toast({
      title: `Offer was sent to ${ownerAddress}, for more negotiations, visit https://www.daopanel.chat/`,
      status: "success",
      isClosable: true,
    });
  };

  return (
    <Box textAlign="center">
      <Text fontWeight="bold" fontSize={"md"} mb="8">
        Create Order
      </Text>
      {!orderURI ? (
        <Box>
          <FormControl isInvalid={assetURIErrorMessage != ""} mb="4">
            <Input
              variant="filled"
              placeholder="OpenSea/TofuNFT URL"
              onChange={handleAssetURIChange}
              rounded={"2xl"}
              fontSize={"sm"}
              value={assetURI}
            />
            <FormErrorMessage ml="4">{assetURIErrorMessage}</FormErrorMessage>
          </FormControl>

          {tokenId && nftContractAddress && network && (
            <>
              <Box textAlign="left" paddingX="4" mb="4">
                <Text fontWeight={"bold"} fontSize={"xs"}>
                  Network:
                </Text>
                <Text fontSize={"xs"} mb={"2"}>
                  {network}
                </Text>
                <Text fontWeight={"bold"} fontSize={"xs"}>
                  Contract address:
                </Text>
                <Text fontSize={"xs"} mb={"2"}>
                  {nftContractAddress}
                </Text>
                <Text fontWeight={"bold"} fontSize={"xs"}>
                  Token ID:
                </Text>
                <Text fontSize={"xs"}>{tokenId}</Text>
                <Text fontWeight={"bold"} fontSize={"xs"}>
                  Owner:
                </Text>
                <Text fontSize={"xs"}>{ownerAddress}</Text>
              </Box>
              <Text>Token 1</Text>
              <Box>
                <Select placeholder="Select option" onChange={handleTokenType1}>
                  <option value="ERC20">ERC20</option>
                  <option value="ERC721">ERC721</option>
                  <option value="ERC1155">ERC1155</option>
                </Select>
                <Input
                  placeholder="ContractAddress"
                  onChange={handleChangeContractAddress1}
                ></Input>
                <Input
                  placeholder="tokenId"
                  onChange={handleChangeTokenId1}
                ></Input>
              </Box>
              <Text mt="10">Token 2</Text>
              <Box>
                <Select placeholder="Select option" onChange={handleTokenType2}>
                  <option value="ERC20">ERC20</option>
                  <option value="ERC721">ERC721</option>
                  <option value="ERC1155">ERC1155</option>
                </Select>
                <Input
                  placeholder="ContractAddress"
                  onChange={handleChangeContractAddress2}
                ></Input>
                <Input
                  placeholder="tokenId"
                  onChange={handleChangeTokenId2}
                ></Input>
              </Box>

              {!account ? (
                <Button
                  width="100%"
                  onClick={connect}
                  fontSize={"sm"}
                  rounded="2xl"
                  mt="10"
                >
                  Connect Wallet
                </Button>
              ) : (
                  <Button
                    width="100%"
                    marginRight={"2"}
                    fontSize={"sm"}
                    rounded="2xl"
                      onClick={() => createOrder()}
                      mt = "5"
                  >
                    Send Message
                  </Button>
              )}
              {orderURI && (
                <Link
                  href={`http://localhost:3000/buy?order=${orderURI}`}
                  isExternal
                >
                  <Text fontSize="xs" color="blue.400">
                    http://localhost:3000/buy?order={orderURI}
                  </Text>
                </Link>
              )}
            </>
          )}
        </Box>
      ) : (
        <Box>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            mb="8"
          >
            <Link href={orderURI} isExternal>
              <Text decoration={"underline"} fontSize={"xs"}>
                {orderURI}
              </Text>
            </Link>
            <IconButton
              aria-label={"copy"}
              icon={<CopyIcon />}
              onClick={onCopy}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};
