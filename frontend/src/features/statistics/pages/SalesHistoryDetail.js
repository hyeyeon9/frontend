import {
  ReceiptText,
  Calendar,
  Clock,
  User,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

export default function SalesHistoryDetail({ sale }) {
  if (!sale) return null;

  // 총 상품 수량 계산
  const totalQuantity = sale.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="bg-white p-4 rounded-lg">
      {/* 영수증 헤더 */}
      <div className="text-center mb-6 border-b pb-4">
        <div className="flex justify-center mb-2">
          <ReceiptText className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold">판매 영수증</h2>
        <p className="text-gray-500 text-sm">
          영수증 번호: #{sale.id.toString().padStart(6, "0")}
        </p>
      </div>

      {/* 판매 정보 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">날짜:</span>
          <span className="ml-2 text-sm">{sale.date}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Clock className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">시간:</span>
          <span className="ml-2 text-sm">{sale.time}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <User className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">고객:</span>
          <span className="ml-2 text-sm">{sale.customer}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <CreditCard className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">결제 방법:</span>
          <span className="ml-2 text-sm">{sale.paymentMethod}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <ShoppingBag className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium">총 상품:</span>
          <span className="ml-2 text-sm">{totalQuantity}개 항목</span>
        </div>
      </div>

      {/* 구매 상품 목록 */}
      <div className="border-t border-b py-4 mb-4">
        <h3 className="font-medium mb-3">구매 상품</h3>
        <div className="space-y-2">
          {sale.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div>
                <span>{item.name}</span>
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              </div>
              <div className="font-medium">
                {(item.price * item.quantity).toLocaleString()}원
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 합계 */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-bold">총 결제금액</span>
        <span className="text-xl font-bold text-indigo-600">
          {sale.total.toLocaleString()}원
        </span>
      </div>

      {/* 영수증 푸터 */}
      <div className="text-center text-gray-500 text-xs mt-6 pt-4 border-t">
        <p>감사합니다. 다음에 또 방문해 주세요!</p>
        <p className="mt-1">문의사항: 02-123-4567</p>
      </div>
    </div>
  );
}
