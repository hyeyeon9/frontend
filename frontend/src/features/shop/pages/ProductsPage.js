import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import Products from "../components/Products";
import { getCartItemCount } from "../utils/CartUtils";

export default function ProductsPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // 컴포넌트 마운트 시 장바구니 개수 로드
  useEffect(() => {
    setCartCount(getCartItemCount());

    // 세션 스토리지 변경 이벤트 리스너 추가
    const handleStorageChange = () => {
      setCartCount(getCartItemCount());
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener("storage-cart-updated", handleStorageChange);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("storage-cart-updated", handleStorageChange);
    };
  }, []);

  // 장바구니에 상품 추가 핸들러
  const handleAddToCart = (productId, quantity = 1) => {
    if (onAddToCart) {
      onAddToCart(productId, quantity);
    }
    setCartCount(getCartItemCount());
  };

  return (
    <div className="container mx-auto py-6 pb-24">
      <Products onAddToCart={handleAddToCart} isFullPage={true} />

      {/* 하단 장바구니 위젯 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <div className="flex justify-between max-w-7xl mx-auto">
          <Button
            color="blue"
            size="lg"
            className="w-full"
            onClick={() => navigate("/shop/cart")}
          >
            장바구니 보기 {cartCount > 0 && `(${cartCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
