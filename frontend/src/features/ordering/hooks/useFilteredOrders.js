import { useEffect, useState } from "react";
import useOrderingStore from "../stores/useOrderingStore";

export function useFilteredOrders() {
  const orderSearchQuery = useOrderingStore((state) => state.orderSearchQuery);
  const orderStatusFilter = useOrderingStore(
    (state) => state.orderStatusFilter
  );
  const orderSortOption = useOrderingStore((state) => state.orderSortOption);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [orderDateFilter, setOrderDateFilter] = useState(getTodayString());

  const orders = useOrderingStore((state) => state.orders);

  const setFilteredOrders = useOrderingStore(
    (state) => state.setFilteredOrders
  );
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
}
