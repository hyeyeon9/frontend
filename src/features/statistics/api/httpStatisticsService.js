// httpStatisticsService.js

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8090/app/statistics",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${accessToken}`,
  },
});

// 일 단위의 시간대별 매출 데이터
export async function fetchGetSales(date) {
  const response = await instance.get(`/salesHourly/${date}`);
  return response;
}

// 일 단위의 시간대별, 카테고리별 매출 데이터
export async function fetchGetDaily(date) {
  const response = await instance.get(`/salesDaily/${date}`);
  return response;
}

// 월 단위의 시간대별, 카테고리별 매출 데이터
export async function getchGetMontly(month) {
  const response = await instance.get(`/salesMonthly/${month}`);
  return response;
}

// 연 단위의 시간대별, 카테괼별 매출 데이터
export async function fetchGetYearly(year) {
  const response = await instance.get(`/salesYearly/${year}`);
  return response;
}
