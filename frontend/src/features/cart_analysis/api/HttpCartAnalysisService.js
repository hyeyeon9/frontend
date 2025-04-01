import axios from "axios";

// 5. 장바구니 분석 (findAll)
export async function fetchAllAssociationRules(period, month) {
  //console.log("period", period); // 전체, 2024, 2025
  //console.log("month", month);  // 전체, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12

  let url = "http://localhost:8090/app/association";

  if(period !== "all" && month !== "all") {
    url += `?period=${period}&month=${month}`
  }else if(period !== "all"){
    url += `?period=${period}`
  }else if(month !== "all"){
    url += `?month=${month}`
  }


  const response = await axios.get(url);

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}

// 6. 장바구니 분석 (시간대별)
export async function fetchAllAssociationTimeRules() {
  const response = await axios.get(
    "http://localhost:8090/app/association/time"
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationTimeRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}

// 
export async function fetchWeekSales(categoryId,subCategoryId) {
  const response = await axios.get(
    `http://localhost:8090/app/statistics/sales/week?categoryId=${categoryId}&subCategoryId=${subCategoryId}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchWeekSales 예외발생");
  }

  console.log(response.data);
  return response.data;
}