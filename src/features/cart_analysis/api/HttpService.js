import axios from "axios";

// 1. 전체 상품 목록 가져오기
export async function fetchGoodsList() {
  const response = await axios.get(
    `http://localhost:8090/app/categories/findAll`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchUserList 예외발생");
  }

  return response.data;
}

// 2. 선택한 상품 정보 가져오기
export async function fetchGoodsDetail(id) {
  const response = await axios.get(
    `http://localhost:8090/app/goods/findById/${id}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGoodsDetail 예외발생");
  }

  return response.data;
}

// 3. 카테고리별 정렬 (대분류)
export async function fetchGoodsByCategory(firstname) {
  const response = await axios.get(
    `http://localhost:8090/app/categories/${firstname}`
  );

  console.log(response);
  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGoodsByCategory 예외발생");
  }

  return response.data;
}

// 4. 카테고리별 정렬 (소분류)
export async function fetchGoodsBySubCategory(firstname, secondName) {
  const response = await axios.get(
    `http://localhost:8090/app/categories/${firstname}/${secondName}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGoodsBySubCategory 예외발생");
  }

  console.log(response.data);
  return response.data;
}

// 5. 장바구니 분석 (findAll)
export async function fetchAllAssociationRules() {
  const response = await axios.get("http://localhost:8090/app/association");

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}

// 6. 장바구니 분석 (시간대별)
export async function fetchAllAssociationTimeRules() {
  const response = await axios.get("http://localhost:8090/app/association/time");

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationTimeRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}

