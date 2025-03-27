import { useEffect, useState } from "react";
import { requestOrder } from "../api/HttpOrderingService";
import { fetchInventoryList } from "../../inventory/api/HttpInventoryService";
import {
  fetchGoodsByCategory,
  fetchGoodsBySubCategory,
  fetchGoodsList,
} from "../../goods/api/HttpGoodsService";

function OrderingPage() {
  const [inventoryList, setInventoryList] = useState([]);
  const [goodsList, setGoodsList] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  const [selectedItems, setSelectedItems] = useState({}); // 객체 Object

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // 상품 상태 필터 (정상.재고부족)
  const [searchQuery, setSearchQuery] = useState(""); // (상품 검색창)

  useEffect(() => {
    async function getInventoryList() {
      try {
        const data = await fetchInventoryList();
        console.log("인벤토리 리스트", data);
        setInventoryList(data);
      } catch (error) {
        console.log(error.message);
      }
    }
    getInventoryList();
    console.log("goods", goodsList);
  }, []);

  // 발주 버튼을 누른경우
  async function handleConfirmAddStock() {
    console.log("발주 버튼 클릭");

    // Object.entries : key - value 쌍으로
    const orders = Object.entries(selectedItems)
      .filter(([goodsId, data]) => data.quantity && parseInt(data.quantity) > 0)
      .map(([goodsId, data]) => ({
        goodsId: parseInt(goodsId),
        quantity: parseInt(data.quantity),
      }));

    if (orders.length === 0) {
      alert("수량이 입력된 상품이 없습니다.");
      return;
    }

    try {
      for (const order of orders) {
        await requestOrder(order.goodsId, order.quantity);
      }

      alert("모든 발주가 등록되었습니다.");

      setSelectedItems({}); // 초기화
    } catch (error) {
      console.error("입고 중 오류 발생", error.message);
    }
  }

  useEffect(() => {
    async function getGoodsList() {
      try {
        const data = await fetchGoodsList();
        setGoodsList(data);
      } catch (error) {
        console.error("입고 중 오류 발생", error.message);
      }
    }
    getGoodsList();
  }, []);

  function handleSelectItem(goodsId) {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[goodsId]) {
        delete updated[goodsId]; 
      } else {
        updated[goodsId] = { quantity: "" };
      }
      return updated;
    });
  }

  function handleQuantityChange(goodsId, quantity) {
    setSelectedItems((prev) => ({
      ...prev,
      [goodsId]: {
        ...prev[goodsId],
        quantity,
      },
    }));
  }

  function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const newSelections = {};

    if (isChecked) {
      filteredInventory.forEach((item) => {
        newSelections[item.goods_id] = { quantity: "" };
      });
    }

    setSelectedItems(isChecked ? newSelections : {});
  }

  function handleCategoryChange(e) {
    setCategory(e.target.value);
    setSubCategory(""); // 대분류 바뀌면 소분류 초기화
  }

  async function getFilteredInventory(
    inventoryList,
    category,
    subCategory,
    statusFilter,
    searchQuery,
    sortOption
  ) {
    let goodsList = [];

    // 1. 카테고리에 따라 서버에서 goods 불러오기
    if (category && subCategory) {
      goodsList = await fetchGoodsBySubCategory(category, subCategory);
    } else if (category) {
      goodsList = await fetchGoodsByCategory(category);
    } else {
      goodsList = await fetchGoodsList();
    }

    // 2. 재고 병합 및 상태 재계산
    const mergedMap = new Map();

    inventoryList.forEach((item) => {
      const existing = mergedMap.get(item.goodsId);
      if (existing) {
        const newStock = existing.stockQuantity + item.stockQuantity;
        mergedMap.set(item.goodsId, {
          ...existing,
          stockQuantity: newStock,
          stockStatus: newStock >= 5 ? "정상" : "재고부족",
        });
      } else {
        mergedMap.set(item.goodsId, {
          ...item,
          stockStatus: item.stockQuantity >= 5 ? "정상" : "재고부족",
        });
      }
    });

    let mergedList = Array.from(mergedMap.values());

    // 3. inventory + goods 병합
    mergedList = mergedList
      .filter((item) => goodsList.some((g) => g.goods_id === item.goodsId))
      .map((item) => {
        const matched = goodsList.find((g) => g.goods_id === item.goodsId);
        return {
          ...item,
          ...matched,
        };
      });

    // 4. 상태 필터링
    if (statusFilter) {
      mergedList = mergedList.filter(
        (item) => item.stockStatus === statusFilter
      );
    }

    // 5. 검색 필터링
    if (searchQuery.trim() !== "") {
      mergedList = mergedList.filter((item) =>
        item.goods_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 6. 정렬
    if (sortOption === "price_asc") {
      mergedList.sort((a, b) => a.goods_price - b.goods_price);
    } else if (sortOption === "price_desc") {
      mergedList.sort((a, b) => b.goods_price - a.goods_price);
    } else if (sortOption === "stock_asc") {
      mergedList.sort((a, b) => a.stockQuantity - b.stockQuantity);
    } else if (sortOption === "stock_desc") {
      mergedList.sort((a, b) => b.stockQuantity - a.stockQuantity);
    }

    return mergedList;
  }

  useEffect(() => {
    if (!inventoryList.length) return;

    async function fetchAndFilter() {
      const result = await getFilteredInventory(
        inventoryList,
        category,
        subCategory,
        statusFilter,
        searchQuery,
        sortOption
      );
      setFilteredInventory(result);
    }

    fetchAndFilter();
  }, [
    inventoryList,
    category,
    subCategory,
    statusFilter,
    searchQuery,
    sortOption,
  ]);

  return (
    <>
      <div className="p-6 min-h-screen space-y-6">
        {/* 검색창 */}
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="상품명을 입력하세요."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            className="w-1/2 p-2 border rounded shadow-sm"
          />
        </div>

        {/* 2. 상태 필터 (전체, 정상, 재고부족) */}
        <div className="flex justify-center gap-2">
          {["전체", "정상", "재고부족"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === "전체" ? "" : status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                statusFilter === status || (status === "전체" && !statusFilter)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* 카테고리 정렬 */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="border p-2 rounded"
            >
              <option value="">대분류</option>
              <option value="식품">식품</option>
              <option value="음료">음료</option>
              <option value="생활용품">생활용품</option>
              <option value="디지털 & 문구">디지털 & 문구</option>
            </select>

            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">소분류</option>
              {category === "식품" ? (
                <>
                  <option value="즉석식품">즉석식품</option>
                  <option value="라면 & 면류">라면 & 면류</option>
                  <option value="베이커리 & 샌드위치">
                    베이커리 & 샌드위치
                  </option>
                  <option value="냉장 & 냉동식품">냉장 & 냉동식품</option>
                  <option value="과자 & 스낵">과자 & 스낵</option>
                  <option value="아이스크림 & 디저트">
                    아이스크림 & 디저트
                  </option>
                </>
              ) : category === "음료" ? (
                <>
                  <option value="커피 & 차">커피 & 차</option>
                  <option value="탄산음료">탄산음료</option>
                  <option value="주스 & 건강음료">주스 & 건강음료</option>
                  <option value="유제품 & 두유">유제품 & 두유</option>
                  <option value="주류">주류</option>
                </>
              ) : category === "생활용품" ? (
                <>
                  <option value="위생용품">위생용품</option>
                  <option value="욕실용품">욕실용품</option>
                  <option value="뷰티 & 화장품">뷰티 & 화장품</option>
                  <option value="의약 & 건강">의약 & 건강</option>
                </>
              ) : category === "디지털 & 문구" ? (
                <>
                  <option value="전자기기 & 액세서리">
                    전자기기 & 액세서리
                  </option>
                  <option value="문구류">문구류</option>
                </>
              ) : (
                <></>
              )}
            </select>
          </div>

          <div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">기본</option>
              <option value="stock_asc">재고 적은순</option>
              <option value="stock_desc">재고 많은순</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <div className=" flex-1">
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm">
                    <th className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={
                          filteredInventory.length > 0 &&
                          filteredInventory.every(
                            (item) => selectedItems[item.goods_id]
                          )
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">이미지</th>
                    <th className="px-4 py-2">상품명</th>
                    <th className="px-4 py-2">가격</th>
                    <th className="px-4 py-2">카테고리</th>
                    <th className="px-4 py-2">등록일</th>
                    <th className="px-4 py-2">재고</th>
                    <th className="px-4 py-2">수량</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr
                      key={item.goods_id}
                      className="text-center border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedItems[item.goods_id])}
                          onChange={() => handleSelectItem(item.goods_id)}
                        />
                      </td>
                      <td className="px-4 py-2">{item.goods_id}</td>
                      <td className="px-4 py-2">
                        <img
                          src={item.goods_image}
                          alt={item.goods_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {item.goods_name}
                      </td>
                      <td className="px-4 py-2 text-indigo-600 font-semibold">
                        {Number(item.goods_price).toLocaleString()}원
                      </td>
                      <td className="px-4 py-2">{item.category_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {item.goods_created_at}
                      </td>
                      <td className="px-4 py-2">{item.goods_stock}개</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={selectedItems[item.goods_id]?.quantity || ""}
                          onChange={(e) =>
                            handleQuantityChange(item.goods_id, e.target.value)
                          }
                          disabled={!selectedItems[item.goods_id]}
                          className="w-20 p-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 장바구니 */}
          <div className="w-1/4 p-4 bg-gray-100 rounded shadow-md">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold mb-2">🛒 발주 예정 상품</h3>
              <h3>{Object.entries(selectedItems).length}개</h3>
            </div>

            <ul className="space-y-1 text-sm min-h-10">
              {Object.entries(selectedItems).map(([goodsId, data]) => {
                if (!data) return null;

                const product = goodsList.find(
                  (g) => g.goods_id === parseInt(goodsId)
                );

                return (
                  <li key={goodsId} className="flex justify-between">
                    <span>{product?.goods_name || "알 수 없음"}</span>
                    <span>{data.quantity}개</span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => setSelectedItems({})}
              className="mt-4 w-full bg-red-400 text-white rounded hover:bg-red-500 py-2 rounded"
            >
              선택 초기화
            </button>
            <button
              onClick={handleConfirmAddStock}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              발주하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderingPage;
