"use client"

import { useEffect, useState } from "react"
import { fetchConfirmArrival, fetchLatest, fetchOrders, fetchWeekSales, requestOrder } from "../api/HttpOrderingService"
import { fetchInventoryList } from "../../inventory/api/HttpInventoryService"
import { fetchGoodsByCategory, fetchGoodsBySubCategory, fetchGoodsList } from "../../goods/api/HttpGoodsService"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Filter,
  History,
  Info,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

function OrderingPage() {
  const [inventoryList, setInventoryList] = useState([])
  const [goodsList, setGoodsList] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])

  const [selectedItems, setSelectedItems] = useState({}) // 객체 Object
  const [latestOrderQuantities, setLatestOrderQuantities] = useState({}) // 최근 발주 수량 저장

  const [category, setCategory] = useState("")
  const [subCategory, setSubCategory] = useState("")

  const [sortOption, setSortOption] = useState("")
  const [statusFilter, setStatusFilter] = useState("") // 상품 상태 필터 (정상.재고부족)
  const [searchQuery, setSearchQuery] = useState("") // (상품 검색창)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingOrder, setProcessingOrder] = useState(false)

  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("")
  const [orderSortOption, setOrderSortOption] = useState("")

  const [activeTab, setActiveTab] = useState("manage")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const [inventoryItem, setInventoryItem] = useState(0)
  const [average, setAverage] = useState(0)

  const [orderDateFilter, setOrderDateFilter] = useState("")

  useEffect(() => {
    async function getInventoryList() {
      try {
        setLoading(true)
        const data = await fetchInventoryList()
        setInventoryList(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    getInventoryList()
  }, [])

  // 리스트 가져오기
  useEffect(() => {
    async function getOrdersList() {
      try {
        setLoading(true)
        const data = await fetchOrders()
        setOrders(data)
        setFilteredOrders(data)
        console.log("발주 리스트", data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    getOrdersList()
  }, [])

  // 발주 버튼을 누른경우
  async function handleConfirmAddStock() {
    setShowConfirmModal(false)

    // Object.entries : key - value 쌍으로
    const orders = Object.entries(selectedItems)
      .filter(([goodsId, data]) => data.quantity && Number.parseInt(data.quantity) > 0)
      .map(([goodsId, data]) => ({
        goodsId: Number.parseInt(goodsId),
        quantity: Number.parseInt(data.quantity),
      }))

    if (orders.length === 0) {
      alert("수량이 입력된 상품이 없습니다.")
      return
    }

    setProcessingOrder(true)
    try {
      for (const order of orders) {
        await requestOrder(order.goodsId, order.quantity)
      }

      alert("모든 발주가 등록되었습니다.")
      setSelectedItems({}) // 초기화

      // 발주 리스트 새로고침
      const updatedOrders = await fetchOrders()
      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders)
    } catch (error) {
      alert(`발주 처리 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setProcessingOrder(false)
    }
  }

  // 상품 리스트 가져오기
  useEffect(() => {
    async function getGoodsList() {
      try {
        const data = await fetchGoodsList()
        setGoodsList(data)
      } catch (error) {
        setError(error.message)
      }
    }
    getGoodsList()
  }, [])

  // 발주할 상품 선택
  async function handleSelectItem(goodsId) {
    setSelectedItems((prev) => {
      const updated = { ...prev }
      if (updated[goodsId]) {
        delete updated[goodsId]
      } else {
        updated[goodsId] = { quantity: "" }
      }
      return updated
    })

    try {
      const latest = await fetchLatest(goodsId)
      const latestQuantity = latest?.orderQuantity || ""
      console.log(latestQuantity)

      // 최근 발주 수량 저장
      setLatestOrderQuantities((prev) => ({
        ...prev,
        [goodsId]: latestQuantity,
      }))

      const data = await fetchWeekSales(goodsId)
      // 추천 발수량 계산
      const total = data.reduce((sum, item) => sum + item.amount, 0)
      setAverage(total / 7)

      const inventoryItem = inventoryList.find((i) => i.goodsId === goodsId) // 선택한 상품의 재고 정보

      setInventoryItem(inventoryItem)
    } catch (e) {
      console.error("⚠️ 발주 수량 불러오기 실패", e.message)
    }
  }

  const stock = inventoryItem?.stockQuantity || 0

  const daysLeft = average > 0 ? Math.floor(stock / average) : "N/A"

  // 다음 입고까지 7일이라고 가정할떄, 7일치 평균개수 - 남은 재고 수  만큼 발주해라고 추천
  const recommendedOrder = Math.ceil(Math.max(0, average * 1 - stock))

  // 이전 발주 수량 적용 함수
  function applyLatestQuantity(goodsId) {
    const latestQuantity = latestOrderQuantities[goodsId]
    if (latestQuantity) {
      handleQuantityChange(goodsId, latestQuantity)
    }
  }

  function handleQuantityChange(goodsId, quantity) {
    setSelectedItems((prev) => ({
      ...prev,
      [goodsId]: {
        ...prev[goodsId],
        quantity,
      },
    }))
  }

  function handleSelectAll(e) {
    const isChecked = e.target.checked
    const newSelections = {}

    if (isChecked) {
      filteredInventory.forEach((item) => {
        newSelections[item.goods_id] = { quantity: "" }
      })
    }

    setSelectedItems(isChecked ? newSelections : {})
  }

  function handleCategoryChange(e) {
    setCategory(e.target.value)
    setSubCategory("") // 대분류 바뀌면 소분류 초기화
  }

  async function getFilteredInventory(inventoryList, category, subCategory, statusFilter, searchQuery, sortOption) {
    let goodsList = []

    // 1. 카테고리에 따라 서버에서 goods 불러오기
    if (category && subCategory) {
      goodsList = await fetchGoodsBySubCategory(category, subCategory)
    } else if (category) {
      goodsList = await fetchGoodsByCategory(category)
    } else {
      goodsList = await fetchGoodsList()
    }

    // 2. 재고 병합 및 상태 재계산
    const mergedMap = new Map()

    inventoryList.forEach((item) => {
      const existing = mergedMap.get(item.goodsId)
      if (existing) {
        const newStock = existing.stockQuantity + item.stockQuantity
        mergedMap.set(item.goodsId, {
          ...existing,
          stockQuantity: newStock,
          stockStatus: newStock >= 5 ? "정상" : "재고부족",
        })
      } else {
        mergedMap.set(item.goodsId, {
          ...item,
          stockStatus: item.stockQuantity >= 5 ? "정상" : "재고부족",
        })
      }
    })

    let mergedList = Array.from(mergedMap.values())

    // 3. inventory + goods 병합
    mergedList = mergedList
      .filter((item) => goodsList.some((g) => g.goods_id === item.goodsId))
      .map((item) => {
        const matched = goodsList.find((g) => g.goods_id === item.goodsId)
        return {
          ...item,
          ...matched,
        }
      })

    // 4. 상태 필터링
    if (statusFilter) {
      mergedList = mergedList.filter((item) => item.stockStatus === statusFilter)
    }

    // 5. 검색 필터링
    if (searchQuery.trim() !== "") {
      mergedList = mergedList.filter((item) => item.goods_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // 6. 정렬
    if (sortOption === "price_asc") {
      mergedList.sort((a, b) => a.goods_price - b.goods_price)
    } else if (sortOption === "price_desc") {
      mergedList.sort((a, b) => b.goods_price - a.goods_price)
    } else if (sortOption === "stock_asc") {
      mergedList.sort((a, b) => a.stockQuantity - b.stockQuantity)
    } else if (sortOption === "stock_desc") {
      mergedList.sort((a, b) => b.stockQuantity - a.stockQuantity)
    }

    return mergedList
  }

  useEffect(() => {
    if (!inventoryList.length) return

    async function fetchAndFilter() {
      try {
        const result = await getFilteredInventory(
          inventoryList,
          category,
          subCategory,
          statusFilter,
          searchQuery,
          sortOption,
        )
        setFilteredInventory(result)
      } catch (error) {
        setError(error.message)
      }
    }

    fetchAndFilter()
  }, [inventoryList, category, subCategory, statusFilter, searchQuery, sortOption])

  // 발주 리스트 필터링
  useEffect(() => {
    let filtered = [...orders]

    // 7. 날짜 필터링
    if (orderDateFilter) {
      filtered = filtered.filter((order) => order.scheduledTime.startsWith(orderDateFilter))
    }

    // 검색어 필터링
    if (orderSearchQuery.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.goodsName?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
          order.orderId?.toString().includes(orderSearchQuery),
      )
    }

    // 상태 필터링
    if (orderStatusFilter) {
      filtered = filtered.filter((order) => order.status === orderStatusFilter)
    }

    // 정렬
    if (orderSortOption === "date_desc") {
      filtered.sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime))
    } else if (orderSortOption === "date_asc") {
      filtered.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    } else if (orderSortOption === "quantity_desc") {
      filtered.sort((a, b) => b.orderQuantity - a.orderQuantity)
    } else if (orderSortOption === "quantity_asc") {
      filtered.sort((a, b) => a.orderQuantity - b.orderQuantity)
    }

    setFilteredOrders(filtered)
  }, [orders, orderSearchQuery, orderStatusFilter, orderSortOption, orderDateFilter])

  // 선택된 상품 총 개수
  const selectedCount = Object.keys(selectedItems).length

  // 선택된 상품 총 수량
  const totalQuantity = Object.values(selectedItems).reduce((sum, item) => {
    return sum + (Number.parseInt(item.quantity) || 0)
  }, 0)

  // 발주 상태에 따른 배지 색상 및 아이콘
  const getStatusBadge = (status) => {
    switch (status) {
      case "입고완료":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            입고완료
          </span>
        )
      case "발주 진행중":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            발주 진행중
          </span>
        )
      case "발주 완료":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            발주 완료
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // 엑셀로 내보내기
  const exportOrdersToExcel = () => {
    setShowExcelModal(false)

    const data = filteredOrders.map((order) => ({
      주문번호: order.orderId,
      상품명: order.goodsName,
      수량: order.orderQuantity,
      주문시간: formatDate(order.scheduledTime),
      상태: order.status,
    }))

    // data 배열은 엑셀에서 사용할 수 있는 시트 형식으로 변환
    // xlsx 라이브러리의 기능으로, json을 바로 시트로 만들 수 있음
    const worksheet = XLSX.utils.json_to_sheet(data)

    // 엑셀 파일(워크북) 생성, 여러개의 시트를 포함 가능
    const workbook = XLSX.utils.book_new()

    // 위에서 만든 시트를 워크북에 추가 / 이름은 발주리스트
    XLSX.utils.book_append_sheet(workbook, worksheet, "발주 리스트")

    // 워크북을 .xlsx 형식의 버퍼로 변환
    // JavaScript ArrayBuffer 로 결과를 받겠다는 의미
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    // ArrayBuffer를 Blob(파일 객체)로 감쌈
    // 파일로 다운로드하려면 Blob 형태로 만들어야 함
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" })

    // file-saver 라이브러리의 saveAs 를 이용해서 파일 다운로드 실행
    // 파일이름은 "발주_리스트_2025-04-02.xlsx" 느낌
    saveAs(blob, `발주_리스트_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // 검수하기 버튼
  const confirmArrival = async (orderId) => {
    setShowInspectionModal(false)
    try {
      await fetchConfirmArrival(orderId)
      const updated = await fetchOrders()
      setOrders(updated)
      setFilteredOrders(updated)
    } catch (error) {
      console.error("입고 확인 실패", error)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6 text-2xl font-bold text-gray-800">
            <button
              className={`flex items-center ${
                activeTab === "manage"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-400 hover:text-indigo-600"
              } pb-1`}
              onClick={() => setActiveTab("manage")}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              발주 관리
            </button>
            <button
              className={`flex items-center ${
                activeTab === "list"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-400 hover:text-indigo-600"
              } pb-1`}
              onClick={() => setActiveTab("list")}
            >
              <Package className="h-5 w-5 mr-2" />
              발주 리스트
            </button>
          </div>

          {activeTab === "list" && (
            <button
              onClick={() => setShowExcelModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              엑셀로 내보내기
            </button>
          )}
        </div>

        {activeTab === "manage" && (
          <>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                    disabled={!category}
                  >
                    <option value="">모든 하위 카테고리</option>
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

                {/* 정렬 옵션 */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
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
                      statusFilter === "" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setStatusFilter("정상")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === "정상" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:bg-gray-200"
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
                                filteredInventory.every((item) => selectedItems[item.goods_id])
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.goods_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap w-24">
                              <img
                                src={`${item.goods_image || "/placeholder.svg"}` || "/placeholder.svg"}
                                alt={item.goods_name}
                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.goods_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-indigo-600">
                                {Number(item.goods_price).toLocaleString()}원
                              </div>
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
                              <div className="flex flex-col space-y-2 w-full">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={selectedItems[item.goods_id]?.quantity || ""}
                                    onChange={(e) => handleQuantityChange(item.goods_id, e.target.value)}
                                    disabled={!selectedItems[item.goods_id]}
                                    min="1"
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center disabled:bg-gray-100 disabled:text-gray-400"
                                    placeholder="수량"
                                  />

                                  {selectedItems[item.goods_id] && latestOrderQuantities[item.goods_id] && (
                                    <button
                                      onClick={() => applyLatestQuantity(item.goods_id)}
                                      className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                      title="이전 발주 수량 적용"
                                    >
                                      <History className="w-3 h-3 mr-1" />
                                      {latestOrderQuantities[item.goods_id]}개
                                    </button>
                                  )}
                                </div>

                                {selectedItems[item.goods_id] && item.goods_id === inventoryItem?.goodsId && (
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => handleQuantityChange(item.goods_id, recommendedOrder.toString())}
                                      className="flex items-center text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-100 transition-colors"
                                    >
                                      <span className="font-bold mr-1">{recommendedOrder}개</span>
                                      추천
                                    </button>
                                    <div className="ml-2 text-xs text-gray-500 flex items-center">
                                      <span className="inline-flex items-center mr-2">
                                        <span className="font-medium text-indigo-600 mr-1">{average.toFixed(1)}개</span>
                                        일평균
                                      </span>
                                      <span className="inline-flex items-center">
                                        <span className="font-medium text-indigo-600 mr-1">{daysLeft}</span>
                                        일치
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
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
                        if (!data) return null

                        const product = goodsList.find((g) => g.goods_id === Number.parseInt(goodsId))

                        if (!product) return null

                        return (
                          <li
                            key={goodsId}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <img
                                src={`${product.goods_image || "/placeholder.svg"}` || "/placeholder.svg"}
                                alt={product.goods_name}
                                className="w-10 h-10 object-cover rounded-md mr-3"
                              />
                              <div>
                                <div className="font-medium text-gray-800 text-sm">{product.goods_name}</div>
                                <div className="flex items-center text-xs">
                                  {data.quantity ? (
                                    <span className="text-indigo-600 font-medium">{data.quantity}개</span>
                                  ) : (
                                    <span className="text-gray-500">수량 미지정</span>
                                  )}

                                  {latestOrderQuantities[goodsId] && !data.quantity && (
                                    <button
                                      onClick={() => applyLatestQuantity(goodsId)}
                                      className="ml-2 flex items-center text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1" />
                                      이전 {latestOrderQuantities[goodsId]}개
                                    </button>
                                  )}
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
                        )
                      })}
                    </ul>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">총 발주 수량:</span>
                    <span className="font-bold text-indigo-700">{totalQuantity}개</span>
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
                      onClick={() => {
                        if (
                          Object.keys(selectedItems).length > 0 &&
                          Object.values(selectedItems).some((item) => item.quantity)
                        ) {
                          setShowConfirmModal(true)
                        } else {
                          alert("수량이 입력된 상품이 없습니다.")
                        }
                      }}
                      disabled={
                        Object.keys(selectedItems).length === 0 ||
                        !Object.values(selectedItems).some((item) => item.quantity) ||
                        processingOrder
                      }
                      className={`w-full px-4 py-2 rounded-lg text-white flex items-center justify-center ${
                        Object.keys(selectedItems).length === 0 ||
                        !Object.values(selectedItems).some((item) => item.quantity) ||
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
          </>
        )}

        {activeTab === "list" && (
          <>
            {/* 발주 리스트 검색 및 필터 영역 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* 검색창 */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="상품명 또는 주문번호로 검색"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* 상태 필터 */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                >
                  <option value="">모든 상태</option>
                  <option value="발주 진행중">발주 진행중</option>
                  <option value="발주 완료">발주 완료</option>
                  <option value="입고완료">입고완료</option>
                </select>

                {/* 정렬 옵션 */}
                <select
                  value={orderSortOption}
                  onChange={(e) => setOrderSortOption(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                >
                  <option value="">기본 정렬</option>
                  <option value="date_desc">최신순</option>
                  <option value="date_asc">오래된순</option>
                  <option value="quantity_desc">수량 많은순</option>
                  <option value="quantity_asc">수량 적은순</option>
                </select>

                {/* 날짜 필터 */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {orderDateFilter && (
                    <button
                      onClick={() => setOrderDateFilter("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 발주 리스트 테이블 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <Info className="h-12 w-12 mb-2 text-gray-400" />
                  <p>표시할 발주 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          주문번호
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상품명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          수량
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            주문시간
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          검수
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.orderId}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={`${order.goodsImage || "/placeholder.svg"}` || "/placeholder.svg"}
                                  alt={order.goodsName}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{order.goodsName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-semibold text-indigo-600">{order.orderQuantity}개</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.scheduledTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.status === "발주 완료" && (
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.orderId)
                                  setShowInspectionModal(true)
                                }}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                검수 확인
                              </button>
                            )}
                            {order.status === "입고완료" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                검수완료
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 발주 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-indigo-50 p-6 border-b border-indigo-100">
              <div className="flex items-center">
                <ShoppingCart className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">발주 확인</h3>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">선택한 상품</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-2 py-1">
                    {selectedCount}개 상품
                  </span>
                </div>

                {/* 상품 목록 */}
                <div className="max-h-60 overflow-y-auto mb-4 pr-1">
                  <ul className="space-y-2">
                    {Object.entries(selectedItems).map(([goodsId, data]) => {
                      if (!data || !data.quantity) return null

                      const product = goodsList.find((g) => g.goods_id === Number.parseInt(goodsId))

                      if (!product) return null

                      return (
                        <li
                          key={goodsId}
                          className="flex items-center p-2 border border-gray-100 rounded-lg bg-gray-50"
                        >
                          <img
                            src={`${product.goods_image || "/placeholder.svg"}` || "/placeholder.svg"}
                            alt={product.goods_name}
                            className="w-10 h-10 object-cover rounded-md mr-3 border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{product.goods_name}</p>
                            <p className="text-xs text-gray-500">{Number(product.goods_price).toLocaleString()}원</p>
                          </div>
                          <div className="ml-2 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {data.quantity}개
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* 요약 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">총 상품 종류:</span>
                    <span className="font-medium text-gray-800">{selectedCount}개</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">총 발주 수량:</span>
                    <span className="font-bold text-indigo-700">{totalQuantity}개</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">위 상품들을 발주하시겠습니까?</p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAddStock}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                발주하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 엑셀 내보내기 확인 모달 */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-green-50 p-6 border-b border-green-100">
              <div className="flex items-center">
                <Download className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">엑셀 내보내기</h3>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">발주 리스트 다운로드</h4>
                    <p className="text-sm text-gray-600">
                      현재 필터링된 {filteredOrders.length}개의 발주 내역을 엑셀 파일로 내보냅니다.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">파일 형식:</span>
                    <span className="font-medium text-gray-800">Excel (.xlsx)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">발주 내역 수:</span>
                    <span className="font-bold text-green-700">{filteredOrders.length}개</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">발주 리스트를 엑셀 파일로 내보내시겠습니까?</p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={exportOrdersToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검수 확인 모달 */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">검수 확인</h3>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">발주 검수 완료</h4>
                    <p className="text-sm text-gray-600">
                      주문번호 #{selectedOrderId}의 발주 상품이 정상적으로 입고되었는지 확인하셨나요?
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      검수 확인 후에는 상태가 '입고완료'로 변경되며, 이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">검수 완료 처리를 진행하시겠습니까?</p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={() => confirmArrival(selectedOrderId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                검수 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderingPage

