import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"; // 테스트용 클라이언트 키
const customerKey = "mC_buQ9sOszT7frxgs4D_"; // 테스트용 커스터머 키

export function CheckoutPage() {
  const [searchParams] = useSearchParams(); // 쿼리 스트링 방식
  const queryOrderId = searchParams.get("orderId");
  const queryAmount = Number(searchParams.get("amount"));
  const orderSummary = searchParams.get("orderSummary");

  const [amount, setAmount] = useState({
    currency: "KRW",
    value: queryAmount,
  });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      // ------  결제위젯 초기화 ------
      const tossPayments = await loadTossPayments(clientKey);
      // 회원 결제
      //   const widgets = tossPayments.widgets({
      //     customerKey,
      //   });
      // 비회원 결제
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }
      // ------ 주문의 결제 금액 설정 ------
      await widgets.setAmount(amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // ------  이용약관 UI 렌더링 ------
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  useEffect(() => {
    if (widgets == null) {
      return;
    }

    widgets.setAmount(amount);
  }, [widgets, amount]);

  return (
    <div className="flex flex-col items-center overflow-auto">
      <div className="max-w-[540px] w-full bg-white shadow-md rounded-lg p-6">
        {/* 결제 UI */}
        <div id="payment-method" />
        {/* 이용약관 UI */}
        <div id="agreement" />
        {/* 결제하기 버튼 */}
        <Button
          className={`w-full px-[22px] py-[11px] border-none rounded-lg 
            font-semibold text-[17px] cursor-pointer transition 
            ${
              !ready || isProcessing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }
          `}
          disabled={!ready || isProcessing} // 결제 요청 중일 때 버튼 비활성화
          onClick={async () => {
            try {
              await widgets.requestPayment({
                orderId: queryOrderId,
                orderName: orderSummary,
                successUrl: window.location.origin + "/payment/success",
                failUrl: window.location.origin + "/payment/fail",
                customerEmail: "star970909@gmail.com",
                customerName: "비회원",
                customerMobilePhone: "01043115966",
              });
            } catch (error) {
              // 에러 처리하기
              console.error(error);
            }
          }}
        >
          결제하기
        </Button>
      </div>
    </div>
  );
}
