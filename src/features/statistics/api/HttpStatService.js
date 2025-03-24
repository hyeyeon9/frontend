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

// 일간 시간대별, 카테고리별 매출 데이터
export async function fetchGetDailyCategory(date) {
  const response = await instance.get(`/salesDaily/${date}`);
  return response;
}

// 월간 일일, 카테고리별 매출 데이터
export async function fetchGetMonthlyCategory(month) {
  const response = await instance.get(`/salesMonthly/${month}`);
  return response;
}

// 연간 월별, 카테고리별 매출 데이터
export async function fetchGetYearlyCategory(year) {
  const response = await instance.get(`/salesYearly/${year}`);
  return response;
}
