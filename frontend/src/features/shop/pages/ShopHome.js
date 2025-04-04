import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscountedProductsList from "../components/DiscountedProductList";
import EventBanner from "../components/EventBanner";
import PopularProductsList from "../components/PopularProductsList";
import Products from "../components/Products";
import { addItemToCart, getCartItemCount } from "../utils/CartUtils";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";

export default function ShopHome() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // 장바구니 추가
  const addToCart = async (productId, quantity = 1) => {
    try {
      // 상품 상세 정보 가져오기
      const productDetail = await fetchGoodsDetail(productId);

      // 장바구니에 추가
      addItemToCart(productDetail, quantity);

      // 장바구니 개수 업데이트
      setCartCount(getCartItemCount());

      console.log(`Added product ${productId} to cart, quantity: ${quantity}`);
    } catch (error) {
      console.error("장바구니에 상품을 추가하는 중 오류 발생:", error);
    }
  };

  // 장바구니 아이템 수 상태 추가
  const [cartCountState, setCartCountState] = useState(getCartItemCount());

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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        {/* 이벤트 배너 */}
        <section className="max-w-7xl mx-auto px-4 mb-10">
          <EventBanner />
        </section>

        {/* 할인 상품 리스트 */}
        <section className="max-w-7xl mx-auto px-4 mb-10">
          <DiscountedProductsList onAddToCart={addToCart} />
        </section>

        {/* 인기 상품 리스트 */}
        <section className="max-w-7xl mx-auto px-4 mb-10">
          <PopularProductsList onAddToCart={addToCart} />
        </section>

        {/* 카테고리별 쇼핑 */}
        <section className="max-w-7xl mx-auto px-4 mb-10">
          <h2 className="text-xl font-bold mb-4">카테고리별 쇼핑</h2>
          <Products onAddToCart={addToCart} isHomePage={true} />
        </section>
      </main>

      {/* 하단 장바구니 위젯 */}
      <div className="sticky bottom-0 bg-white border-t p-4 z-10">
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
