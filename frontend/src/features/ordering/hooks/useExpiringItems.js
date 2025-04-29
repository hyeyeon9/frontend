import { useEffect } from "react";

export function useExpiringItems({
  goodsList,
  inventoryList,
  hasLoadedFromStorage,
  setHasLoadedFromStorage,
  selectedItems,
  setSelectedItems,
  setExpiringItemsCount,
  setShowExpiringNotification,
  fetchProductRecommendation,
}) {
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
  }, [
    goodsList,
    inventoryList,
    hasLoadedFromStorage,
    selectedItems,
    setSelectedItems,
    setExpiringItemsCount,
    setShowExpiringNotification,
    fetchProductRecommendation,
    setHasLoadedFromStorage,
  ]);
}
