import { Box, Container, Flex, Stack } from "@chakra-ui/react";
import React from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.VFC<LayoutProps> = ({ children }) => {
  return (
    <Flex minHeight={"100vh"} direction={"column"}>
      <Header />
      <Box flex={1}>
        <Container>
          <Stack>{children}</Stack>
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
};
