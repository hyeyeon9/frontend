import { ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import CustomDatePicker from "../../../components/CustomDatePicker";
import { fetchGetSalesHistory } from "../api/HttpStatService";
import SalesHistoryDetail from "./SalesHistoryDetail";

// 날짜 포매팅 함수
function formatDateTo(date) {
  const nativeDate = date instanceof Date ? date : new Date(date);
  const year = nativeDate.getFullYear();
  const month = String(nativeDate.getMonth() + 1).padStart(2, "0");
  const day = String(nativeDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 날짜 및 시간 포매팅 함수
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 결제 상태 정보
const PAYMENT_STATUS = {
  CANCELED: 0, // 결제 취소
  COMPLETED: 1, // 결제 완료
};

// 결제 상태에 따른 스타일 및 텍스트
const getPaymentStatusInfo = (status) => {
  switch (status) {
    case "COMPLETED":
      return {
        text: "결제완료",
        className: "bg-green-100 text-green-800",
      };
    case "CANCELED":
      return {
        text: "결제취소",
        className: "bg-red-100 text-red-800",
      };
    default:
      return {
        text: "알 수 없음",
        className: "bg-gray-100 text-gray-800",
      };
  }
};

export default function SalesHistory() {
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(
    formatDateTo(selectedDate)
  );
  const [dataList, setDataList] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10); // 행: 기본 10개
  const [paymentStatus, setPaymentStatus] = useState(-1); // 기본: 모든 상태 (-1은 모든 상태를 의미)

  // 데이터 가져오기
  useEffect(() => {
    const getReceiptList = async () => {
      setLoading(true);
      try {
        const pageNumber = currentPage - 1;
        // paymentStatus가 -1이면 모든 상태를 조회하도록 null 전달
        const statusParam = paymentStatus === -1 ? null : paymentStatus;
        const response = await fetchGetSalesHistory(
          formattedDate,
          pageNumber,
          pageSize,
          statusParam
        );

        console.log(response);

        // 응답 데이터 처리
        setDataList(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } catch (error) {
        console.error("결제 내역을 불러오는 중 오류 발생", error);
      } finally {
        setLoading(false);
      }
    };

    getReceiptList(formattedDate);
  }, [formattedDate, currentPage, pageSize, paymentStatus]);

  const handleRowClick = (orderId) => {
    setSelectedSale(orderId);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setFormattedDate(formatDateTo(selectedDate));
  }, [selectedDate]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 페이지 제목 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <ReceiptText className="h-5 w-5 mr-2 text-indigo-600" />
              판매기록 조회
            </h1>
          </div>

          {/* 필터 영역 - 한 줄에 배치 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 날짜 선택 */}
            <div className="">
              <CustomDatePicker
                selectedDate={selectedDate}
                onChange={setSelectedDate}
                label="조회 날짜"
              />
            </div>

            {/* 결제 상태 선택 */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 상태 필터링
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={-1}>모든 상태</option>
                <option value={PAYMENT_STATUS.COMPLETED}>결제 완료</option>

                <option value={PAYMENT_STATUS.CANCELED}>결제 취소</option>
              </select>
            </div>

            {/* 페이지 사이즈 선택 */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표시할 행 개수
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={10}>10개씩 보기</option>
                <option value={15}>15개씩 보기</option>
                <option value={20}>20개씩 보기</option>
                <option value={30}>30개씩 보기</option>
              </select>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 - 60% 테이블, 40% 상세 정보 */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* 판매 기록 테이블 (60%) */}
          <div className="bg-white rounded-xl shadow-sm p-4  md:w-3/5">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      날짜/시간
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      판매요약
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      판매액
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      결제상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : dataList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        조회된 판매 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    dataList.map((sale) => {
                      const statusInfo = getPaymentStatusInfo(
                        sale.paymentStatus
                      );
                      return (
                        <tr
                          key={sale.ordersId}
                          onClick={() => handleRowClick(sale.ordersId)}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedSale === sale.ordersId ? "bg-indigo-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(sale.ordersDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {sale.orderSummary}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {Number(sale.finalPrice).toLocaleString()}원
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${statusInfo.className}`}
                            >
                              {statusInfo.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <nav className="flex items-center">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    처음
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    이전
                  </button>
                  <div className="mx-2 text-sm text-gray-700">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    다음
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    마지막
                  </button>
                </nav>
              </div>
            )}

            {/* 총 항목 수 표시 */}
            <div className="mt-2 text-sm text-gray-500 text-right">
              총 {totalElements}개 항목
            </div>
          </div>

          {/* 판매 상세 정보 (40%) */}
          <div className="bg-white rounded-xl shadow-sm p-4 w-full md:w-2/5">
            {selectedSale ? (
              <SalesHistoryDetail ordersId={selectedSale} />
            ) : (
              <div className="h-full text-sm flex items-center justify-center text-gray-500">
                <p>판매 기록을 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
