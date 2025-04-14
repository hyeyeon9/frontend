import { useEffect, useState } from "react";
import {
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
  Filter,
  History,
  Info,
  Package,
  Search,
  ShoppingCart,
  Trash2,
  X,
  CheckSquare,
  Bell,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 새로운 상태 추가: 각 상품별 재고 및 추천 정보 저장
  const [productRecommendations, setProductRecommendations] = useState({});

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

  // 이전 발주 모달을 위한 상태들
  const [showPreviousOrdersModal, setShowPreviousOrdersModal] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [selectedPreviousOrders, setSelectedPreviousOrders] = useState({});
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");

  // 최근 7일간 발주
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

  return (
    <div className="bg-gray-50 min-h-screen -mt-3">
      <div className="max-w-7xl mx-auto">
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
                  유통기한 임박 페이지에서 선택한 {expiringItemsCount}개 상품이
                  발주 목록에 추가되었습니다.
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
                <option value="">대분류</option>
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
                <option value="">중분류</option>
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
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    statusFilter === ""
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setStatusFilter("정상")}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    statusFilter === "정상"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  정상
                </button>
                <button
                  onClick={() => setStatusFilter("재고부족")}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
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
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="xl:px-6 py-3 lg:px-4 text-left lg:text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <th className="xl:px-0  xl:w-[50px] py-3  lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:hidden xl:table-cell">
                        ID
                      </th>
                      <th className="xl:px-5 py-3  xl:w-[150px] lg:w-[100px] lg:px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        이미지
                      </th>
                      <th className="xl:px-2 py-3 xl:w-[240px] lg:w-[210px] lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상품명
                      </th>
                      <th className="xl:px-6 py-3 xl:w-[130px] lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가격
                      </th>
                      <th className="xl:px-6 py-3 lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        재고
                      </th>
                      <th className="xl:px-6 py-3 lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:whitespace-nowrap">
                        발주 수량
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.goods_id}
                        className="hover:bg-gray-50  hover:cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <td className="xl:px-6 xl:py-4 whitespace-nowrap lg:px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedItems[item.goods_id])}
                            onChange={() => handleSelectItem(item.goods_id)}
                            className="h-4 w-4 hover:cursor-pointer text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="lg:px-4 xl:px-3 py-4 whitespace-nowrap text-sm text-gray-500 lg:hidden xl:table-cell">
                          <span className="ml-[-10px] inline-block">
                            {" "}
                            {/* 텍스트에 직접 적용 */}
                            {item.goods_id}
                          </span>
                        </td>

                        <td className="lg:px-3 xl:px-4 py-4 whitespace-nowrap lg:w-32 xl:w-24">
                          <img
                            src={item.goods_image || "/placeholder.svg"}
                            alt={item.goods_name}
                            className="w-20 h-20 lg:w-24 lg:h-16 xl:w-20 xl:h-16 object-cover rounded-md border border-gray-200"
                          />
                        </td>

                        <td
                          onClick={() => handleSelectItem(item.goods_id)}
                          className="lg:px-4 xl:px-2 py-4 whitespace-nowrap xl:w-[240px] lg:max-w-[220px] "
                        >
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.goods_name}
                          </div>
                        </td>

                        <td className="lg:px-4 xl:px-6 py-4 whitespace-nowrap xl:w-[130px] ">
                          <div className="text-sm font-semibold text-indigo-600">
                            {Number(item.goods_price).toLocaleString()}원
                          </div>
                        </td>
                        <td className="lg:px-4 xl:px-6 py-4 whitespace-nowrap">
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
                        <td className="lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2 w-full min-h-[72px] justify-center">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={
                                  selectedItems[item.goods_id]?.quantity || ""
                                }
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.goods_id,
                                    e.target.value
                                  )
                                }
                                disabled={!selectedItems[item.goods_id]}
                                min="1"
                                className="w-20 lg:w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center disabled:bg-gray-100 disabled:text-gray-400"
                                placeholder="수량"
                              />
                            </div>

                            {selectedItems[item.goods_id] &&
                              productRecommendations[item.goods_id] && (
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      applyRecommendedQuantity(item.goods_id)
                                    }
                                    className="flex items-center text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-100 transition-colors"
                                  >
                                    <span className="font-bold mr-1">
                                      {
                                        productRecommendations[item.goods_id]
                                          .recommendedOrder
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
                <h3 className="xl:text-lg lg:text-base font-semibold text-gray-800 flex items-center">
                  <ShoppingCart className="xl:h-5 xl:w-5 mr-2  lg:w-4 lg:-ml-2 text-indigo-600" />
                  발주 예정 상품
                  <span className="ml-2  bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-2 py-0.5">
                    {selectedCount}
                  </span>
                </h3>
              </div>
            </div>

            <div className="xl:p-5 max-h-[50vh] overflow-y-auto lg:p-2">
              {Object.keys(selectedItems).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <span className="lg:inline xl:hidden">
                    발주할 상품을
                    <br />
                    선택해주세요
                  </span>
                  <span className="xl:inline lg:hidden">
                    발주할 상품을 선택해주세요
                  </span>
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
                              `${product.goods_image || "/placeholder.svg"}` ||
                              "/placeholder.svg"
                            }
                            alt={product.goods_name}
                            className="w-10 h-10 object-cover rounded-md mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
                              {product.goods_name}
                            </div>
                            <div className="flex items-center mt-2 ">
                              {/* 수량 조절 버튼 */}
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => decreaseQuantity(goodsId)}
                                  className="px-2  py-1 lg:w-7 text-gray-500 hover:bg-gray-100"
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
                                  className="px-2  py-1 text-gray-500 hover:bg-gray-100"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectItem(goodsId)}
                          className="text-gray-400 hover:text-red-500 transition-colors self-start"
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
                      Object.values(selectedItems).some((item) => item.quantity)
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
      </div>

      {/* 발주 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
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

      {/* 이전 발주 모달 */}
      {showPreviousOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg w-[900px] h-[700px] shadow-xl overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="bg-blue-50 p-6 border-b border-blue-100 flex-shrink-0">
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

            {/* 모달 내용 - 고정 크기에 스크롤 가능하도록 설정 */}
            <div className="p-6 overflow-y-auto flex-grow">
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
                  <button
                    onClick={() => setSelectedDayFilter("토")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "토"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    토요일
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter("일")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDayFilter === "일"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    일요일
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
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between flex-shrink-0">
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
