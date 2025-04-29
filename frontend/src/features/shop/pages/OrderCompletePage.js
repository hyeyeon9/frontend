import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "flowbite-react";
import confetti from "canvas-confetti";

export default function OrderCompletePage() {
  const [showAnimation, setShowAnimation] = useState(false);

  // 컴포넌트가 마운트되면 체크 아이콘 애니메이션 시작
  useEffect(() => {
    setShowAnimation(true);

    // 결제 완료 시 confetti 효과
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(confettiInterval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // 왼쪽에서 발사
      confetti({
        particleCount: Math.floor(randomInRange(10, 30)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 0.2, y: 0.5 },
        colors: ["#1E40AF", "#3B82F6", "#93C5FD", "#DBEAFE"],
      });

      // 오른쪽에서 발사
      confetti({
        particleCount: Math.floor(randomInRange(10, 30)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 0.8, y: 0.5 },
        colors: ["#047857", "#10B981", "#6EE7B7", "#D1FAE5"],
      });
    }, 250);

    return () => clearInterval(confettiInterval);
  }, []);

  return (
    <div className="max-w-[430px] mx-auto min-h-screen flex flex-col justify-center items-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div
            className={`relative inline-flex rounded-full bg-green-100 p-4 transition-all duration-500 ${
              showAnimation ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          결제가 완료되었습니다!
        </h1>
        <p className="text-gray-600 mb-6">
          주문이 성공적으로 처리되었습니다.<br></br> 즐거운 하루 되세요.
        </p>

        {/* <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-blue-700 font-medium mb-2">
            <ShoppingBag className="h-5 w-5 mr-2" />
            <span>주문 정보</span>
          </div>
          <p className="text-sm text-blue-600">
            주문번호:{" "}
            <span className="font-semibold">
              #
              {Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0")}
            </span>
          </p>
          <p className="text-sm text-blue-600">
            주문일시: <span className="font-semibold">{new Date().toLocaleString("ko-KR")}</span>
          </p>
        </div> */}

        <div className="flex flex-col gap-3">
          <Button
            as={Link}
            to="/shop"
            color="blue"
            size="lg"
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Button>
          <Button
            as={Link}
            to="/shop/products"
            color="light"
            size="lg"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            쇼핑 계속하기
          </Button>
        </div>
      </div>

      {/* <div className="mt-6 text-center text-gray-500 text-sm">
        <p>문의사항이 있으시면 고객센터로 연락해주세요.</p>
        <p className="font-medium">고객센터: 1588-0000</p>
      </div> */}
    </div>
  );
}
