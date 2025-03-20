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
export async function fetchGetDailySales(date) {
  const response = await instance.get(`/salesHourlyTotal/${date}`);
  return response;
}

// 월간 판매액과 판매량 데이터
export async function fetchGetMonthlySales(month) {
  const response = await instance.get(`/salesDailyTotal/${month}`);
  return response;
}

// 일 단위의 시간대별, 카테고리별 매출 데이터
export async function fetchGetDailyCategory(date) {
  const response = await instance.get(`/salesDaily/${date}`);
  return response;
}

// 월 단위의 시간대별, 카테고리별 매출 데이터
export async function fetchGetMontlyCategory(month) {
  const response = await instance.get(`/salesMonthly/${month}`);
  return response;
}

// 연 단위의 시간대별, 카테고리별 매출 데이터
export async function fetchGetYearlyCategory(year) {
  const response = await instance.get(`/salesYearly/${year}`);
  return response;
}
