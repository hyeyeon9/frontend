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

export async function fetchGetSales(date) {
  const response = await instance.get(`/salesHourly/${date}`);
  return response;
}
