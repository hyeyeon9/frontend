import { useEffect, useMemo, useState } from "react";
import { useFilters, useSortBy, useTable } from "react-table";
import {
  fetchGoodsByCategory,
  fetchGoodsBySubCategory,
} from "../../goods/api/HttpGoodsService";
import {
  fetchInventoryById,
  fetchInventoryList,
  updateStockByBatchId,
} from "../api/HttpInventoryService";
import { FormatDate } from "../../disposal/components/FormatDate";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Edit2,
  Filter,
  Info,
  Package,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";

function InventoriesList() {
  const [inventoryList, setInventoryList] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newStock, setNewStock] = useState({});

  const [filterValue, setFilterValue] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [filteredInventory, setFilteredInventory] = useState([]);

  const [isVisible, setIsVisible] = useState(false);
  const [updatingStock, setUpdatingStock] = useState(false);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 전체 재고현황 불러오는 메서드 (리스트 변경될 때마다 가져오기)
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

  // 테이블 헤더
  const columns = useMemo(
    () => [
      {
        Header: "입고코드",
        accessor: "batchId",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        Header: "상품코드",
        accessor: "goodsId",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>,
      },
      { Header: "상품명", accessor: "goodsName" },
      {
        Header: "유통기한",
        accessor: "expirationDate",
        Cell: ({ value }) => <span>{FormatDate(value)}</span>,
      },
      {
        Header: "재고 수량",
        accessor: "stockQuantity",
        Cell: ({ row, value }) => {
          if (editingRow === row.original.batchId) {
            return (
              <input
                type="number"
                value={newStock[row.original.batchId]}
                min="0"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                onChange={(e) =>
                  setNewStock((prev) => ({
                    ...prev,
                    [row.original.batchId]: e.target.value,
                  }))
                }
              />
            );
          }
          return <span className="font-medium">{value}개</span>;
        },
      },
      {
        Header: "재고 상태",
        accessor: "stockStatus",
        Cell: ({ value }) => {
          if (value === "재고부족") {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                재고부족
              </span>
            );
          }
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              정상
            </span>
          );
        },
      },
    ],
    [editingRow, newStock]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
  } = useTable({ columns, data: filteredInventory }, useFilters, useSortBy);

  useEffect(() => {
    setFilter("stockStatus", filterValue);
  }, [filterValue, setFilter]);

  // 테이블 합계 컬럼
  const totalStock = useMemo(() => {
    return filteredInventory.reduce(
      (sum, item) => sum + (item.stockQuantity || 0),
      0
    );
  }, [filteredInventory]);

  // 수정 버튼 클릭시  => 수정모드로 이동
  function handleEditStock(batchId, currentStock) {
    setEditingRow(batchId); // 수정할 상품 번호 지정
    setNewStock((prev) => ({ ...prev, [batchId]: currentStock }));
  }

  // 완료 버튼 클릭시  => 업데이트
  async function handleUpdateStock(batchId) {
    const updatedStock = newStock[batchId];

    if (
      updatedStock === "" ||
      isNaN(updatedStock) ||
      Number.parseInt(updatedStock) < 0
    ) {
      alert("유효한 재고 수량을 입력해주세요.");
      return;
    }

    setUpdatingStock(true);
    try {
      const response = await updateStockByBatchId(batchId, updatedStock);

      const data = await fetchInventoryById(batchId);

      setInventoryList((list) =>
        list.map((item) =>
          item.batchId === batchId
            ? {
                ...item,
                stockQuantity: data.stockQuantity,
                stockStatus: data.stockStatus,
                stockUpdateAt: data.stockUpdateAt,
              }
            : item
        )
      );

      setEditingRow(null);
    } catch (error) {
      setError(error.message);
      alert(`재고 업데이트 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setUpdatingStock(false);
    }
  }


  // 상품명 기준으로 재고 합치기
  const groupedStock = {};

  inventoryList.forEach((item) => {
    if (!groupedStock[item.goodsName]) {
      groupedStock[item.goodsName] = 0;
    }
    groupedStock[item.goodsName] += item.stockQuantity;
  });

  // 기준치 이하만 필터링
  const mergedLowStock = Object.entries(groupedStock)
    .filter(([_, total]) => total < 5)
    .map(([name, total]) => ({
      goodsName: name,
      totalStock: total,
    }));

  //console.log("재고 기준 이하",mergedLowStock);

  // 검색 필터링
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = inventoryList.filter((item) =>
        item.goodsName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      let finalFiltered = filtered;

      if (category) {
        const categoryFiltered = finalFiltered.filter(
          (item) => item.category === category
        );
        finalFiltered = categoryFiltered;
      }

      if (subCategory) {
        const subCategoryFiltered = finalFiltered.filter(
          (item) => item.subCategory === subCategory
        );
        finalFiltered = subCategoryFiltered;
      }

      setFilteredInventory(filtered);
      console.log("필터링", filtered);
    } else {
      // 카테고리 필터링 적용
      applyFilters();
    }
  }, [searchQuery]);

  // 카테고리 필터링
  const applyFilters = async () => {
    if (category && subCategory) {
      try {
        const goodsList = await fetchGoodsBySubCategory(category, subCategory);
        const goodsIds = goodsList.map((item) => item.goods_id);
        const filteredList = inventoryList.filter(
          (item) => goodsIds.includes(item.goodsId) && item.stockQuantity > 0
        );
        setFilteredInventory(filteredList);
      } catch (error) {
        setError(error.message);
      }
    } else if (category) {
      try {
        const goodsList = await fetchGoodsByCategory(category);
        const goodsIds = goodsList.map((item) => item.goods_id);
        const filteredList = inventoryList.filter((item) =>
          goodsIds.includes(item.goodsId)
        );
        setFilteredInventory(filteredList);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setFilteredInventory(
        inventoryList.filter((item) => item.stockQuantity > 0)
      );
    }
  };

  // 카테고리 변경 시 필터 적용
  useEffect(() => {
    applyFilters();
  }, [category, subCategory, inventoryList]);

  // 재고 새로고침
  const refreshInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchInventoryList();
      setInventoryList(data);
      applyFilters();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 및 필터 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="h-6 w-6 mr-2 text-indigo-600" />
              재고 관리
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshInventory}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex items-center"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
                <span className="sr-only">새로고침</span>
              </button>

              <button
                onClick={() => setIsVisible(!isVisible)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                재고부족 현황
                {mergedLowStock.length > 0 && (
                  <span className="ml-2 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {mergedLowStock.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory("");
                }}
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

            {/* 재고 상태 필터 */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex bg-gray-100 rounded-lg p-1 w-full">
                <button
                  onClick={() => setFilterValue("")}
                  className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterValue === ""
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterValue("정상")}
                  className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterValue === "정상"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  정상
                </button>
                <button
                  onClick={() => setFilterValue("재고부족")}
                  className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterValue === "재고부족"
                      ? "bg-white text-red-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  재고부족
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 재고 부족 팝업 */}
        {isVisible && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                재고 부족 상품 현황
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mergedLowStock.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mergedLowStock.map((item) => (
                  <div
                    key={item.goodsName}
                    className="p-4 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="font-medium text-gray-800">
                      {item.goodsName}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">현재 재고:</span>
                      <span className="font-bold text-red-600">
                        {item.totalStock}개
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, item.totalStock * 20)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                모든 상품이 정상 재고입니다.
              </div>
            )}
          </div>
        )}

        {/* 테이블 영역 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
              <p>표시할 재고 데이터가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table {...getTableProps()} className="w-full border-collapse">
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr
                        {...headerGroup.getHeaderGroupProps()}
                        className="bg-gray-50 border-b border-gray-200"
                        key={headerGroup.id}
                      >
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            key={column.id}
                          >
                            <div className="flex items-center">
                              {column.render("Header")}
                              <span className="ml-1">
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 transform rotate-180" />
                                  )
                                ) : (
                                  ""
                                )}
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    ))}
                  </thead>

                  <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          key={row.id}
                        >
                          {row.cells.map((cell) => (
                            <td
                              {...cell.getCellProps()}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                              key={cell.id}
                            >
                              {cell.render("Cell")}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingRow === row.original.batchId ? (
                              <button
                                onClick={() =>
                                  handleUpdateStock(row.original.batchId)
                                }
                                disabled={updatingStock}
                                className={`inline-flex items-center px-3 py-1.5 rounded-md text-white ${
                                  updatingStock
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                } transition-colors`}
                              >
                                {updatingStock ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    저장 중...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-1" />
                                    저장
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleEditStock(
                                    row.original.batchId,
                                    row.original.stockQuantity
                                  )
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                수정
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 합계 영역 */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    총 {rows.length}개 항목
                  </div>
                  <div className="font-medium text-gray-800">
                    총 재고량:{" "}
                    <span className="font-bold text-indigo-600">
                      {totalStock}개
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoriesList;
