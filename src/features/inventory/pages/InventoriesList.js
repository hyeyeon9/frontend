import { useEffect, useState } from "react";
import { fetchInventoryList } from "../api/HttpService";

function InventoriesList() {
  const [inventoryList, setInventoryList] = useState([]);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInventoryList() {
      try {
        const data = await fetchInventoryList();
        console.log("data",data);
        setInventoryList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getInventoryList();
  }, []);

  return (
    <>
      {loading && <h1>로딩중 .. </h1>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div>
          {inventoryList.map((item) => (
            <div key={item.inventoryId}>
              재고 수정일 : {item.stockUpdateAt}
              이름 : {item. goodsName }
              재고 수량 : {item.stockQuantity}
              재고 상태 : {item.stockStatus}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default InventoriesList;
