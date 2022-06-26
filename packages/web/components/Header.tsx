import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, IconButton, Link, Text, useColorMode } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import React from "react";

import { injected } from "../lib/web3/injected";

export const Header: React.FC = () => {
  const { activate, account, deactivate } = useWeb3React<Web3Provider>();

  const connect = async () => {
    activate(injected);
  };

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box>
      <Flex minH={"64px"} alignItems={"center"} justifyContent={"space-between"} p={{ base: 8 }}>
        <Link href="/">
          <Text fontSize={"lg"} fontWeight={"bold"}>
            OTC Swap
          </Text>
        </Link>
        <Flex gap={"16px"}>
          {!account ? (
            <Button onClick={connect} fontSize={"xs"} rounded={"2xl"}>
              Connect Wallet
            </Button>
          ) : (
            <>
              <Button fontSize={"xs"} maxWidth={"40"} rounded={"2xl"} onClick={deactivate}>
                <Text noOfLines={1}>{account}</Text>
              </Button>
            </>
          )}
          <IconButton
            rounded={"2xl"}
            aria-label={"dark mode switch"}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
