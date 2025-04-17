// HttpStatisticsService.js
import axiosInstance from "../../../utils/axios";

// 일간 시간대별 매출 데이터
export async function fetchGetHourlySales(date) {
  const response = await axiosInstance.get(
    `/statistics/salesHourlyTotal/${date}`
  );
  return response;
}

// 월간 일일 판매액과 판매량 데이터
export async function fetchGetDailySales(month) {
  const response = await axiosInstance.get(
    `/statistics/salesDailyTotal/${month}`
  );
  return response;
}

// 연간 월별 판매액과 판매량 데이터
export async function fetchGetMonthlySales(year) {
  const response = await axiosInstance.get(
    `/statistics/salesMonthlyTotal/${year}`
  );
  return response;
}

// 일간 카테고리 대분류별 매출 데이터
export async function fetchGetDailyCategory(date) {
  const response = await axiosInstance.get(
    `/statistics/salesDailyCategory/${date}`
  );
  return response;
}

// 일간 카테고리 소분류별 매출 데이터
export async function fetchGetDailySubCategory(date, category) {
  const response = await axiosInstance.get(
    `/statistics/salesDailyCategory/${date}/${category}`
  );
  return response;
}

// 월간 카테고리 대분류별 매출 데이터
export async function fetchGetMonthlyCategory(month) {
  const response = await axiosInstance.get(
    `/statistics/salesMonthlyCategory/${month}`
  );
  return response;
}

// 월간 카테고리 소분류별 매출 데이터
export async function fetchGetMonthlySubCategory(month, category) {
  const response = await axiosInstance.get(
    `/statistics/salesMonthlyCategory/${month}/${category}`
  );
  return response;
}

// 연간 카테고리 대분류별 매출 데이터
export async function fetchGetYearlyCategory(year) {
  const response = await axiosInstance.get(
    `/statistics/salesYearlyCategory/${year}`
  );
  return response;
}

// 연간 카테고리 소분류별 매출 데이터
export async function fetchGetYearlySubCategory(year, category) {
  const response = await axiosInstance.get(
    `/statistics/salesYearlyCategory/${year}/${category}`
  );
  return response;
}

// 주어진 날짜 사이의 시간별 평균 매출 데이터
export async function fetchGetAverageSales(startDate, endDate) {
  const response = await axiosInstance.get(
    `/statistics/salesHourlyAverage/${startDate}/${endDate}`
  );
  return response;
}

// 주어진 날짜의 판매 기록 가져오기 - 판매시간 역순, 페이징 처리
export async function fetchGetSalesHistory(
  date,
  page = 0,
  size = 20,
  paymentStatus = 1
) {
  const response = await axiosInstance.get(`/salesHistory/findByDate`, {
    params: {
      date,
      page,
      size,
      paymentStatus,
    },
  });
  return response.data;
}

export async function fetchGetDetailHistroy(orderId) {
  const response = await axiosInstance.get(`/salesHistory/receipt/${orderId}`);
  return response.data;
}
