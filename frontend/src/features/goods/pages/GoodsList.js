import { useEffect, useState } from "react";
import { fetchGoodsList } from "../api/HttpGoodsService";
import { Link } from "react-router-dom";
import MenuNavigation from "../components/MenuNavigation";
import { FormatDate } from "../../disposal/components/FormatDate";
import { Tag, X } from "lucide-react";

function GoodsList() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // 상품 리스트 가져오기
  useEffect(() => {
    async function getGoodsList() {
      try {
        const data = await fetchGoodsList();
        console.log("data", data);
        setGoodsList(data);
        setFilteredList(data); // 초기엔 전체 목록
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsList();
  }, []);

  const [discountItems, setDiscountItems] = useState([]);
  const [showExpiringNotification, setShowExpiringNotification] =
    useState(false);

  // 유통기한에서 넘어온 할인추천 상품
  useEffect(() => {
    const storedItems = localStorage.getItem("selectedForDiscount");
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        setDiscountItems(parsed);

        // 로컬스토리지 지우기
        localStorage.removeItem("selectedForDiscount");
      } catch (error) {
        console.log(error.message);
      } finally {
        setShowExpiringNotification(true);
      }
    }
  }, []);

  // 검색 구현
  function handleQuery(e) {
    const value = e.target.value;
    setQuery(value);

    const filtered = goodsList.filter((item) =>
      item.goods_name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredList(filtered);
  }

  // 정렬 기능
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 목록 가져오기
  const getSortedItems = () => {
    if (!sortConfig.key) return filteredList;

    return [...filteredList].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  // 재고 상태에 따른 스타일 및 텍스트
  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return { color: "bg-red-100 text-red-800", text: "품절" };
    } else if (stock < 5) {
      return { color: "bg-orange-100 text-orange-800", text: "부족" };
    } else if (stock < 20) {
      return { color: "bg-yellow-100 text-yellow-800", text: "적정" };
    } else {
      return { color: "bg-green-100 text-green-800", text: "충분" };
    }
  };

  const sortedItems = getSortedItems();

  return (
    <>
      <MenuNavigation />
      <div className="p-6 bg-gray-100 min-h-screen">
        {showExpiringNotification && discountItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-amber-600 mr-3" />
              <div>
                <h3 className="font-medium text-amber-800">
                  유통기한 임박 할인 제안
                </h3>
                <p className="text-amber-700 text-sm">
                  유통기한 임박 페이지에서 선택한{" "}
                  <span className="font-semibold">
                    {" "}
                    {discountItems
                      .map((item) => item.goodsName)
                      .join(", ")}{" "}
                  </span>
                  상품에 대해 할인 적용을 추천합니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExpiringNotification(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* 헤더 및 검색 영역 */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 mr-2 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                상품 목록
                <span className="ml-3 text-sm font-normal text-gray-500">
                  {filteredList.length}개의 상품
                </span>
              </h1>

              <div className="flex items-center mt-4 md:mt-0 space-x-3">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md ${
                    viewMode === "table"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <Link
                  to="/goods/manage/add"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  상품 추가
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="상품명으로 검색하세요"
                value={query}
                onChange={(e) => handleQuery(e)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setFilteredList(goodsList);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="bg-white p-8 rounded-xl shadow-md flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <span className="ml-3 text-gray-600">
                상품 목록을 불러오는 중...
              </span>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p className="font-medium">오류가 발생했습니다</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* 상품 목록 - 테이블 뷰 */}
          {!loading && !error && viewMode === "table" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      <th
                        className="xl:px-6 py-3 lg:px-5 ursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("goods_id")}
                      >
                        <div className="flex items-center">
                          ID
                          {sortConfig.key === "goods_id" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ml-1 ${
                                sortConfig.direction === "ascending"
                                  ? ""
                                  : "transform rotate-180"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="xl:px-6 py-3 lg:px-4 whitespace-nowrap">
                        이미지
                      </th>
                      <th
                        className="xl:px-6 py-3  lg:px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("goods_name")}
                      >
                        <div className="flex items-center">
                          상품명
                          {sortConfig.key === "goods_name" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ml-1 ${
                                sortConfig.direction === "ascending"
                                  ? ""
                                  : "transform rotate-180"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="xl:px-6 py-3 lg:px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("goods_price")}
                      >
                        <div className="flex items-center">
                          가격
                          {sortConfig.key === "goods_price" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ml-1 ${
                                sortConfig.direction === "ascending"
                                  ? ""
                                  : "transform rotate-180"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="xl:px-6 py-3 lg:px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("goods_created_at")}
                      >
                        <div className="flex items-center">
                          등록일
                          {sortConfig.key === "goods_created_at" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ml-1 ${
                                sortConfig.direction === "ascending"
                                  ? ""
                                  : "transform rotate-180"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="xl:px-6 py-3 lg:px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("goods_stock")}
                      >
                        <div className="flex items-center">
                          재고
                          {sortConfig.key === "goods_stock" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ml-1 ${
                                sortConfig.direction === "ascending"
                                  ? ""
                                  : "transform rotate-180"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3">관리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          검색 결과가 없습니다
                        </td>
                      </tr>
                    ) : (
                      sortedItems.map((item) => {
                        const stockStatus = getStockStatus(item.goods_stock);
                        return (
                          <tr
                            key={item.goods_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="xl:px-6 py-4 lg:px-5 whitespace-nowrap text-sm text-gray-500">
                              {item.goods_id}
                            </td>
                            <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap">
                              <div className="relative group">
                                <img
                                  src={
                                    `${item.goods_image}` || "/placeholder.svg"
                                  }
                                  alt={item.goods_name}
                                  className="xl:w-16 h-16 lg:w-20 object-cover rounded-md border border-gray-200 group-hover:border-indigo-300 transition-colors"
                                />
                                {item.discountRate && (
                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                                    {item.discountRate}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.goods_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                카테고리 ID: {item.category_id}
                              </div>
                            </td>
                            <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap">
                              {/* 할인 중인 경우 */}
                              {item.discountRate ? (
                                <>
                                  <div className="text-sm text-gray-500 line-through">
                                    {Number(
                                      item.originalPrice
                                    ).toLocaleString()}
                                    원
                                  </div>
                                  <div className="text-sm font-semibold text-red-600">
                                    {Number(item.goods_price).toLocaleString()}
                                    원
                                  </div>
                                </>
                              ) : (
                                // 할인 아닌 경우
                                <div className="text-sm font-semibold text-indigo-600">
                                  {Number(item.goods_price).toLocaleString()}원
                                </div>
                              )}
                            </td>
                            <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap text-sm text-gray-500">
                              {FormatDate(item.goods_created_at).substring(
                                0,
                                13
                              )}
                            </td>
                            <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}
                                >
                                  {stockStatus.text}
                                </span>
                                <span className="ml-2 text-sm text-gray-600">
                                  {item.goods_stock}개
                                </span>
                              </div>
                            </td>
                            <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link
                                  to={`/goods/findById/${item.goods_id}`}
                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded"
                                >
                                  상세
                                </Link>
                                <Link
                                  to={`/goods/edit/${item.goods_id}`}
                                  className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                                >
                                  수정
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 상품 목록 - 그리드 뷰 */}
          {!loading && !error && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedItems.length === 0 ? (
                <div className="col-span-full bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
                  검색 결과가 없습니다
                </div>
              ) : (
                sortedItems.map((item) => {
                  const stockStatus = getStockStatus(item.goods_stock);
                  return (
                    <div
                      key={item.goods_id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={`${item.goods_image}` || "/placeholder.svg"}
                          alt={item.goods_name}
                          className="w-full h-48 object-cover"
                        />
                        {item.discountRate && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {item.discountRate}% 할인
                          </div>
                        )}
                        <div
                          className={`absolute top-2 left-2 ${stockStatus.color} px-2 py-1 rounded-full text-xs font-bold`}
                        >
                          {stockStatus.text}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.goods_name}
                        </h3>
                        <div className="mt-1 flex justify-between items-center">
                          <div>
                            <div className="text-lg font-semibold text-indigo-600">
                              {Number(item.goods_price).toLocaleString()}원
                            </div>
                            {item.discountRate ? (
                              <div className="text-xs text-red-500">
                                {Math.floor(
                                  item.goods_price *
                                    (1 - item.discountRate / 100)
                                ).toLocaleString()}
                                원
                              </div>
                            ) : (
                              <div className="text-xs text-transparent">-</div> // 투명하게 공간만 확보
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            재고: {item.goods_stock}개
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Link
                            to={`/goods/findById/${item.goods_id}`}
                            className="flex-1 text-center text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200 text-sm transition-colors"
                          >
                            상세
                          </Link>
                          <Link
                            to={`/goods/edit/${item.goods_id}`}
                            className="flex-1 text-center text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200 text-sm transition-colors"
                          >
                            수정
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GoodsList;
