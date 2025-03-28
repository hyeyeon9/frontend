// HttpSalesAnalysisService.js

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8090/app/salesAlert",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${accessToken}`,
  },
});

// 특정 날짜의 이상치 알림기록 조회
export async function fetchGetAlertListByDate(date) {
  const response = await instance.get(`/searchList/byDate/${date}`);
  return response;
}

// 특정 기간의 이상치 알림기록 조회
export async function fetchGetAlertListByDateBetween(date1, date2) {
  const response = await instance.get(`/searchList/byDate/${date1}/${date2}`);
  return response;
}

// 특정 날짜의 트렌드 기반 알림기록 조회
export async function fetchGetAlertListByTrend(date, trendBasis) {
  const response = await instance.get(
    `/searchList/byTrend/${date}/${trendBasis}`
  );
  return response;
}

// 유저가 작성한 코멘트를 수정/등록
export async function fetchUpdateComment(alertId, userComment) {
  const response = await fetch(
    "http://localhost:8090/app/salesAlert/updateComment",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        alertId: alertId,
        userComment: userComment,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("코멘트 수정 요청이 실패했습니다.");
  }

  return await response.text(); // 서버에서 메시지 반환
}

// 이상치 기록 삭제
export async function fetchDeleteAlert(alertId) {
  try {
    const response = await instance.delete(`/deleteAlert/${alertId}`);

    if (response.status === 204) {
      console.log("정상적으로 삭제되었습니다.");
      return "삭제되었습니다.";
    }
  } catch (error) {
    console.error("삭제 실패: ", error.response?.data || error.message);
    throw new Error("삭제에 실패했습니다.");
  }
}

// 해당하는 날짜와 시간대의 매출 기록 조회
export async function fetchGetDailySalesByDateAndHour(salesDate, salesHour) {
  const response = await instance.get(`/salesHourly/${salesDate}/${salesHour}`);
  return response;
}
