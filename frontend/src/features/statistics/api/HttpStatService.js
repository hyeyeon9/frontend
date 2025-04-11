// HttpStatisticsService.js

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8090/app/statistics",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${accessToken}`,
  },
});

// 일간 시간대별 매출 데이터
export async function fetchGetHourlySales(date) {
  const response = await instance.get(`/salesHourlyTotal/${date}`);
  return response;
}

// 월간 일일 판매액과 판매량 데이터
export async function fetchGetDailySales(month) {
  const response = await instance.get(`/salesDailyTotal/${month}`);
  return response;
}

// 연간 월별 판매액과 판매량 데이터
export async function fetchGetMonthlySales(year) {
  const response = await instance.get(`/salesMonthlyTotal/${year}`);
  return response;
}

// 일간 카테고리 대분류별 매출 데이터
export async function fetchGetDailyCategory(date) {
  const response = await instance.get(`/salesDailyCategory/${date}`);
  return response;
}

// 일간 카테고리 소분류별 매출 데이터
export async function fetchGetDailySubCategory(date, category) {
  const response = await instance.get(
    `/salesDailyCategory/${date}/${category}`
  );
  return response;
}

// 월간 카테고리 대분류별 매출 데이터
export async function fetchGetMonthlyCategory(month) {
  const response = await instance.get(`/salesMonthlyCategory/${month}`);
  return response;
}

// 월간 카테고리 소분류별 매출 데이터
export async function fetchGetMonthlySubCategory(month, category) {
  const response = await instance.get(
    `/salesMonthlyCategory/${month}/${category}`
  );
  return response;
}

// 연간 카테고리 대분류별 매출 데이터
export async function fetchGetYearlyCategory(year) {
  const response = await instance.get(`/salesYearlyCategory/${year}`);
  return response;
}

// 연간 카테고리 소분류별 매출 데이터
export async function fetchGetYearlySubCategory(year, category) {
  const response = await instance.get(
    `/salesYearlyCategory/${year}/${category}`
  );
  return response;
}

// 주어진 날짜 사이의 시간별 평균 매출 데이터
export async function fetchGetAverageSales(startDate, endDate) {
  const response = await instance.get(
    `/salesHourlyAverage/${startDate}/${endDate}`
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
  const response = await axios.get(
    `http://localhost:8090/app/salesHistory/findByDate`,
    {
      params: {
        date,
        page,
        size,
        paymentStatus,
      },
    }
  );
  return response.data;
}

export async function fetchGetDetailHistroy(orderId) {
  const response = await axios.get(
    `http://localhost:8090/app/salesHistory/receipt/${orderId}`
  );
  return response.data;
}
