import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";
import DiscountedProductsList from "../components/DiscountedProductList";
import EventBanner from "../components/EventBanner";
import PopularProductsList from "../components/PopularProductsList";
import Products from "../components/Products";
import { addItemToCart, getCartItemCount } from "../utils/CartUtils";

export default function ShopHome() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // 장바구니 추가
  const addToCart = async (productId, quantity = 1) => {
    try {
      // 상품 상세 정보 가져오기
      const productDetail = await fetchGoodsDetail(productId);

      // 장바구니에 추가
      addItemToCart(productDetail, quantity);

      // 장바구니 개수 업데이트
      setCartCount(getCartItemCount());

      //   quantity)

      // 장바구니 개수 업데이트
      setCartCount(getCartItemCount());

      // 알림 표시
      setAddedProduct(productDetail);
      setShowCartAlert(true);

      // 2초 후 알림 숨기기
      setTimeout(() => {
        setShowCartAlert(false);
      }, 2000);

      console.log(`Added product ${productId} to cart, quantity: ${quantity}`);
    } catch (error) {
      console.error("장바구니에 상품을 추가하는 중 오류 발생:", error);
    }
  };

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
    <div className="container flex flex-col px-0 sm:px-6 min-h-screen">
      {/* 장바구니 추가 알림 */}
      {showCartAlert && addedProduct && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-[2000]">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg text-center">
            <p className="text-sm font-medium">장바구니에 상품을 담았어요</p>
          </div>
        </div>
      )}

      <main className="flex-1 w-full mx-auto">
        {/* 이벤트 배너 */}
        <section className="px-3 mb-4">
          <EventBanner />
        </section>

        {/* 할인 상품 리스트 */}
        <section className="px-3 mb-2">
          <DiscountedProductsList onAddToCart={addToCart} />
        </section>

        {/* 인기 상품 리스트 */}
        <section className="px-3 mb-2">
          <PopularProductsList onAddToCart={addToCart} />
        </section>

        {/* 카테고리별 쇼핑 */}
        <section className="px-3 mb-16 py-2">
          <h2 className="text-lg font-bold mb-3">카테고리별 쇼핑</h2>
          <Products onAddToCart={addToCart} isHomePage={true} />
        </section>
      </main>

      {/* 하단 장바구니 위젯 */}
      {/* <div className="sticky bottom-0 bg-white border-t p-3 z-10 max-w-[430px] mx-auto w-full">
        <Button color="blue" size="lg" className="w-full py-2.5 text-base" onClick={() => navigate("/shop/cart")}>
          <ShoppingBag className="h-5 w-5 mr-2" />
          장바구니 보기 {cartCount > 0 && `(${cartCount})`}
        </Button>
      </div> */}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
