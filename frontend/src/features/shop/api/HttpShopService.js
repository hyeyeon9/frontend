import axios from "axios";

// 전체 상품 목록 - 페이지네이션
export async function fetchGetPagedGoods({
  page = 0,
  size = 12,
  category = undefined,
  search = undefined,
  sortBy,
}) {
  // 기본 URL
  let url = `http://localhost:8090/app/shop/getGoods?page=${page}&size=${size}`;

  // category와 search 값이 있을 경우, URL에 쿼리 파라미터로 추가
  if (category) {
    url += `&category=${category}`;
  }
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  // 정렬 파라미터 추가
  if (sortBy) {
    url += `&sort=${sortBy}`;
  }

  // GET 요청 보내기
  const response = await axios.get(url);

  // 예외 처리
  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGetPagedGoods 예외발생");
  }

  return response.data;
}

// 재고가 있는 상품 목록
export async function fetchGetAllInStockGoods() {
  const response = await axios.get(
    `http://localhost:8090/app/shop/findAllInStockGoods`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGetDiscountedGoods 예외발생");
  }

  return response.data;
}

// 재고가 있으면서 할인 중인 상품 목록
export async function fetchGetDiscountedGoods() {
  const response = await axios.get(
    `http://localhost:8090/app/shop/isDiscountedList`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGetDiscountedGoods 예외발생");
  }

  return response.data;
}
