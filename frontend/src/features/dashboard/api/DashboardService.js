import axiosInstance from "../../../utils/axios";

// 현재 시각의 방문자 수 = 판매 기록의 개수
export async function fetchGetTodayVisitors() {
  const response = await axiosInstance.get(`/dashboard/visitors`);
  return response;
}

// 현재 시각까지의 누적 판매액과 전일과의 비교 수치
export async function fetchGetTodaySales() {
  const response = await axiosInstance.get(`/dashboard/salesAndDiff`);
  return response;
}
