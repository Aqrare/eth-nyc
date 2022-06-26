import type { NextPage } from "next";

import { Container } from "../../components/Container";
import { Fulfill } from "../../components/Fulfill";
import { Layout } from "../../components/Layout";

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}

const XMTP: NextPage = () => {
  return (
    <Layout>
      <Container>
        <Fulfill></Fulfill>
      </Container>
    </Layout>
  );
};

export default XMTP;
