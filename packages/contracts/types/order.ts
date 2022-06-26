export enum RequestEnum {
  Sell,
  Buy,
}

export interface Order {
  request: RequestEnum;
  seller: string;
  buyer: string;
  nftContractAddress: string;
  currencyContractAddress: string;
  tokenId: string;
  value: string;
  tip: string;
  salt: string;
}
