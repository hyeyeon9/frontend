import axios from "axios";

// 1. 전체 재고 조회하기
export async function fetchInventoryList() {
  const response = await axios.get(
    `http://localhost:8090/app/inventory/findAll`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchUserList 예외발생");
  }

  return response.data;
}

// 2. 특정 상품 재고 조회하기
export async function fetchInventoryById(goodsId) {
  const response = await axios.get(
    `http://localhost:8090/app/inventory/findById/${goodsId}`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchUserList 예외발생");
  }
  
  return response.data;
}

// 3. 재고 수정하기
export async function updateStockById(goodsId, newStock) {

  const response = await axios.put(
    `http://localhost:8090/app/goods/updateStock/${goodsId}?newStock=${newStock}`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("updateStockById 예외발생");
  }
  
  return response.data;
}
