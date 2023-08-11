import { gql, useQuery } from "@apollo/client";
import { Page, Layout, Banner, Card } from "@shopify/polaris";
import { Loading } from "@shopify/app-bridge-react";
import { DiscountsList } from "./DiscountsList";
import axios from "axios";
// GraphQL query to retrieve products by IDs.
// The price field belongs to the variants object because
// product variants can have different prices.
const GET_DISCOUNTS = gql`
{
  priceRules(first:99) {
    edges {
      node {
        id
        status
        discountCodes(first: 1) {
          edges {
            node {
              code
              id
            }
          }
        }
      }
    }
  }
}
`;
export function DiscountList() {
  const { loading, error, data, refetch } = useQuery(GET_DISCOUNTS);
  if (loading) return <Loading />;
  console.log(data);
  if (error) {
    console.warn(error);
    return (
      <Banner status="critical">There was an issue loading discounts.</Banner>
    );
  }

  // axios.post('/savediscounts', {
  //   discounts: data.priceRules.edges
  // }).then((res) => console.log(res));

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <DiscountsList data={data.priceRules.edges} />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
