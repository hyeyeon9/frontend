import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../../utils/axios";

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
    // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    async function confirm() {
      try {
        const response = await axiosInstance.post(
          "/payment/confirm",
          requestData
        );

        // 성공 처리
        if (window.opener) {
          const prev = JSON.parse(
            window.opener.localStorage.getItem("pendingPayment")
          );
          if (prev && prev.id === requestData.orderId) {
            window.opener.localStorage.setItem(
              "pendingPayment",
              JSON.stringify({ ...prev, status: "success" })
            );
          }

          window.opener.postMessage({ type: "PAYMENT_SUCCESS" }, "*");
          window.close();
        }
      } catch (error) {
        const json = error.response?.data || {};
        navigate(
          `payment/fail?message=${json.message ?? "알 수 없는 오류"}&code=${
            json.code ?? "UNKNOWN"
          }`
        );
      }
    }

    confirm();
  }, []);

  return (
    <div className="flex flex-col items-center p-6 overflow-auto">
      <div className="max-w-[540px] w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">결제 성공</h2>
        <p className="text-lg text-gray-700">{`주문번호: ${searchParams.get(
          "orderId"
        )}`}</p>
        <p className="text-lg text-gray-700">{`결제 금액: ${Number(
          searchParams.get("amount")
        ).toLocaleString()}원`}</p>
        <p className="text-lg text-gray-700">{`paymentKey: ${searchParams.get(
          "paymentKey"
        )}`}</p>
      </div>
    </div>
  );
}
