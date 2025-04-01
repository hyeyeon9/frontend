import axios from "axios";

// 1. 발주하기
export async function requestOrder(goodsId, addStock) {
  const response = await axios.post("http://localhost:8090/app/orderRequest/request", {
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
  const response = await axios.get("http://localhost:8090/app/orderRequest/list");
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchOrders 예외발생");
  }

  return response.data;
}


// 가장 최근 발주 1건 가져오기
export async function fetchLatest(goodsId) {
  const response = await axios.get(`http://localhost:8090/app/orderRequest/latest/${goodsId}`);
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchLatest 예외발생");
  }

  return response.data;
}


// 상품의 최근 7일간 판매량 가져오기
export async function fetchWeekSales(goodsId) {
  const response = await axios.get(`http://localhost:8090/app/saleData/week/${goodsId}`);
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchWeekSales 예외발생");
  }

  return response.data;
}


