import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8090/app/dashboard",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${accessToken}`,
  },
});

// 현재 시각의 방문자 수 = 판매 기록의 개수
export async function fetchGetTodayVisitors(now) {
  const response = await instance.get(`/visitors/${now}`);
  return response;
}

// 현재 시각까지의 누적 판매액
export async function fetchGetTodaySales(now) {
  const response = await instance.get(`/sales/${now}`);
  return response;
}
