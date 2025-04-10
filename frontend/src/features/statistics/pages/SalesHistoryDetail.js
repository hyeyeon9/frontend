import { ReceiptText, Calendar, CreditCard, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGetDetailHistroy } from "../api/HttpStatService";

export default function SalesHistoryDetail({ ordersId }) {
  const [dataList, setDataList] = useState({});
  const [loading, setLoading] = useState(false);

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

  // 데이터 가져오기
  useEffect(() => {
    if (!ordersId) return null;
    const getReceiptList = async () => {
      setLoading(true);
      try {
        const response = await fetchGetDetailHistroy(ordersId);
        setDataList(response);
      } catch (error) {
        console.error("결제 내역을 불러오는 중 오류 발생", error);
        setDataList({});
      } finally {
        setLoading(false);
      }
    };

    getReceiptList();
  }, [ordersId]);

  if (loading) {
    // 로딩 중 표시
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 데이터가 없거나 비어있는 경우 처리
  if (!dataList || Object.keys(dataList).length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <ReceiptText className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-center">영수증 데이터를 찾을 수 없습니다.</p>
        <p className="text-sm mt-2">판매 완료 상태의 기록을 선택해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      {/* 영수증 헤더 */}
      <div className="text-center mb-6 border-b pb-4">
        <div className="flex justify-center mb-2">
          <ReceiptText className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold">판매 영수증</h2>
        <p className="text-gray-500 text-sm">영수증 번호: #{ordersId}</p>
      </div>

      {/* 판매 정보 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">판매일시:</span>
          <span className="ml-2 text-sm">
            {formatDateTime(dataList.saleDate)}
          </span>
        </div>
        <div className="flex items-center text-gray-700">
          <CreditCard className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">결제 방법:</span>
          <span className="ml-2 text-sm">{dataList.paymentMethod}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <ShoppingBag className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">총 상품:</span>
          <span className="ml-2 text-sm">
            {dataList.items?.length || 0}개 항목
          </span>
        </div>
      </div>

      {/* 구매 상품 목록 */}
      <div className="border-t border-b py-4 mb-4">
        <h3 className="font-medium mb-3">구매 상품</h3>
        <div className="space-y-2">
          {Array.isArray(dataList.items) &&
            dataList.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div>
                  <span>{item.goodsName}</span>
                  <span className="text-gray-500 ml-2">x{item.saleAmount}</span>
                </div>
                <div className="font-medium">
                  {Number(item.salePrice * item.saleAmount).toLocaleString()}원
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 합계 */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-bold">총 결제금액</span>
        <span className="text-xl font-bold text-indigo-600">
          {Number(dataList.totalPrice).toLocaleString()}원
        </span>
      </div>

      {/* 영수증 푸터 */}
      <div className="text-center text-gray-500 text-xs mt-6 pt-4 border-t">
        <p>Daily24</p>
        <p className="mt-1">문의사항: 010-4311-5966</p>
      </div>
    </div>
  );
}
