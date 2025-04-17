import axiosInstance from "../../../utils/axios";

// 전체 상품 목록 - 페이지네이션
export async function fetchGetPagedGoods({
  page = 0,
  size = 12,
  category,
  minPrice,
  maxPrice,
  search,
  sortBy,
}) {
  const params = {
    page,
    size,
  };

  if (category) params.category = category;
  if (search) params.search = search;
  if (minPrice !== undefined) params.minPrice = minPrice;
  if (maxPrice !== undefined) params.maxPrice = maxPrice;
  if (sortBy) params.sort = sortBy;

  try {
    const response = await axiosInstance.get("/shop/getGoods", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("fetchGetPagedGoods 예외발생:", error);
    throw new Error("fetchGetPagedGoods 예외발생");
  }
}

// 재고가 있는 상품 목록
export async function fetchGetAllInStockGoods() {
  const response = await axiosInstance.get(`/shop/findAllInStockGoods`);

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGetDiscountedGoods 예외발생");
  }

  return response.data;
}

// 재고가 있으면서 할인 중인 상품 목록
export async function fetchGetDiscountedGoods() {
  const response = await axiosInstance.get(`/shop/isDiscountedList`);

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGetDiscountedGoods 예외발생");
  }

  return response.data;
}

// 인기 상품 목록
export async function fetchGetTop10Items() {
  const response = await axiosInstance.get(`/shop/top10`);

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGetDiscountedGoods 예외발생");
  }

  return response.data;
}

// goods_id로 sub_name 가져오기
export async function fetchSubName(goodsId) {
  const response = await axiosInstance.get(`/goods/subName?goodsId=${goodsId}`);

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchSubName 예외발생");
  }

  return response.data;
}

// 연관상품 가져오기
export async function fetchRecommendations(subName) {
  const response = await axiosInstance.get(
    `/goods/recommendations?subName=${subName}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchRecommendations 예외발생");
  }

  return response.data;
}

// 결제하기를 누르면 장바구니에 담긴 상품을 결제하기 위한 API 호출
export async function fetchPostOrder(order) {
  try {
    // 주문 정보 저장
    const response = await axiosInstance.post(`/payment/order`, order);

    if (response.status !== 200) {
      console.log("주문 저장 실패");
      throw new Error("주문 저장 실패");
    }
    return response.data.orderId;
  } catch (error) {
    console.error("결제 처리 중 오류 발생:", error);
    throw new Error("결제 처리 중 오류 발생");
  }
}
