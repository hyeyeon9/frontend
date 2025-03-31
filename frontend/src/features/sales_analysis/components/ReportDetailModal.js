import { X, ArrowLeft } from "lucide-react";
import ProductComparisonView from "./ProductComparisonView";

export default function ReportDetailModal({
  selectedAlert,
  comment,
  setComment,
  showProductDetails,
  toggleProductDetails,
  closeModal,
  handleUpdateComment,
  trendMapping,
}) {
  // 날짜 포맷 변환 및 7일 전 날짜 계산 함수
  const getPreviousDate = (dateString) => {
    const date = new Date(dateString); // "2025-03-31" -> Date 객체로 변환
    date.setDate(date.getDate() - 7); // 7일 빼기
    // yyyy-MM-dd 형식으로 날짜 포맷
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더함
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // 형식: "2025-03-24"
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-xl shadow-sm p-6 w-full ${
          showProductDetails ? "max-w-5xl" : "max-w-md"
        } transition-all duration-300 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {showProductDetails && (
              <button
                onClick={toggleProductDetails}
                className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-800">
              {showProductDetails
                ? "시간대별 상품 판매 비교"
                : "이상매출 기록 상세조회"}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showProductDetails ? (
          // 상품 상세 비교 뷰
          <ProductComparisonView
            selectedAlert={selectedAlert}
            comment={comment}
            setComment={setComment}
            closeModal={closeModal}
            handleUpdateComment={handleUpdateComment}
            getPreviousDate={getPreviousDate}
          />
        ) : (
          // 기본 상세 조회 뷰
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-base text-gray-500 mb-1">날짜 / 시간</p>
                <p className="text-base font-medium">
                  {selectedAlert.alertDate} {selectedAlert.alertHour}시
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500 mb-1">트렌드 기준</p>
                <p className="text-base font-medium">
                  {trendMapping[selectedAlert.trendBasis] || "-"}
                </p>
              </div>
            </div>

            {/* 매출량 비교 섹션 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-base font-medium text-gray-700 mb-2">
                매출량 비교
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">이전 매출</p>
                  <p className="text-base font-medium">
                    {Number(selectedAlert.previousSales).toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">현재 매출</p>
                  <p className="text-base font-semibold text-indigo-600">
                    {Number(selectedAlert.currentSales).toLocaleString()}원
                  </p>
                </div>

                <div className="col-span-2">
                  <div className="flex flex-row items-center gap-3">
                    <p className="text-sm text-gray-500 mb-1">변화량</p>
                    {selectedAlert.difference > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        +{Number(selectedAlert.difference).toLocaleString()}원
                        증가 (
                        {Math.round(
                          (selectedAlert.difference /
                            selectedAlert.previousSales) *
                            100
                        )}
                        %)
                      </span>
                    ) : selectedAlert.difference < 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {Number(selectedAlert.difference).toLocaleString()}원
                        감소 (
                        {Math.round(
                          (selectedAlert.difference /
                            selectedAlert.previousSales) *
                            100
                        )}
                        %)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        변화 없음
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">알림 메시지</p>
              <div className="inline-block max-w-full">
                <div className="px-2.5 py-0.5 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 overflow-hidden">
                  <span className="whitespace-pre-wrap break-words">
                    {selectedAlert.alertMessage}
                  </span>
                </div>
              </div>
            </div>

            {/* 요일 비교일 경우에만 상품 조회 버튼 표시 */}
            {selectedAlert.trendBasis === 1 && (
              <div className="mb-4">
                <button
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center text-base"
                  onClick={toggleProductDetails}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  해당 시간대 상품 상세 조회
                </button>
              </div>
            )}

            <label className="block text-base font-medium text-gray-700 mb-2">
              코멘트
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical text-base"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base"
                onClick={closeModal}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base"
                onClick={handleUpdateComment}
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
