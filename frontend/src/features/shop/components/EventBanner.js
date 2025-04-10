import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function EventBanner() {
  const navigate = useNavigate();

  // 할인 이벤트 배너 정보
  const banner = {
    id: 1,
    title: "4월 할인 이벤트",
    description: "봄맞이 특별 할인 최대 50%",
    bgColor: "from-blue-500 to-indigo-600",
    buttonText: "할인 상품 보기",
  };

  // 할인 상품 페이지로 이동하는 함수
  const handleViewDiscountedProducts = () => {
    navigate("/shop/discounting");
  };

  return (
    <div className="mb-4">
      <div className="h-44 sm:rounded-lg overflow-hidden">
        {/* 4월 할인 이벤트 배너 */}
        <div
          className={`relative  flex h-full items-center justify-center bg-gradient-to-r ${banner.bgColor}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full absolute">
              {/* 장식 요소 */}
              <div className="absolute top-5 right-10 w-16 h-16 bg-white opacity-20 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
              <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-white opacity-10 rounded-full"></div>

              {/* 할인 태그 */}
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg transform rotate-12 shadow-lg">
                <span className="text-xs font-bold">최대 50% 할인</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center text-white p-4 max-w-xs">
            <h2 className="text-2xl font-bold mb-1">{banner.title}</h2>
            <p className="text-sm opacity-90 mb-3">{banner.description}</p>
            <Button
              color="light"
              size="xs"
              className="mt-1"
              onClick={handleViewDiscountedProducts}
            >
              {banner.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
