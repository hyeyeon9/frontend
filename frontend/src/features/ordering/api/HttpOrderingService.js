import axiosInstance from "../../../utils/axios";

// 1. 발주하기
export async function requestOrder(goodsId, addStock) {
  const response = await axiosInstance.post("/orderRequest/request", {
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
  const response = await axiosInstance.get("/orderRequest/list");
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchOrders 예외발생");
  }

  return response.data;
}

// 가장 최근 발주 1건 가져오기
export async function fetchLatest(goodsId) {
  const response = await axiosInstance.get(`/orderRequest/latest/${goodsId}`);
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchLatest 예외발생");
  }

  return response.data;
}

// 상품의 최근 7일간 판매량 가져오기
export async function fetchWeekSales(goodsId) {
  const response = await axiosInstance.get(`/saleData/week/${goodsId}`);
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchWeekSales 예외발생");
  }

  return response.data;
}

// 상품 status 변환 (발수완료 -> 입고완료)
export async function fetchConfirmArrival(orderId) {
  const response = await axiosInstance.post(`/orderRequest/confirm/${orderId}`);
  console.log("response", response);

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchConfirmArrival 예외발생");
  }

  return response.data;
}
