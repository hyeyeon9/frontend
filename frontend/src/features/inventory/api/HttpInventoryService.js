import axiosInstance from "../../../utils/axios";

// 1. 전체 재고 조회하기
export async function fetchInventoryList() {
  const response = await axiosInstance.get(`/inventory/findAll`);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchUserList 예외발생");
  }

  return response.data;
}

// 2. 특정 상품 재고 조회하기
export async function fetchInventoryById(batchId) {
  const response = await axiosInstance.get(`/inventory/findById/${batchId}`);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchUserList 예외발생");
  }

  return response.data;
}

// 3. 재고 수정하기 (전체)
export async function updateStockById(goodsId, newStock) {
  const response = await axiosInstance.put(
    `/inventory/updateStock/${goodsId}?newStock=${newStock}`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("updateStockById 예외발생");
  }

  return response.data;
}

// 3. 재고 수정하기 (배치단위)
export async function updateStockByBatchId(batchId, newStock) {
  const response = await axiosInstance.put(
    `/inventory/update/${batchId}/${newStock}`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("updateStockByBatchId 예외발생");
  }

  return response.data;
}

// 5. 유통기한 임박 상품 조회
export async function fetchExpiringItems() {
  const response = await axiosInstance.get(`/inventory/expiring-soon`);
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchExpiringItems 예외발생");
  }

  return response.data;
}
