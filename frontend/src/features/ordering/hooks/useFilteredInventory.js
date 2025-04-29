import { useEffect } from "react";
import {
  fetchGoodsByCategory,
  fetchGoodsBySubCategory,
  fetchGoodsList,
} from "../../goods/api/HttpGoodsService";
import useOrderingStore from "../stores/useOrderingStore";

export function useFilteredInventory() {
  const inventoryList = useOrderingStore((state) => state.inventoryList);
  const setFilteredInventory = useOrderingStore(
    (state) => state.setFilteredInventory
  );
  const category = useOrderingStore((state) => state.category);
  const subCategory = useOrderingStore((state) => state.subCategory);
  const statusFilter = useOrderingStore((state) => state.statusFilter);
  const searchQuery = useOrderingStore((state) => state.searchQuery);
  const sortOption = useOrderingStore((state) => state.sortOption);
  const setError = useOrderingStore((state) => state.setError);

  useEffect(() => {
    if (!inventoryList.length) return;

    async function getFilteredInventory() {
      try {
        let goodsList = [];

        if (category && subCategory) {
          goodsList = await fetchGoodsBySubCategory(category, subCategory);
        } else if (category) {
          goodsList = await fetchGoodsByCategory(category);
        } else {
          goodsList = await fetchGoodsList();
        }

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

        mergedList = mergedList
          .filter((item) => goodsList.some((g) => g.goods_id === item.goodsId))
          .map((item) => {
            const matched = goodsList.find((g) => g.goods_id === item.goodsId);
            return { ...item, ...matched };
          });

        if (statusFilter) {
          mergedList = mergedList.filter(
            (item) => item.stockStatus === statusFilter
          );
        }

        if (searchQuery.trim() !== "") {
          mergedList = mergedList.filter((item) =>
            item.goods_name?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (sortOption === "price_asc") {
          mergedList.sort((a, b) => a.goods_price - b.goods_price);
        } else if (sortOption === "price_desc") {
          mergedList.sort((a, b) => b.goods_price - a.goods_price);
        } else if (sortOption === "stock_asc") {
          mergedList.sort((a, b) => a.stockQuantity - b.stockQuantity);
        } else if (sortOption === "stock_desc") {
          mergedList.sort((a, b) => b.stockQuantity - a.stockQuantity);
        }

        setFilteredInventory(mergedList);
      } catch (error) {
        setError(error.message);
      }
    }

    getFilteredInventory();
  }, [
    inventoryList,
    category,
    subCategory,
    statusFilter,
    searchQuery,
    sortOption,
  ]);
}
