// HttpSalesAnalysisService.js

import axiosInstance from "../../../utils/axios";

// 특정 날짜의 이상치 알림기록 조회
export async function fetchGetAlertListByDate(date) {
  const response = await axiosInstance.get(
    `/salesAlert/searchList/byDate/${date}`
  );
  return response;
}

// 특정 기간의 이상치 알림기록 조회
export async function fetchGetAlertListByDateBetween(date1, date2) {
  const response = await axiosInstance.get(
    `/salesAlert/searchList/byDate/${date1}/${date2}`
  );
  return response;
}

// 특정 날짜의 트렌드 기반 알림기록 조회
export async function fetchGetAlertListByTrend(date, trendBasis) {
  const response = await axiosInstance.get(
    `/salesAlert/searchList/byTrend/${date}/${trendBasis}`
  );
  return response;
}

// 유저가 작성한 코멘트를 수정/등록
export async function fetchUpdateComment(alertId, userComment) {
  try {
    const response = await axiosInstance.put("/salesAlert/updateComment", {
      alertId,
      userComment,
    });

    return response.data; // 서버에서 메시지 반환
  } catch (error) {
    console.error("코멘트 수정 요청 실패:", error);
    throw new Error("코멘트 수정 요청이 실패했습니다.");
  }
}

// 이상치 기록 삭제
export async function fetchDeleteAlert(alertId) {
  try {
    const response = await axiosInstance.delete(
      `/salesAlert/deleteAlert/${alertId}`
    );

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
  const response = await axiosInstance.get(
    `/salesAlert/salesRecordHourly/${salesDate}/${salesHour}`
  );
  return response;
}
