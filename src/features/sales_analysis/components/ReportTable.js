import { Button, Table, Textarea } from "flowbite-react";
import { useState } from "react";
import { fetchUpdateComment } from "../api/HttpSalesAnalysisService";

export default function ReportTable({ salesData }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [comment, setComment] = useState("");

  // 모달 열기
  const openModal = (alert) => {
    setSelectedAlert(alert);
    setComment(alert.userComment || ""); // 기존 코멘트 불러오기
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedAlert(null);
    setComment("");
  };

  // 코멘트 업데이트 API 호출
  const handleUpdateComment = async () => {
    if (!selectedAlert) return;

    try {
      await fetchUpdateComment(selectedAlert.alertId, comment);

      // salesData에서 해당 alert의 userComment 업데이트
      selectedAlert.userComment = comment;

      closeModal();
    } catch (error) {
      console.error("코멘트 수정 실패:", error);
    }
  };

  return (
    <>
      <Table className="w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2">날짜</th>
            <th className="px-4 py-2">이전 매출</th>
            <th className="px-4 py-2">현재 매출</th>
            <th className="px-4 py-2">차이</th>
            <th className="px-4 py-2">알림</th>
            <th className="px-4 py-2">코멘트</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((alert, index) => (
            <tr
              key={index}
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => openModal(alert)}
            >
              <td className="px-4 py-2">
                {alert.alertDate} {alert.alertHour}시
              </td>
              <td className="px-4 py-2">{alert.previousSales}</td>
              <td className="px-4 py-2">{alert.currentSales}</td>
              <td className="px-4 py-2">{alert.difference}</td>
              <td className="px-4 py-2">{alert.alertMessage}</td>
              <td className="px-4 py-2">{alert.userComment}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* 모달 */}
      {selectedAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-2">코멘트 수정</h2>
            <Textarea
              className="w-full border p-2 rounded"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={closeModal}
              >
                취소
              </Button>
              <Button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleUpdateComment}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
