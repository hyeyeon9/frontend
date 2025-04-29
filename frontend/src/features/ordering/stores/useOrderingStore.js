import { create } from "zustand";

const useOrderingStore = create((set) => ({
  // 상품/재고 관련
  inventoryList: [],
  goodsList: [],
  filteredInventory: [],
  setInventoryList: (list) => set({ inventoryList: list }),
  setGoodsList: (list) => set({ goodsList: list }),
  setFilteredInventory: (list) => set({ filteredInventory: list }),

  // 발주 선택 관련
  selectedItems: {}, // { goodsId: { quantity: "1" } }
  setSelectedItems: (items) => set({ selectedItems: items }),

  // 최근 발주 수량
  latestOrderQuantities: {},
  setLatestOrderQuantities: (quantities) =>
    set({ latestOrderQuantities: quantities }),

  // 상품 추천 (재고/판매량 기반)
  productRecommendations: {},
  setProductRecommendations: (recommendations) =>
    set({ productRecommendations: recommendations }),

  // 필터/검색/정렬
  category: "",
  subCategory: "",
  sortOption: "",
  statusFilter: "",
  searchQuery: "",
  setCategory: (category) => set({ category }),
  setSubCategory: (subCategory) => set({ subCategory }),
  setSortOption: (sortOption) => set({ sortOption }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // 로딩/에러
  loading: true,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 발주 리스트 관련
  orders: [],
  filteredOrders: [],
  setOrders: (orders) => set({ orders }),
  setFilteredOrders: (orders) => set({ filteredOrders: orders }),

  // 발주용 날짜/검색/정렬 필터
  orderSearchQuery: "",
  orderStatusFilter: "",
  orderSortOption: "",
  orderDateFilter: "",
  setOrderSearchQuery: (query) => set({ orderSearchQuery: query }),
  setOrderStatusFilter: (filter) => set({ orderStatusFilter: filter }),
  setOrderSortOption: (option) => set({ orderSortOption: option }),
  setOrderDateFilter: (date) => set({ orderDateFilter: date }),

  // 발주 진행 중 여부
  processingOrder: false,
  setProcessingOrder: (processing) => set({ processingOrder: processing }),

  // 유통기한 임박 알림
  hasLoadedFromStorage: false,
  showExpiringNotification: false,
  expiringItemsCount: 0,
  setHasLoadedFromStorage: (flag) => set({ hasLoadedFromStorage: flag }),
  setShowExpiringNotification: (flag) =>
    set({ showExpiringNotification: flag }),
  setExpiringItemsCount: (count) => set({ expiringItemsCount: count }),
}));

export default useOrderingStore;
