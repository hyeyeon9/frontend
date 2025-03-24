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
