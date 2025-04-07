"use client"

import { useEffect, useMemo, useState } from "react"
import { useSortBy, useTable } from "react-table"
import { fetchGoodsByCategory, fetchGoodsBySubCategory } from "../../goods/api/HttpGoodsService"
import { fetchInventoryById, fetchInventoryList, updateStockByBatchId } from "../api/HttpInventoryService"
import { FormatDate } from "../../disposal/components/FormatDate"
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
  Trash2,
  X,
} from "lucide-react"

function InventoriesList() {
  const [inventoryList, setInventoryList] = useState([])
  const [editingRow, setEditingRow] = useState(null)
  const [newStock, setNewStock] = useState({})

  const [filterValue, setFilterValue] = useState("")
  const [category, setCategory] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [filteredInventory, setFilteredInventory] = useState([])
  const [groupedData, setGroupedData] = useState([])

  const [isVisible, setIsVisible] = useState(false)
  const [updatingStock, setUpdatingStock] = useState(false)

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = new Date() // 오늘
  // 오늘 오후 11시 59분 59초로 설정
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  // 전체 재고현황 불러오는 메서드 (리스트 변경될 때마다 가져오기)
  useEffect(() => {
    async function getInventoryList() {
      try {
        setLoading(true)
        const data = await fetchInventoryList()
        console.log("재고:", data)
        const nonExpiredList = data.filter((item) => 
          new Date(item.expirationDate) >= today || item.expirationDate === null
      )
        setInventoryList(nonExpiredList)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    getInventoryList()
  }, [])

  // 상품별로 재고 그룹화
  useEffect(() => {
    const groupedInventory = {}

    inventoryList.forEach((item) => {
      const { goodsId, goodsName, stockQuantity, expirationDate, category, subCategory, stockStatus } = item
      const expDate = new Date(expirationDate)

      if (!groupedInventory[goodsId]) {
        groupedInventory[goodsId] = {
          goodsId,
          goodsName,
          category,
          subCategory,
          totalStock: 0,
          expiringSoon: 0,
          batches: [],
        }
      }

      // 재고수 누적
      groupedInventory[goodsId].totalStock += stockQuantity

      // 폐기 예정 수량 (오늘 자정까지 유통기한인 상품)
      if (expirationDate  && expDate <= endOfDay) {
        groupedInventory[goodsId].expiringSoon += stockQuantity
      }

      // 배치 정보 저장
      groupedInventory[goodsId].batches.push(item)
    })

    // 객체를 배열로 변환
    const groupedArray = Object.values(groupedInventory).map((item) => {
      // 재고 부족 여부는 현재 총 재고량만 기준으로 판단
      const isLowStock = item.totalStock < 5

      return {
        ...item,
        stockStatus: isLowStock ? "재고부족" : "정상",
      }
    })

    setGroupedData(groupedArray)
  }, [inventoryList])

  // 테이블 헤더 (상품별 그룹화)
  const columns = useMemo(
    () => [
      {
        Header: "상품코드",
        accessor: "goodsId",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        Header: "상품명",
        accessor: "goodsName",
        Cell: ({ value, row }) => (
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">
              {row.original.category} {row.original.subCategory}
            </div>
          </div>
        ),
      },
      {
        Header: "재고 현황",
        accessor: "totalStock",
        Cell: ({ value, row }) => {
          const { expiringSoon } = row.original
          const percentage = expiringSoon > 0 ? Math.round((expiringSoon / value) * 100) : 0

          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{value}개</span>
                {expiringSoon > 0 && (
                  <span className="text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center">
                    <Trash2 className="w-3 h-3 mr-1" />
                    {expiringSoon}/{value}
                  </span>
                )}
              </div>

              {/* 재고 시각화 바 - 현재 재고량만 기준으로 표시 */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${value < 5 ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, value * 10)}%` }}
                ></div>
              </div>

              {/* 폐기 예정 시각화 */}
              {expiringSoon > 0 && <div className="text-xs text-gray-500 mt-1">폐기 예정: {percentage}%</div>}
            </div>
          )
        },
      },
      {
        Header: "재고 상태",
        accessor: "stockStatus",
        Cell: ({ value, row }) => {
          const { totalStock } = row.original

          if (value === "재고부족") {
            return (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                재고부족
              </span>
            )
          }
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              정상
            </span>
          )
        },
      },
    ],
    [],
  )

  // 배치별 상세 테이블 헤더
  const batchColumns = useMemo(
    () => [
      {
        Header: "입고코드",
        accessor: "batchId",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        Header: "유통기한",
        accessor: "expirationDate",
        Cell: ({ value }) => {
          const expDate = new Date(value)
          const isExpiringSoon = expDate <= endOfDay

          return (
            <span className={isExpiringSoon ? "text-amber-600 font-medium" : ""}>
              {FormatDate(value)}
              {isExpiringSoon && (
                <span className="ml-2 text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">폐기 예정</span>
              )}
            </span>
          )
        },
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
            )
          }
          return <span className="font-medium">{value}개</span>
        },
      },
      {
        Header: "관리",
        id: "actions",
        Cell: ({ row }) => {
          return editingRow === row.original.batchId ? (
            <button
              onClick={() => handleUpdateStock(row.original.batchId)}
              disabled={updatingStock}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-white ${
                updatingStock ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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
              onClick={() => handleEditStock(row.original.batchId, row.original.stockQuantity)}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              수정
            </button>
          )
        },
      },
    ],
    [editingRow, newStock, updatingStock],
  )

  // 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    // 검색어나 카테고리 필터가 적용된 경우 filteredInventory 사용
    if (searchQuery || category || subCategory) {
      return filteredInventory
    }

    // 재고 상태 필터 적용
    if (filterValue) {
      return groupedData.filter((item) => item.stockStatus === filterValue)
    }

    // 필터 없는 경우 전체 데이터
    return groupedData
  }, [filteredInventory, groupedData, searchQuery, category, subCategory, filterValue])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: filteredData,
    },
    useSortBy,
  )

  // 테이블 합계 컬럼
  const totalStock = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.totalStock || 0), 0)
  }, [filteredData])

  // 수정 버튼 클릭시  => 수정모드로 이동
  function handleEditStock(batchId, currentStock) {
    setEditingRow(batchId) // 수정할 상품 번호 지정
    setNewStock((prev) => ({ ...prev, [batchId]: currentStock }))
  }

  // 완료 버튼 클릭시  => 업데이트
  async function handleUpdateStock(batchId) {
    const updatedStock = newStock[batchId]

    if (updatedStock === "" || isNaN(updatedStock) || Number.parseInt(updatedStock) < 0) {
      alert("유효한 재고 수량을 입력해주세요.")
      return
    }

    setUpdatingStock(true)
    try {
      const response = await updateStockByBatchId(batchId, updatedStock)

      const data = await fetchInventoryById(batchId)

      setInventoryList((list) =>
        list.map((item) =>
          item.batchId === batchId
            ? {
                ...item,
                stockQuantity: data.stockQuantity,
                stockStatus: data.stockStatus,
                stockUpdateAt: data.stockUpdateAt,
              }
            : item,
        ),
      )

      setEditingRow(null)
    } catch (error) {
      setError(error.message)
      alert(`재고 업데이트 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setUpdatingStock(false)
    }
  }

  // 재고 부족 상품 필터링 (현재 재고량만 기준으로)
  const lowStockItems = useMemo(() => {
    return groupedData.filter((item) => item.totalStock < 5)
  }, [groupedData])

  // 검색 필터링
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = groupedData.filter((item) => item.goodsName?.toLowerCase().includes(searchQuery.toLowerCase()))

      let finalFiltered = filtered

      if (category) {
        const categoryFiltered = finalFiltered.filter((item) => item.category === category)
        finalFiltered = categoryFiltered
      }

      if (subCategory) {
        const subCategoryFiltered = finalFiltered.filter((item) => item.subCategory === subCategory)
        finalFiltered = subCategoryFiltered
      }

      setFilteredInventory(filtered)
    } else {
      // 카테고리 필터링 적용
      applyFilters()
    }
  }, [searchQuery, groupedData])

  // 카테고리 필터링
  const applyFilters = async () => {
    if (category && subCategory) {
      try {
        const goodsList = await fetchGoodsBySubCategory(category, subCategory)
        const goodsIds = goodsList.map((item) => item.goods_id)
        const filteredList = groupedData.filter((item) => goodsIds.includes(item.goodsId) && item.totalStock > 0)
        setFilteredInventory(filteredList)
      } catch (error) {
        setError(error.message)
      }
    } else if (category) {
      try {
        const goodsList = await fetchGoodsByCategory(category)
        const goodsIds = goodsList.map((item) => item.goods_id)
        const filteredList = groupedData.filter((item) => goodsIds.includes(item.goodsId))
        setFilteredInventory(filteredList)
      } catch (error) {
        setError(error.message)
      }
    } else {
      setFilteredInventory(groupedData.filter((item) => item.totalStock > 0))
    }
  }

  // 카테고리 변경 시 필터 적용
  useEffect(() => {
    if (groupedData.length > 0) {
      applyFilters()
    }
  }, [category, subCategory, groupedData])

  // 재고 새로고침
  const refreshInventory = async () => {
    setLoading(true)
    try {
      const data = await fetchInventoryList()
      setInventoryList(data)
      applyFilters()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // 배치 상세 정보 토글
  const [expandedRows, setExpandedRows] = useState({})

  const toggleRowExpanded = (goodsId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [goodsId]: !prev[goodsId],
    }))
  }

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
                <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                <span className="sr-only">새로고침</span>
              </button>

              <button
                onClick={() => setIsVisible(!isVisible)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                재고부족 현황
                {lowStockItems.length > 0 && (
                  <span className="ml-2 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {lowStockItems.length}
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
                  setCategory(e.target.value)
                  setSubCategory("")
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!category}
              >
                <option value="">중분류</option>
                {category === "식품" ? (
                  <>
                    <option value="즉석식품">즉석식품</option>
                    <option value="라면 & 면류">라면 & 면류</option>
                    <option value="베이커리 & 샌드위치">베이커리 & 샌드위치</option>
                    <option value="냉장 & 냉동식품">냉장 & 냉동식품</option>
                    <option value="과자 & 스낵">과자 & 스낵</option>
                    <option value="아이스크림 & 디저트">아이스크림 & 디저트</option>
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
                    <option value="전자기기 & 액세서리">전자기기 & 액세서리</option>
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
                    filterValue === "" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterValue("정상")}
                  className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterValue === "정상" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  정상
                </button>
                <button
                  onClick={() => setFilterValue("재고부족")}
                  className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterValue === "재고부족" ? "bg-white text-red-700 shadow-sm" : "text-gray-600 hover:bg-gray-200"
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

            {lowStockItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <div key={item.goodsId} className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="font-medium text-gray-800">{item.goodsName}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">현재 재고:</span>
                      <span className="font-bold text-red-600">{item.totalStock}개</span>
                    </div>
                    {item.expiringSoon > 0 && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-amber-600">폐기 예정:</span>
                        <span className="font-bold text-amber-600">{item.expiringSoon}개</span>
                      </div>
                    )}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, item.totalStock * 10)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">모든 상품이 정상 재고입니다.</div>
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
          ) : rows.length === 0 ? (
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
                        {/* 확장 버튼 열 추가 */}
                        <th className="w-10 px-4 py-3"></th>

                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
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
                      </tr>
                    ))}
                  </thead>

                  <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                      prepareRow(row)
                      const isExpanded = expandedRows[row.original.goodsId]

                      return (
                        <>
                          <tr
                            {...row.getRowProps()}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            key={row.id}
                          >
                            {/* 확장 버튼 */}
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleRowExpanded(row.original.goodsId)}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <ChevronDown
                                  className={`h-5 w-5 text-gray-500 transition-transform ${
                                    isExpanded ? "transform rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </td>

                            {row.cells.map((cell) => (
                              <td
                                {...cell.getCellProps()}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                key={cell.column.id}
                              >
                                {cell.render("Cell")}
                              </td>
                            ))}
                          </tr>

                          {/* 확장된 배치 상세 정보 */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={columns.length + 1} className="p-0 border-b border-gray-100">
                                <div className="bg-gray-50 p-4">
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    배치별 상세 정보 ({row.original.batches.length}개)
                                  </h4>

                                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          {batchColumns.map((column) => (
                                            <th
                                              key={column.Header}
                                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                              {column.Header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {row.original.batches.map((batch) => (
                                          <tr key={batch.batchId} className="hover:bg-gray-50">
                                            {batchColumns.map((column) => (
                                              <td key={column.Header} className="px-4 py-2 text-sm text-gray-700">
                                                {column.Cell
                                                  ? column.Cell({
                                                      value: batch[column.accessor],
                                                      row: { original: batch },
                                                    })
                                                  : batch[column.accessor]}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 합계 영역 */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">총 {rows.length}개 상품</div>
                  <div className="font-medium text-gray-800">
                    총 재고량: <span className="font-bold text-indigo-600">{totalStock}개</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoriesList

