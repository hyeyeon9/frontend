import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
      const response = await fetch(
        "http://localhost:8090/app/payment/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        // 결제 실패 비즈니스 로직을 구현하세요.
        navigate(`payment/fail?message=${json.message}&code=${json.code}`);
        return;
      }

      // ✅ 메인 창에 메시지 보내기
      if (window.opener) {
        // ✅ 성공 여부 저장
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
        window.close(); // 결제창 닫기
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
