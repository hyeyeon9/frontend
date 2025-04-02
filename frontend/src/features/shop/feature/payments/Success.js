import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

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
        const response = await fetch("http://localhost:8090/app/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        const json = await response.json();

        if (!response.ok) {
          setErrorMessage(json.message);
          setTimeout(() => {
            navigate(`/payment/fail?message=${json.message}&code=${json.code}`);
          }, 2000); // 2초 후 실패 페이지로 이동
          return;
        }
      } catch (error) {
        setErrorMessage("서버 오류가 발생했습니다.");
        setTimeout(() => {
          navigate(`/payment/fail?message=서버 오류&code=500`);
        }, 2000);
      } finally {
        setLoading(false);
      }
    }

    confirm();
  }, []);

  if (loading) {
    return (
      <div className="result wrapper">
        <h2>결제 확인 중...</h2>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="result wrapper">
        <div className="box_section">
          <h2>결제 실패</h2>
          <p>{`사유: ${errorMessage}`}</p>
          <p>잠시 후 실패 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result wrapper">
      <div className="box_section">
        <h2>결제 성공</h2>
        <p>{`주문번호: ${searchParams.get("orderId")}`}</p>
        <p>{`결제 금액: ${Number(
          searchParams.get("amount")
        ).toLocaleString()}원`}</p>
        <p>{`paymentKey: ${searchParams.get("paymentKey")}`}</p>
      </div>
    </div>
  );
}
