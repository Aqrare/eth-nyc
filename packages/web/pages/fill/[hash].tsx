import type { NextPage } from "next";

import { Fulfill } from "../../components/Fulfill";

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}


const XMTP: NextPage = () => {
  return <Fulfill></Fulfill>;
};


export default XMTP;
