import axios from "axios";

// 1. 발주하기
export async function requestOrder(goodsId, addStock) {
  const response = await axios.post("http://localhost:8090/app/order/request", {
    goodsId,
    addStock,
  });
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("addStock 예외발생");
  }

  return response.data;
}

// 발주 리스트
export async function fetchOrders() {
  const response = await axios.get("http://localhost:8090/app/order/list");
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchOrders 예외발생");
  }

  return response.data;
}
