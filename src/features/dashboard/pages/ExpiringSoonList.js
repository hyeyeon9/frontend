import { useEffect, useState } from "react";
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService";
import { Link } from "react-router-dom";

function ExpiringSoonList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function getExpiringItems() {
      try {
        const data = await fetchExpiringItems();
        setItems(data);
      } catch (error) {
        console.log(error.message);
      }
    }
    getExpiringItems();
  }, []);

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-2 text-red-700">
        ⏰ 유통기한 임박 상품
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">임박한 상품이 없습니다.</p>
      ) : (
        <ul className="text-sm text-gray-800 space-y-1">
          {items.slice(0, 3).map((item) => (
            <li key={item.batchId} className="flex justify-between">
              <span>[{item.goodsName}]</span>
              <span>
                {item.stockQuantity}개 | {item.expirationDate.split("T")[0]}까지
              </span>
            </li>
          ))}
        </ul>
      )}
      {items.length > 3 && (
        <div className="mt-2 text-right">
          <Link
            to="/expiring-items"
            className="text-blue-600 text-sm hover:underline"
          >
            전체 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}

export default ExpiringSoonList;
