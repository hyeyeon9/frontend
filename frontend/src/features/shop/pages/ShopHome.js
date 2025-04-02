import { Button } from "flowbite-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscountedProductsList from "../components/DiscountedProductList";
import EventBanner from "../components/EventBanner";
import PopularProductsList from "../components/PopularProductsList";
import Products from "../components/Products";

export default function ShopHome() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // 장바구니 추가
  const addToCart = (e, productId) => {
    if (e) e.stopPropagation(); // 이벤트 버블링 방지
    console.log(`Added product ${productId} to cart`);
    setCartCount(cartCount + 1);
  };

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

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white border-t p-4">
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
