import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
} from "ethers";

import { ItemType } from "../constants";
import type { ERC20 } from "./typechain/ERC20";
import type { ERC721 } from "./typechain/ERC721";

export type ContractMethodReturnType<
  T extends Contract,
  U extends keyof T["callStatic"]
  // eslint-disable-next-line no-undef
> = Awaited<ReturnType<T["callStatic"][U]>>;

export type TransactionMethods<T = unknown> = {
  buildTransaction: (overrides?: Overrides) => Promise<PopulatedTransaction>;
  callStatic: (overrides?: Overrides) => Promise<T>;
  estimateGas: (overrides?: Overrides) => Promise<BigNumber>;
  transact: (overrides?: Overrides) => Promise<ContractTransaction>;
};

export type ApprovalAction = {
  type: "approval";
  token: string;
  identifierOrCriteria: string;
  itemType: ItemType;
  operator: string;
  transactionMethods:
    | TransactionMethods<ContractMethodReturnType<ERC721, "setApprovalForAll">>
    | TransactionMethods<ContractMethodReturnType<ERC20, "approve">>;
};
