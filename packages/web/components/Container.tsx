import { Box, Flex, useColorModeValue } from "@chakra-ui/react";

export interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <Flex justifyContent="center">
      <Box width="xl" bgColor={useColorModeValue("white", "gray.700")} padding={8} rounded="2xl" shadow="xl">
        {children}
      </Box>
    </Flex>
  );
};
