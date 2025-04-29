import { useEffect } from "react";
import { fetchInventoryList } from "../../inventory/api/HttpInventoryService";
import useOrderingStore from "../stores/useOrderingStore";

export function useInventoryList() {
  const setInventoryList = useOrderingStore((state) => state.setInventoryList);
  const setLoading = useOrderingStore((state) => state.setLoading);
  const setError = useOrderingStore((state) => state.setError);

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
}
