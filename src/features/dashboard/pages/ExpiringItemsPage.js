import { useEffect, useState } from "react";
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService";

function ExpiringItemsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function getExpiringItems() {
      try {
        const data = await fetchExpiringItems();
        setItems(data);
      } catch (error) {}
    }
    getExpiringItems();
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage); // 12/10 = 2페이로 나옴
  const currentItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        ⏰ 유통기한 임박 상품 전체 목록
      </h1>
      <p className="text-base mb-2 ml-2 text-blue-800">상품을 확인하고 폐기 처리하세요.</p>
      {items.length === 0 ? (
        <p className="text-gray-500">임박한 상품이 없습니다.</p>
      ) : (
        <>
          <ul className="bg-white shadow-md rounded p-4 pt-6 space-y-2 border h-[450px] overflow-y-auto">
            {currentItems.map((item) => (
              <li
                key={item.batchId}
                className="flex justify-between text-base border-b pb-1 "
              >
                <span>[{item.goodsName}]</span>
                <span>
                  {item.stockQuantity}개 | {item.expirationDate.split("T")[0]}
                  까지
                </span>
              </li>
            ))}
          </ul>
         
          {/* // 페이지네이션 */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ExpiringItemsPage;
