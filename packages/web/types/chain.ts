export type Chain = "rinkeby";

export const isChain = (chain: string): chain is Chain => {
  return chain === "rinkeby";
};
