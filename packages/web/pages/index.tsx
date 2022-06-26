import type { NextPage } from "next";

import { Container } from "../components/Container";
import { Layout } from "../components/Layout";
import { Request } from "../components/Request";

const IndexPage: NextPage = () => {
  return (
    <Layout>
      <Container>
        <Request />
      </Container>
    </Layout>
  );
};

export default IndexPage;
