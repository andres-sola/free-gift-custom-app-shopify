import { ResourceList, TextStyle, Stack, Button, Badge, Tooltip } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";
import axios from "axios";

export function DiscountsList({ data }) {
  const [open, setOpen] = useState(false);
  const [discountid, setDiscountid] = useState("");
  const [discounts, setDiscounts] = useState([]);

  const getDiscounts = async () => {
    const discounts = await axios.get('/discounts');
    setDiscounts(discounts.data);
  }

  useEffect(() => {
    getDiscounts();
  }, []);

  const selectProducts = (e) => {
    setOpen(true);
    const selectedDiscount = e.target.closest('.Polaris-ResourceItem__Container').id;
    setDiscountid(selectedDiscount);
  }

  const handleSelection = (resources) => {
    setOpen(false);    
    const productData = {
      productCounts: resources.selection.length,
      productsId: resources.selection.map((product) => product.variants[0].id).toString(),
      productsTitle: resources.selection.map((product) => product.title).toString(),
    }
    saveProducts(discountid, productData);
  };

  const saveProducts = (discountid, data) => {
    axios.post('/updatediscount', {
      discounts: discountid,
      products: data
    }).then((res) => location.reload());
  };

  return (
    <>
      <ResourceList // Defines your resource list component
        showHeader
        resourceName={{ singular: "Discount", plural: "Discounts" }}
        items={data}
        renderItem={(item) => {
          return (
            <ResourceList.Item
              id={item.node.id}
            >
              <Stack alignment="center">
                <Stack.Item fill>
                  <h3>
                    <TextStyle variation="strong">{item.node.discountCodes.edges[0].node.code}</TextStyle>
                  </h3>
                </Stack.Item>
                { 
                  discounts.length > 0 && 
                  discounts.filter((discount) => discount.discountId == item.node.id) != 0 &&
                  <Tooltip active={false} content={discounts.filter((discount) => discount.discountId == item.node.id)[0].productsTitle}>
                    <Stack.Item>
                      <Badge status="success">{discounts.filter((discount) => discount.discountId == item.node.id)[0].productsCount} Products</Badge>
                    </Stack.Item>
                  </Tooltip>
                }
                <Stack.Item>
                  <Badge status="success" progress="complete">Active</Badge>
                </Stack.Item>
                <Stack.Item>
                  <Button onClick={(e) => selectProducts(e)} primary>Select Products</Button>
                </Stack.Item>
              </Stack>
            </ResourceList.Item>
          );
        }}
      />
      <ResourcePicker // Resource picker component
        resourceType="Product"
        showVariants={true}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
