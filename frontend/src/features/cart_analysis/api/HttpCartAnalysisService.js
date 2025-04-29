import axiosInstance from "../../../utils/axios";

// 5. 장바구니 분석 (findAll)
export async function fetchAllAssociationRules(period, month) {
  //console.log("period", period); // 전체, 2024, 2025
  //console.log("month", month);  // 전체, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12

  const params = {};
  if (period !== "all") params.period = period;
  if (month !== "all") params.month = month;

  try {
    const response = await axiosInstance.get("/association", { params });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("예외발생", error);
    throw new Error("fetchAllAssociationRules 예외발생");
  }
}

// 6. 장바구니 분석 (시간대별)
export async function fetchAllAssociationTimeRules() {
  const response = await axiosInstance.get("/association/time");

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationTimeRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}

//
export async function fetchWeekSales(categoryId, subCategoryId) {
  const response = await axiosInstance.get(
    `/statistics/sales/week?categoryId=${categoryId}&subCategoryId=${subCategoryId}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchWeekSales 예외발생");
  }

  console.log(response.data);
  return response.data;
}
