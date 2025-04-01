import { useEffect, useState } from "react";
import { fetchOrders, requestOrder } from "../api/HttpOrderingService";
import { fetchInventoryList } from "../../inventory/api/HttpInventoryService";
import {
  fetchGoodsByCategory,
  fetchGoodsBySubCategory,
  fetchGoodsList,
} from "../../goods/api/HttpGoodsService";
import {
  AlertCircle,
  CheckCircle,
  Filter,
  Info,
  Package,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function getInventoryList() {
      try {
        setLoading(true);
        const data = await fetchInventoryList();
        setInventoryList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getInventoryList();
  }, []);

  // 리스트 가져오기
  useEffect(() => {
    async function getOrdersList() {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        console.log("발주 리스트", data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getOrdersList();
  }, []);

  // 발주 버튼을 누른경우
  async function handleConfirmAddStock() {
    // Object.entries : key - value 쌍으로
    const orders = Object.entries(selectedItems)
      .filter(
        ([goodsId, data]) => data.quantity && Number.parseInt(data.quantity) > 0
      )
      .map(([goodsId, data]) => ({
        goodsId: Number.parseInt(goodsId),
        quantity: Number.parseInt(data.quantity),
      }));

    if (orders.length === 0) {
      alert("수량이 입력된 상품이 없습니다.");
      return;
    }

    setProcessingOrder(true);
    try {
      for (const order of orders) {
        await requestOrder(order.goodsId, order.quantity);
      }

      alert("모든 발주가 등록되었습니다.");
      setSelectedItems({}); // 초기화
    } catch (error) {
      alert(`발주 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setProcessingOrder(false);
    }
  }

  useEffect(() => {
    async function getGoodsList() {
      try {
        const data = await fetchGoodsList();
        setGoodsList(data);
      } catch (error) {
        setError(error.message);
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
      try {
        const result = await getFilteredInventory(
          inventoryList,
          category,
          subCategory,
          statusFilter,
          searchQuery,
          sortOption
        );
        setFilteredInventory(result);
      } catch (error) {
        setError(error.message);
      }
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

  // 선택된 상품 총 개수
  const selectedCount = Object.keys(selectedItems).length;

  // 선택된 상품 총 수량
  const totalQuantity = Object.values(selectedItems).reduce((sum, item) => {
    return sum + (Number.parseInt(item.quantity) || 0);
  }, 0);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-indigo-600" />
            발주 관리
          </h1>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 검색창 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="상품명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* 카테고리 필터 */}
            <div className="flex gap-3">
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">모든 카테고리</option>
                <option value="식품">식품</option>
                <option value="음료">음료</option>
                <option value="생활용품">생활용품</option>
                <option value="디지털 & 문구">디지털 & 문구</option>
              </select>

              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!category}
              >
                <option value="">모든 하위 카테고리</option>
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
                ) : null}
              </select>
            </div>

            {/* 정렬 옵션 */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">기본 정렬</option>
              <option value="stock_asc">재고 적은순</option>
              <option value="stock_desc">재고 많은순</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
            </select>
          </div>

          {/* 재고 상태 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === ""
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter("정상")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "정상"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                정상
              </button>
              <button
                onClick={() => setStatusFilter("재고부족")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "재고부족"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                재고부족
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 상품 목록 */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500">
                데이터를 불러오는 중 오류가 발생했습니다.
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                <Info className="h-12 w-12 mb-2 text-gray-400" />
                <p>표시할 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            filteredInventory.length > 0 &&
                            filteredInventory.every(
                              (item) => selectedItems[item.goods_id]
                            )
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이미지
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상품명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가격
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        재고
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        발주 수량
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.goods_id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedItems[item.goods_id])}
                            onChange={() => handleSelectItem(item.goods_id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.goods_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={item.goods_image || "/placeholder.svg"}
                            alt={item.goods_name}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.goods_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-indigo-600">
                            {Number(item.goods_price).toLocaleString()}원
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.stockStatus === "재고부족" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {item.stockQuantity}개
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {item.stockQuantity}개
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={selectedItems[item.goods_id]?.quantity || ""}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.goods_id,
                                e.target.value
                              )
                            }
                            disabled={!selectedItems[item.goods_id]}
                            min="1"
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center disabled:bg-gray-100 disabled:text-gray-400"
                            placeholder="수량"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 발주 장바구니 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-indigo-600" />
                발주 예정 상품
                <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-2 py-0.5">
                  {selectedCount}
                </span>
              </h3>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {Object.keys(selectedItems).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>발주할 상품을 선택해주세요</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {Object.entries(selectedItems).map(([goodsId, data]) => {
                    if (!data) return null;

                    const product = goodsList.find(
                      (g) => g.goods_id === Number.parseInt(goodsId)
                    );

                    if (!product) return null;

                    return (
                      <li
                        key={goodsId}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <img
                            src={product.goods_image || "/placeholder.svg"}
                            alt={product.goods_name}
                            className="w-10 h-10 object-cover rounded-md mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
                              {product.goods_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.quantity
                                ? `${data.quantity}개`
                                : "수량 미지정"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectItem(goodsId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">총 발주 수량:</span>
                <span className="font-bold text-indigo-700">
                  {totalQuantity}개
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setSelectedItems({})}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                  disabled={Object.keys(selectedItems).length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  선택 초기화
                </button>

                <button
                  onClick={handleConfirmAddStock}
                  disabled={
                    Object.keys(selectedItems).length === 0 ||
                    !Object.values(selectedItems).some(
                      (item) => item.quantity
                    ) ||
                    processingOrder
                  }
                  className={`w-full px-4 py-2 rounded-lg text-white flex items-center justify-center ${
                    Object.keys(selectedItems).length === 0 ||
                    !Object.values(selectedItems).some(
                      (item) => item.quantity
                    ) ||
                    processingOrder
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } transition-colors`}
                >
                  {processingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      발주하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderingPage;
