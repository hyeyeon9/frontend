import { useEffect } from "react";
import useOrderingStore from "../stores/useOrderingStore";
import { fetchOrders } from "../api/HttpOrderingService";

export function useOrderList() {
  const setOrders = useOrderingStore((state) => state.setOrders);
  const setFilteredOrders = useOrderingStore(
    (state) => state.setFilteredOrders
  );
  const setLoading = useOrderingStore((state) => state.setLoading);
  const setError = useOrderingStore((state) => state.setError);

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
}
