import { useEffect, useState, useRef } from "react";
import {
  fetchConfirmArrival,
  fetchLatest,
  fetchOrders,
  fetchWeekSales,
  requestOrder,
} from "../api/HttpOrderingService";
import { fetchInventoryList } from "../../inventory/api/HttpInventoryService";
import {
  fetchGoodsByCategory,
  fetchGoodsBySubCategory,
  fetchGoodsList,
} from "../../goods/api/HttpGoodsService";
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
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Bell,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function OrderingPage() {
  const [inventoryList, setInventoryList] = useState([]);
  const [goodsList, setGoodsList] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  const [selectedItems, setSelectedItems] = useState({}); // 객체 Object
  const [latestOrderQuantities, setLatestOrderQuantities] = useState({}); // 최근 발주 수량 저장

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // 상품 상태 필터 (정상.재고부족)
  const [searchQuery, setSearchQuery] = useState(""); // (상품 검색창)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderSortOption, setOrderSortOption] = useState("");

  const [activeTab, setActiveTab] = useState("manage");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  // Replace the existing selectedOrders state with an object-based approach
  const [selectedOrders, setSelectedOrders] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // 새로운 상태 추가: 각 상품별 재고 및 추천 정보 저장
  const [productRecommendations, setProductRecommendations] = useState({});

  const [average, setAverage] = useState(0);

  // State to track if we've loaded items from localStorage
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  // State to show notification about items from expiring page
  const [showExpiringNotification, setShowExpiringNotification] =
    useState(false);
  // Count of items loaded from expiring page
  const [expiringItemsCount, setExpiringItemsCount] = useState(0);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [orderDateFilter, setOrderDateFilter] = useState(getTodayString());

  // 상품별 추천 정보 가져오기 함수
  async function fetchProductRecommendation(goodsId) {
    try {
      // 재고 정보 가져오기
      const inventoryItem = inventoryList.find((i) => i.goodsId === goodsId);

      // 판매 데이터 가져오기
      const salesData = await fetchWeekSales(goodsId);

      // 평균 판매량 계산
      const total = salesData.reduce((sum, item) => sum + item.amount, 0);
      const avgSales = total / 7;

      // 재고 정보
      const stock = inventoryItem?.stockQuantity || 0;

      // 재고 소진 예상 일수
      const daysLeft = avgSales > 0 ? Math.floor(stock / avgSales) : "N/A";

      // 추천 발주량 (1일치 평균 판매량 - 현재 재고)
      const recommendedOrder = Math.ceil(Math.max(0, avgSales * 1 - stock));

      // 추천 정보 저장
      setProductRecommendations((prev) => ({
        ...prev,
        [goodsId]: {
          inventoryItem,
          avgSales,
          stock,
          daysLeft,
          recommendedOrder,
        },
      }));
    } catch (error) {
      console.error("상품 추천 정보 가져오기 실패", error);
    }
  }

  // 날짜 포맷팅 함수 추가 (요일 포함)
  const formatDateWithDay = (date) => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayIndex = date.getDay();
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}월 ${String(date.getDate()).padStart(2, "0")}일 (${dayNames[dayIndex]})`;
  };

  // 로컬스토리지에서 유통기한 임박 상품 가져오기
  useEffect(() => {
    if (
      !hasLoadedFromStorage &&
      goodsList.length > 0 &&
      inventoryList.length > 0
    ) {
      const storedItems = localStorage.getItem("selectedExpiringItems");

      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);

          if (parsedItems.length > 0) {
            const newSelectedItems = { ...selectedItems };

            // 각 상품에 대해 추천 정보 가져오기 위한 Promise 배열
            const recommendationPromises = [];

            parsedItems.forEach((item) => {
              // Find the corresponding item in goodsList
              const goodsId = item.goodsId.toString();
              newSelectedItems[goodsId] = { quantity: "1" }; // Default quantity to 1

              // 각 상품에 대한 추천 정보 가져오기 Promise 추가
              recommendationPromises.push(
                fetchProductRecommendation(item.goodsId)
              );
            });

            setSelectedItems(newSelectedItems);
            setExpiringItemsCount(parsedItems.length);
            setShowExpiringNotification(true);

            // 모든 추천 정보 가져오기 Promise 실행
            Promise.all(recommendationPromises).catch((error) =>
              console.error("유통기한 임박 상품 추천 정보 가져오기 실패", error)
            );

            // Clear localStorage after loading
            localStorage.removeItem("selectedExpiringItems");
          }
        } catch (error) {
          console.error("Error parsing stored items:", error);
        }
      }

      setHasLoadedFromStorage(true);
    }
  }, [goodsList, inventoryList, hasLoadedFromStorage, selectedItems]);

  // 재고 리스트 가져오기
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

  // 발주 리스트 가져오기
  useEffect(() => {
    async function getOrdersList() {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setFilteredOrders(data);
        console.log("발주 리스트", data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getOrdersList();
  }, []);

  // 날짜 이동 함수 추가
  const navigateDate = (direction) => {
    const newDate = new Date(
      orderDateFilter ? new Date(orderDateFilter) : new Date()
    );
    newDate.setDate(newDate.getDate() + direction);

    // YYYY-MM-DD 형식으로 변환
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    setOrderDateFilter(`${year}-${month}-${day}`);
  };

  // 커스텀 날짜 선택기 렌더링 함수 추가
  const [showDatePicker, setShowDatePicker] = useState(false);

  const renderCustomDatePicker = () => {
    if (!showDatePicker) return null;

    const today = new Date();
    const selectedDate = orderDateFilter
      ? new Date(orderDateFilter)
      : new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // 현재 월의 첫 날과 마지막 날
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // 달력에 표시할 날짜 배열 생성
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 1: 월요일, ...

    // 이전 달의 날짜들 (달력 첫 주 채우기)
    const prevMonthDays = [];
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }

    // 다음 달의 날짜들 (달력 마지막 주 채우기)
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells =
      Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed;
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    // 모든 날짜 합치기
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    // 주 단위로 분할
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // 날짜 선택 함수
    const handleDateChange = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setOrderDateFilter(`${year}-${month}-${day}`);
      setShowDatePicker(false);
    };

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    return (
      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-10 p-2 border border-gray-200 w-72">
        <div className="flex justify-between items-center mb-2 px-2">
          <button
            onClick={() => {
              const newDate = new Date(currentYear, currentMonth - 1, 1);
              handleDateChange(newDate);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-medium">{`${currentYear}년 ${
            currentMonth + 1
          }월`}</div>
          <button
            onClick={() => {
              const newDate = new Date(currentYear, currentMonth + 1, 1);
              handleDateChange(newDate);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((dayObj, index) => {
            const { date, isCurrentMonth } = dayObj;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected =
              selectedDate &&
              date.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateChange(date)}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm
                  ${isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                  ${isToday ? "bg-blue-100" : ""}
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between border-t pt-2">
          <button
            onClick={() => handleDateChange(today)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            오늘
          </button>
          <button
            onClick={() => setShowDatePicker(false)}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    );
  };

  // 발주 버튼을 누른경우
  async function handleConfirmAddStock() {
    setShowConfirmModal(false);

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
      setShowExpiringNotification(false);
      setProductRecommendations({}); // 추천 정보도 초기화

      // 발주 리스트 새로고침
      const updatedOrders = await fetchOrders();
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
    } catch (error) {
      alert(`발주 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setProcessingOrder(false);
    }
  }

  // 상품 리스트 가져오기
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

  // 발주할 상품 선택 및 추천 정보 가져오기
  async function handleSelectItem(goodsId) {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[goodsId]) {
        delete updated[goodsId];

        // 선택 해제 시 해당 상품의 추천 정보도 삭제
        setProductRecommendations((prev) => {
          const updated = { ...prev };
          delete updated[goodsId];
          return updated;
        });
      } else {
        updated[goodsId] = { quantity: "1" }; // 기본값을 1로 설정

        // 선택 시 해당 상품의 추천 정보 가져오기
        fetchProductRecommendation(goodsId);
      }
      return updated;
    });

    try {
      const latest = await fetchLatest(goodsId);
      const latestQuantity = latest?.orderQuantity || "";
      console.log(latestQuantity);

      // 최근 발주 수량 저장
      setLatestOrderQuantities((prev) => ({
        ...prev,
        [goodsId]: latestQuantity,
      }));
    } catch (e) {
      console.error("⚠️ 발주 수량 불러오기 실패", e.message);
    }
  }

  // 이전 발주 수량 적용 함수
  function applyLatestQuantity(goodsId) {
    const latestQuantity = latestOrderQuantities[goodsId];
    if (latestQuantity) {
      handleQuantityChange(goodsId, latestQuantity);
    }
  }

  // 추천 발주량 적용 함수
  function applyRecommendedQuantity(goodsId) {
    const recommendation = productRecommendations[goodsId];
    if (recommendation && recommendation.recommendedOrder) {
      handleQuantityChange(goodsId, recommendation.recommendedOrder.toString());
    }
  }

  // 수량 증가 함수
  function increaseQuantity(goodsId) {
    setSelectedItems((prev) => {
      const currentQuantity = parseInt(prev[goodsId]?.quantity || "0");
      return {
        ...prev,
        [goodsId]: {
          ...prev[goodsId],
          quantity: (currentQuantity + 1).toString(),
        },
      };
    });
  }

  // 수량 감소 함수
  function decreaseQuantity(goodsId) {
    setSelectedItems((prev) => {
      const currentQuantity = parseInt(prev[goodsId]?.quantity || "0");
      if (currentQuantity <= 1) return prev; // 최소값은 1

      return {
        ...prev,
        [goodsId]: {
          ...prev[goodsId],
          quantity: (currentQuantity - 1).toString(),
        },
      };
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
        newSelections[item.goods_id] = { quantity: "1" }; // 기본값을 1로 설정

        // 모든 선택된 상품에 대해 추천 정보 가져오기
        fetchProductRecommendation(item.goods_id);
      });
    } else {
      // 선택 해제 시 추천 정보도 초기화
      setProductRecommendations({});
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

  // 발주 리스트 필터링
  useEffect(() => {
    let filtered = [...orders];

    // 7. 날짜 필터링
    if (orderDateFilter) {
      filtered = filtered.filter((order) =>
        order.scheduledTime.startsWith(orderDateFilter)
      );
    }

    // 검색어 필터링
    if (orderSearchQuery.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.goodsName
            ?.toLowerCase()
            .includes(orderSearchQuery.toLowerCase()) ||
          order.orderId?.toString().includes(orderSearchQuery)
      );
    }

    // 상태 필터링
    if (orderStatusFilter) {
      filtered = filtered.filter((order) => order.status === orderStatusFilter);
    }

    // 정렬
    if (orderSortOption === "date_desc") {
      filtered.sort(
        (a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime)
      );
    } else if (orderSortOption === "date_asc") {
      filtered.sort(
        (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
      );
    } else if (orderSortOption === "quantity_desc") {
      filtered.sort((a, b) => b.orderQuantity - a.orderQuantity);
    } else if (orderSortOption === "quantity_asc") {
      filtered.sort((a, b) => a.orderQuantity - b.orderQuantity);
    }

    setFilteredOrders(filtered);
  }, [
    orders,
    orderSearchQuery,
    orderStatusFilter,
    orderSortOption,
    orderDateFilter,
  ]);

  // 선택된 상품 총 개수
  const selectedCount = Object.keys(selectedItems).length;

  // 선택된 상품 총 수량
  const totalQuantity = Object.values(selectedItems).reduce((sum, item) => {
    return sum + (Number.parseInt(item.quantity) || 0);
  }, 0);

  // 발주 상태에 따른 배지 색상 및 아이콘
  const getStatusBadge = (status) => {
    switch (status) {
      case "입고완료":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            입고완료
          </span>
        );
      case "발주 진행중":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            발주 진행중
          </span>
        );
      case "발주완료":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            발주완료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 엑셀로 내보내기
  const exportOrdersToExcel = () => {
    setShowExcelModal(false);

    const data = filteredOrders.map((order) => ({
      주문번호: order.orderId,
      상품명: order.goodsName,
      수량: order.orderQuantity,
      주문시간: formatDate(order.scheduledTime),
      상태: order.status,
    }));

    // data 배열은 엑셀에서 사용할 수 있는 시트 형식으로 변환
    // xlsx 라이브러리의 기능으로, json을 바로 시트로 만들 수 있음
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 엑셀 파일(워크북) 생성, 여러개의 시트를 포함 가능
    const workbook = XLSX.utils.book_new();

    // 위에서 만든 시트를 워크북에 추가 / 이름은 발주리스트
    XLSX.utils.book_append_sheet(workbook, worksheet, "발주 리스트");

    // 워크북을 .xlsx 형식의 버퍼로 변환
    // JavaScript ArrayBuffer 로 결과를 받겠다는 의미
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // ArrayBuffer를 Blob(파일 객체)로 감쌈
    // 파일로 다운로드하려면 Blob 형태로 만들어야 함
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // file-saver 라이브러리의 saveAs 를 이용해서 파일 다운로드 실행
    // 파일이름은 "발주_리스트_2025-04-02.xlsx" 느낌
    saveAs(blob, `발주_리스트_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 검수하기 버튼
  const confirmArrival = async (orderId) => {
    setShowInspectionModal(false);
    try {
      await fetchConfirmArrival(orderId);
      const updated = await fetchOrders();
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      console.error("입고 확인 실패", error);
    }
  };

  // Update the handleSelectOrder function to work with an object
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Add a function to handle "select all" checkbox
  const handleSelectAllOrders = (e) => {
    const isChecked = e.target.checked;
    setSelectAllChecked(isChecked);

    const newSelectedOrders = {};

    // Only select orders with "발주완료" status
    filteredOrders.forEach((order) => {
      if (order.status === "발주완료") {
        newSelectedOrders[order.orderId] = isChecked;
      }
    });

    setSelectedOrders(newSelectedOrders);
  };

  // Add a function to get the count of selected orders
  const getSelectedOrdersCount = () => {
    return Object.entries(selectedOrders).filter(
      ([_, isSelected]) => isSelected
    ).length;
  };

  // Add a function to get an array of selected order IDs
  const getSelectedOrderIds = () => {
    return Object.entries(selectedOrders)
      .filter(([_, isSelected]) => isSelected)
      .map(([orderId, _]) => Number(orderId));
  };

  // Update the batch confirmation function to show a modal first
  const confirmBatchArrival = async () => {
    const selectedIds = getSelectedOrderIds();

    if (selectedIds.length === 0) {
      alert("선택된 발주가 없습니다.");
      return;
    }

    // Show batch confirmation modal instead of directly processing
    setShowBatchInspectionModal(true);
  };

  // Add a new function to handle the actual batch processing after modal confirmation
  const processBatchArrival = async () => {
    setShowBatchInspectionModal(false);
    const selectedIds = getSelectedOrderIds();

    try {
      for (const orderId of selectedIds) {
        await fetchConfirmArrival(orderId);
      }

      const updated = await fetchOrders();
      setOrders(updated);
      setFilteredOrders(updated);
      setSelectedOrders({});
      setSelectAllChecked(false);

      alert(`${selectedIds.length}개의 발주가 검수 완료되었습니다.`);
    } catch (error) {
      console.error("일괄 입고 확인 실패", error);
      alert("일괄 검수 처리 중 오류가 발생했습니다.");
    }
  };

  // Add a new state for the batch inspection modal
  const [showBatchInspectionModal, setShowBatchInspectionModal] =
    useState(false);

  // Add a new state for previous orders button
  const [showPreviousOrdersModal, setShowPreviousOrdersModal] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [selectedPreviousOrders, setSelectedPreviousOrders] = useState({});
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");

  // Add this function to load previous orders
  const loadPreviousOrders = async () => {
    try {
      // 최근 일주일 전 날짜 계산
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      // 완료된 주문만 필터링
      const completedOrders = orders.filter(
        (order) =>
          (order.status === "입고완료" || order.status === "발주완료") &&
          new Date(order.scheduledTime) >= oneWeekAgo
      );

      // 요일별로 주문 그룹화 (0: 일요일, 1: 월요일, ..., 6: 토요일)
      const dayGroups = {
        월: [],
        화: [],
        수: [],
        목: [],
        금: [],
        토: [],
        일: [],
      };

      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

      completedOrders.forEach((order) => {
        const orderDate = new Date(order.scheduledTime);
        const dayIndex = orderDate.getDay(); // 0: 일요일, 1: 월요일, ...
        const dayName = dayNames[dayIndex];

        if (dayGroups[dayName]) {
          dayGroups[dayName].push(order);
        }
      });

      // 요일별 그룹을 배열로 변환
      const groupedByDay = Object.entries(dayGroups);

      setPreviousOrders(groupedByDay);
      setShowPreviousOrdersModal(true);
    } catch (error) {
      console.error("이전 발주 불러오기 실패", error);
    }
  };

  // Add this function to handle selecting previous orders
  const handleSelectPreviousOrder = (orderId) => {
    setSelectedPreviousOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Add this function to apply selected previous orders
  const applyPreviousOrders = () => {
    const selectedOrderIds = Object.entries(selectedPreviousOrders)
      .filter(([_, isSelected]) => isSelected)
      .map(([orderId, _]) => Number(orderId));

    if (selectedOrderIds.length === 0) {
      alert("선택된 발주가 없습니다.");
      return;
    }

    // Find the selected orders and add them to the cart
    const newSelectedItems = { ...selectedItems };

    orders.forEach((order) => {
      if (selectedOrderIds.includes(order.orderId)) {
        const goodsId = order.goodsId.toString();
        newSelectedItems[goodsId] = {
          quantity: order.orderQuantity.toString(),
        };

        // Also update latest order quantities
        setLatestOrderQuantities((prev) => ({
          ...prev,
          [goodsId]: order.orderQuantity,
        }));

        // 선택된 상품의 추천 정보 가져오기
        fetchProductRecommendation(order.goodsId);
      }
    });

    setSelectedItems(newSelectedItems);
    setShowPreviousOrdersModal(false);
    setSelectedPreviousOrders({});
  };

  // Add function to select all previous orders for a specific day
  const selectAllPreviousOrdersForDay = (dateOrders) => {
    const newSelectedOrders = { ...selectedPreviousOrders };

    // 현재 해당 요일의 모든 주문이 선택되어 있는지 확인
    const allSelected = dateOrders.every(
      (order) => selectedPreviousOrders[order.orderId]
    );

    // 모두 선택되어 있으면 선택 해제, 아니면 모두 선택
    dateOrders.forEach((order) => {
      newSelectedOrders[order.orderId] = !allSelected;
    });

    setSelectedPreviousOrders(newSelectedOrders);
  };

  // Function to filter orders by day of week
  const filterOrdersByDay = (orders, dayFilter) => {
    if (dayFilter === "all") return orders;

    const dayMap = {
      월: 1,
      화: 2,
      수: 3,
      목: 4,
      금: 5,
      토: 6,
      일: 0,
    };

    return orders.filter((order) => {
      const date = new Date(order.scheduledTime);
      return date.getDay() === dayMap[dayFilter];
    });
  };

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
            {/* 유통기한 임박 상품 알림 */}
            {showExpiringNotification && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-amber-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-amber-800">
                      유통기한 임박 상품 알림
                    </h3>
                    <p className="text-amber-700 text-sm">
                      유통기한 임박 페이지에서 선택한 {expiringItemsCount}개
                      상품이 발주 목록에 추가되었습니다.
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
            {/* 검색 및 필터 영역 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                {/* 검색창 */}
                <div className="relative md:col-span-6">
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
                <div className="flex gap-3 md:col-span-4">
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
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
                <div className="md:col-span-2">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                  >
                    <option value="">기본 정렬</option>
                    <option value="stock_asc">재고 적은순</option>
                    <option value="stock_desc">재고 많은순</option>
                    <option value="price_asc">가격 낮은순</option>
                    <option value="price_desc">가격 높은순</option>
                  </select>
                </div>
              </div>

              {/* 재고 상태 필터 */}
              <div className="flex justify-between items-center gap-2">
                {/* 왼쪽 필터 섹션 */}
                <div className="flex items-center gap-2">
                  {/* 아이콘과 버튼 그룹을 동일한 flex 안에서 정렬 */}
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

                {/* 오른쪽 버튼 */}
                <div>
                  <button
                    onClick={loadPreviousOrders}
                    className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <History className="w-3.5 h-3.5 mr-1.5" />
                    이전 발주 보기
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
                            <td className="px-6 py-4 whitespace-nowrap w-24">
                              <img
                                src={
                                  `${item.goods_image || "/placeholder.svg"}` ||
                                  "/placeholder.svg"
                                }
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
                                    value={
                                      selectedItems[item.goods_id]?.quantity ||
                                      ""
                                    }
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
                                </div>

                                {selectedItems[item.goods_id] &&
                                  productRecommendations[item.goods_id] && (
                                    <div className="flex items-center">
                                      <button
                                        onClick={() =>
                                          applyRecommendedQuantity(
                                            item.goods_id
                                          )
                                        }
                                        className="flex items-center text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-100 transition-colors"
                                      >
                                        <span className="font-bold mr-1">
                                          {
                                            productRecommendations[
                                              item.goods_id
                                            ].recommendedOrder
                                          }
                                          개
                                        </span>
                                        추천
                                      </button>
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

              {/* 발주 장바구니 - 스크롤에 따라 움직이는 스티키 컴포넌트 */}
              <div className="sticky top-6 self-start bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2 text-indigo-600" />
                      발주 예정 상품
                      <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-2 py-0.5">
                        {selectedCount}
                      </span>
                    </h3>
                  </div>
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
                                src={
                                  `${
                                    product.goods_image || "/placeholder.svg"
                                  }` || "/placeholder.svg"
                                }
                                alt={product.goods_name}
                                className="w-10 h-10 object-cover rounded-md mr-3"
                              />
                              <div>
                                <div className="font-medium text-gray-800 text-sm">
                                  {product.goods_name}
                                </div>
                                <div className="flex items-center mt-1">
                                  {/* 수량 조절 버튼 */}
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                      onClick={() => decreaseQuantity(goodsId)}
                                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                                      disabled={
                                        !data.quantity ||
                                        parseInt(data.quantity) <= 1
                                      }
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[30px] text-center">
                                      {data.quantity || 0}
                                    </span>
                                    <button
                                      onClick={() => increaseQuantity(goodsId)}
                                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </button>
                                  </div>
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
                      onClick={() => {
                        setSelectedItems({});
                        setProductRecommendations({});
                      }}
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
                          Object.values(selectedItems).some(
                            (item) => item.quantity
                          )
                        ) {
                          setShowConfirmModal(true);
                        } else {
                          alert("수량이 입력된 상품이 없습니다.");
                        }
                      }}
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
          </>
        )}

        {activeTab === "list" && (
          <>
            {/* 발주 리스트 검색 및 필터 영역 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col gap-4">
                {/* 첫 번째 줄: 날짜, 검색, 정렬 */}
                <div className="grid grid-cols-12 gap-4">
                  {/* 날짜 필터 (왼쪽) */}
                  <div className="col-span-4 flex items-center gap-2">
                    <button
                      onClick={() => navigateDate(-1)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="relative flex-grow">
                      <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {orderDateFilter
                            ? formatDateWithDay(new Date(orderDateFilter))
                            : formatDateWithDay(new Date())}
                        </span>
                      </button>
                      {renderCustomDatePicker()}
                    </div>

                    <button
                      onClick={() => navigateDate(1)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 검색창 (중간 - 더 길게) */}
                  <div className="col-span-6 relative">
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

                  {/* 정렬 옵션 (오른쪽 - 짧게) */}
                  <div className="col-span-2">
                    <select
                      value={orderSortOption}
                      onChange={(e) => setOrderSortOption(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                    >
                      <option value="date_desc">최신순</option>
                      <option value="date_asc">오래된순</option>
                      <option value="quantity_desc">수량 많은순</option>
                      <option value="quantity_asc">수량 적은순</option>
                    </select>
                  </div>
                </div>

                {/* 두 번째 줄: 상태 필터 버블 */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setOrderStatusFilter("")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        orderStatusFilter === ""
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter("발주 진행중")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        orderStatusFilter === "발주 진행중"
                          ? "bg-white text-yellow-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      발주 진행중
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter("발주완료")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        orderStatusFilter === "발주완료"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      발주 완료
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter("입고완료")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        orderStatusFilter === "입고완료"
                          ? "bg-white text-green-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      입고완료
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 일괄 검수 버튼 */}
            {getSelectedOrdersCount() > 0 && (
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {getSelectedOrdersCount()}개 선택됨
                  </span>
                </div>
                <button
                  onClick={confirmBatchArrival}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  선택한 발주 일괄 검수 확인
                </button>
              </div>
            )}

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
                          <input
                            type="checkbox"
                            checked={selectAllChecked}
                            onChange={handleSelectAllOrders}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </th>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedOrders[order.orderId] || false}
                              onChange={() => handleSelectOrder(order.orderId)}
                              disabled={order.status !== "발주완료"}
                              className={`h-4 w-4 focus:ring-indigo-500 border-gray-300 rounded ${
                                order.status === "발주완료"
                                  ? "text-indigo-600 cursor-pointer"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={
                                    `${
                                      order.goodsImage || "/placeholder.svg"
                                    }` || "/placeholder.svg"
                                  }
                                  alt={order.goodsName}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {order.goodsName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-semibold text-indigo-600">
                              {order.orderQuantity}개
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.scheduledTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.status === "발주완료" && (
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.orderId);
                                  setShowInspectionModal(true);
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
                  <span className="text-sm font-medium text-gray-500">
                    선택한 상품
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-2 py-1">
                    {selectedCount}개 상품
                  </span>
                </div>

                {/* 상품 목록 */}
                <div className="max-h-60 overflow-y-auto mb-4 pr-1">
                  <ul className="space-y-2">
                    {Object.entries(selectedItems).map(([goodsId, data]) => {
                      if (!data || !data.quantity) return null;

                      const product = goodsList.find(
                        (g) => g.goods_id === Number.parseInt(goodsId)
                      );

                      if (!product) return null;

                      return (
                        <li
                          key={goodsId}
                          className="flex items-center p-2 border border-gray-100 rounded-lg bg-gray-50"
                        >
                          <img
                            src={
                              `${product.goods_image || "/placeholder.svg"}` ||
                              "/placeholder.svg"
                            }
                            alt={product.goods_name}
                            className="w-10 h-10 object-cover rounded-md mr-3 border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {product.goods_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Number(product.goods_price).toLocaleString()}원
                            </p>
                          </div>
                          <div className="ml-2 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {data.quantity}개
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* 요약 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">총 상품 종류:</span>
                    <span className="font-medium text-gray-800">
                      {selectedCount}개
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">총 발주 수량:</span>
                    <span className="font-bold text-indigo-700">
                      {totalQuantity}개
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    위 상품들을 발주하시겠습니까?
                  </p>
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
                <h3 className="text-lg font-bold text-gray-900">
                  엑셀 내보내기
                </h3>
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
                    <h4 className="text-lg font-semibold text-gray-900">
                      발주 리스트 다운로드
                    </h4>
                    <p className="text-sm text-gray-600">
                      현재 필터링된 {filteredOrders.length}개의 발주 내역을 엑셀
                      파일로 내보냅니다.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">파일 형식:</span>
                    <span className="font-medium text-gray-800">
                      Excel (.xlsx)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">발주 내역 수:</span>
                    <span className="font-bold text-green-700">
                      {filteredOrders.length}개
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    발주 리스트를 엑셀 파일로 내보내시겠습니까?
                  </p>
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
                    <h4 className="text-lg font-semibold text-gray-900">
                      발주 검수 완료
                    </h4>
                    <p className="text-sm text-gray-600">
                      주문번호 #{selectedOrderId}의 발주 상품이 정상적으로
                      입고되었는지 확인하셨나요?
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      검수 확인 후에는 상태가 '입고완료'로 변경되며, 이 작업은
                      되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    검수 완료 처리를 진행하시겠습니까?
                  </p>
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
                <CheckCircle className="w-4 h-4 mr-2" />
                검수 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검수 확인 모달 */}
      {showBatchInspectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] h-[600px] shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">
                  일괄 검수 확인
                </h3>
              </div>
            </div>

            {/* Modal Content - 내용 영역에 고정 높이와 스크롤 설정 */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      발주 일괄 검수 완료
                    </h4>
                    <p className="text-sm text-gray-600">
                      선택한 {getSelectedOrdersCount()}개의 발주 상품이
                      정상적으로 입고되었는지 확인하셨나요?
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      검수 확인 후에는 상태가 '입고완료'로 변경되며, 이 작업은
                      되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    선택한 {getSelectedOrdersCount()}개 발주의 검수 완료 처리를
                    진행하시겠습니까?
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowBatchInspectionModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={processBatchArrival}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                일괄 검수 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이전 발주 모달 */}
      {showPreviousOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <History className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900">
                    이전 발주 내역
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreviousOrdersModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* 요일별 필터 추가 */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="font-medium text-gray-700">요일별 보기</h4>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setSelectedDayFilter("all")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "all"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter("월")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "월"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    월요일
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter("화")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "화"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    화요일
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter("수")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "수"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    수요일
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter("목")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "목"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    목요일
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter("금")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "금"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    금요일
                  </button>
                </div>
              </div>

              {previousOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>이전 발주 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {previousOrders.map(([dayName, dayOrders]) => {
                    // 요일별 필터링 적용
                    const filteredDayOrders =
                      selectedDayFilter === "all"
                        ? dayOrders
                        : dayName === selectedDayFilter
                        ? dayOrders
                        : [];

                    if (
                      selectedDayFilter !== "all" &&
                      dayName !== selectedDayFilter
                    ) {
                      return null; // 선택한 요일이 아니면 표시하지 않음
                    }

                    return (
                      <div
                        key={dayName}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              <h4 className="font-medium text-gray-700">
                                {dayName}요일
                              </h4>
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold rounded-full px-2 py-0.5">
                                {dayOrders.length}개
                              </span>
                            </div>
                            {dayOrders.length > 0 && (
                              <button
                                onClick={() =>
                                  selectAllPreviousOrdersForDay(dayOrders)
                                }
                                className="flex items-center px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                              >
                                <CheckSquare className="w-3 h-3 mr-1" />
                                {dayOrders.every(
                                  (order) =>
                                    selectedPreviousOrders[order.orderId]
                                )
                                  ? "전체 해제"
                                  : "전체 선택"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                          {dayOrders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                              <p>해당 요일에 발주 내역이 없습니다.</p>
                            </div>
                          ) : (
                            dayOrders.map((order) => (
                              <div
                                key={order.orderId}
                                className="p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedPreviousOrders[order.orderId] ||
                                      false
                                    }
                                    onChange={() =>
                                      handleSelectPreviousOrder(order.orderId)
                                    }
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                                  />

                                  <div className="flex items-center flex-1">
                                    <div className="flex-shrink-0 h-12 w-12">
                                      <img
                                        className="h-12 w-12 rounded-md object-cover border border-gray-200"
                                        src={
                                          `${
                                            order.goodsImage ||
                                            "/placeholder.svg" ||
                                            "/placeholder.svg"
                                          }` || "/placeholder.svg"
                                        }
                                        alt={order.goodsName}
                                      />
                                    </div>
                                    <div className="ml-4 flex-1">
                                      <div className="flex justify-between">
                                        <div className="text-sm font-medium text-gray-900">
                                          {order.goodsName}
                                        </div>
                                        <div className="text-sm font-semibold text-indigo-600">
                                          {order.orderQuantity}개
                                        </div>
                                      </div>
                                      <div className="flex justify-between mt-1">
                                        <div className="text-xs text-gray-500">
                                          주문번호: #{order.orderId}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(
                                            order.scheduledTime
                                          ).toLocaleDateString("ko-KR")}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between">
              <div className="text-sm text-gray-600">
                {Object.values(selectedPreviousOrders).filter(Boolean).length}개
                선택됨
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviousOrdersModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={applyPreviousOrders}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={
                    Object.values(selectedPreviousOrders).filter(Boolean)
                      .length === 0
                  }
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  선택 상품 발주하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderingPage;
