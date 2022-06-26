import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
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
import { BigNumber, ethers } from "ethers";
import createClient from "ipfs-http-client";
import React, { useState } from "react";

import { ItemType, MAX_INT, NO_CONDUIT, OrderType } from "../constants";
import { abi } from "../lib/abi";
import config from "../lib/web3/config.json";
import { injected } from "../lib/web3/injected";
import { ApprovalAction, CreateOrderAction } from "../types";
import { Chain, isChain } from "../types/chain";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const Request: React.FC = () => {
  const [assetURI, setAssetURI] = useState("");
  const [ownerAddress, setOwnerAddress] = useState(
    "0x5442d67C172e7eE94b755B2E3CA3529805B1c607"
  );
  const [assetURIErrorMessage, setAssetURIErrorMessage] = useState("");

  const [network, setNetwork] = useState<Chain | "">("");

  const [nftContractAddress, setNFTContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tokenId1, setTokenId1] = useState("");
  const [tokenId2, setTokenId2] = useState("");
  const [cid, setCid] = useState("");

  const [contractAddress1, setContractAddress1] = useState("");
  const [contractAddress2, setContractAddress2] = useState("");

  const [tokenType1, setTokenType1] = React.useState() as any;
  const [tokenType2, setTokenType2] = React.useState() as any;
  const [orderURI, setOrderURI] = React.useState("");
  const toast = useToast();
  const rpc = "https://rinkeby.infura.io/v3/95f65ab099894076814e8526f52c9149";
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  // const provider = ethers.getDefaultProvider() as JsonRPCProvider;

  let seaport = new Seaport(provider);
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
    console.log(owner);
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
    const inputValue = e.target.value;
    setTokenType1(inputValue);
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
    const inputValue = e.target.value;
    setTokenType1(inputValue);
  };

  const ipfs = createClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  const generateRandomSalt = () => {
    return `0x${Buffer.from(ethers.utils.randomBytes(16)).toString("hex")}`;
  };

  const createOrder = async () => {
    if (!account || !library) return;
    console.log(account, "account");
    console.log(seaport, "seaport")
    seaport = await new Seaport(library);
    const startTime = "0";
    const endTime = MAX_INT.toString();
    const salt = generateRandomSalt();
    const order = await seaport.createOrder({
      startTime,
      endTime,
      salt,
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
          amount: ethers.utils.parseEther("1").toString(),
          recipient: account,
        },
      ],
    });

    // console.log(actions, "actions");
    // const approvalAction = actions[0] as any;
    // console.log(actions[0]);
    // await approvalAction.transactionMethods.transact();
    // const createOrderAction = actions[1] as any;
    // const order = await createOrderAction.createOrder();
    // console.log(order, "order");

    const buffer = Buffer.from(JSON.stringify(order));
    const cid = await ipfs.add(buffer);
    setCid(cid.path);
    console.log(cid);
  };

  const connect = async () => {
    activate(injected);
  };

  const sendMessage = async (ownerAddress: string) => {
    await createOrder();
    if (!account || !library) {
      console.log("error");
      return;
    }
    const signer = library.getSigner(account);
    const offerer = await Client.create(signer);
    console.log(offerer, "offerer");
    const offererToOwner = await offerer.conversations.newConversation(
      ownerAddress
    );
    console.log(offererToOwner, "offererToOwner");
    const stream = await offererToOwner.streamMessages();

    // TODO: Send Link of Seaport
    await offererToOwner.send("New offer !!");
    const link = "https://otc-swap.vercel.app/fill/" + cid;
    await offererToOwner.send(link);

    const msg = await (await stream.next()).value;
    console.log(msg + "was sent to" + ownerAddress);
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
                <Flex justify={"space-between"}>
                  <Button
                    width="100%"
                    marginRight={"2"}
                    fontSize={"sm"}
                    rounded="2xl"
                    onClick={() => sendMessage(ownerAddress)}
                  >
                    Send Message
                  </Button>
                  <Button onClick={createOrder}>Create Order</Button>
                </Flex>
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
          <Button width="100%" onClick={clear} fontSize={"sm"} rounded="2xl">
            Create New Order
          </Button>
        </Box>
      )}
    </Box>
  );
};
