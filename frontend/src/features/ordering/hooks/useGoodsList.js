import { useEffect } from "react";
import { fetchGoodsList } from "../../goods/api/HttpGoodsService";
import useOrderingStore from "../stores/useOrderingStore";

export function useGoodsList() {
  const setGoodsList = useOrderingStore((state) => state.setGoodsList);

  const setError = useOrderingStore((state) => state.setError);

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
}
