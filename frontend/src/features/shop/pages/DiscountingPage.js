import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, ShoppingBag, Plus, ChevronLeft } from "lucide-react";
import { Badge, Button, Spinner } from "flowbite-react";
import { fetchGetDiscountedGoods } from "../api/HttpShopService";
import { addItemToCart, getCartItemCount } from "../utils/CartUtils";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";

export default function DiscountingPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // 컴포넌트 마운트 시 할인 상품 데이터 가져오기
  useEffect(() => {
    const fetchDiscountedGoods = async () => {
      setLoading(true);
      try {
        const response = await fetchGetDiscountedGoods();
        setProducts(response);
      } catch (error) {
        console.error("할인 상품을 불러오는 중 오류 발생: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountedGoods();
  }, []);

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

  // 장바구니에 상품 추가
  const handleAddToCart = async (event, productId) => {
    if (event) {
      event.stopPropagation(); // 이벤트 객체가 있을 경우에만 stopPropagation 호출
    }

    try {
      // 상품 상세 정보 가져오기
      const productDetail = await fetchGoodsDetail(productId);

      // 장바구니에 추가
      addItemToCart(productDetail, 1);

      // 장바구니 개수 업데이트
      setCartCount(getCartItemCount());

      // 알림 표시
      setAddedProduct(productDetail);
      setShowCartAlert(true);

      // 2초 후 알림 숨기기
      setTimeout(() => {
        setShowCartAlert(false);
      }, 2000);

      console.log(`장바구니에 상품 추가: ${productId}`);
    } catch (error) {
      console.error("장바구니에 상품을 추가하는 중 오류 발생:", error);
    }
  };

  // 상품 상세 페이지로 이동
  const goToProductDetail = (productId) => {
    navigate(`/shop/products/${productId}`);
  };

  return (
    <div className="container flex flex-col px-6 min-h-screen">
      {/* 장바구니 추가 알림 */}
      {showCartAlert && addedProduct && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg text-center">
            <p className="text-sm font-medium">장바구니에 상품을 담았어요</p>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center mb-2">
          <Button
            color="light"
            onClick={() => navigate("/shop")}
            className=" border-none w-5 mr-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center">
            <Tag className="h-5 w-5 text-red-500 mr-2" />
            할인 중인 상품
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          지금 특별 할인 중인 상품들을 만나보세요! 최대 50% 할인된 가격으로
          제공됩니다.
        </p>
      </div>

      {/* 상품 목록 */}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-600">
              할인 상품을 불러오는 중입니다...
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <div
                key={product.goods_id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={product.goods_image || "/placeholder.svg"}
                    alt={product.goods_name}
                    className="object-cover w-full rounded-t-lg aspect-square"
                  />
                  {product.goods_stock <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold px-2 py-1 rounded-md bg-red-500 text-xs">
                        품절
                      </span>
                    </div>
                  )}
                  <Badge
                    color="failure"
                    className="absolute top-2 right-2 text-xs px-2 py-1"
                  >
                    {product.discountRate}% 할인
                  </Badge>

                  {/* 장바구니 추가 버튼 */}
                  <button
                    onClick={(e) => handleAddToCart(e, product.goods_id)}
                    disabled={product.goods_stock <= 0}
                    className={`absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-md ${
                      product.goods_stock <= 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {product.goods_name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-gray-500 line-through text-xs mr-2">
                      ₩{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="font-bold text-red-600">
                      ₩{product.goods_price.toLocaleString()}
                    </span>
                  </div>

                  {/* 재고 정보 표시 */}
                  {product.goods_stock > 0 && product.goods_stock <= 5 && (
                    <p className="text-xs text-red-500 mt-1">
                      {product.goods_stock}개 남았어요
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              현재 할인 중인 상품이 없습니다
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              나중에 다시 확인해주세요!
            </p>
            <Button onClick={() => navigate("/shop/products")} size="sm">
              모든 상품 보기
            </Button>
          </div>
        )}
      </div>

      {/* 하단 장바구니 위젯 */}
      {/* <div className="fixed bottom-0 bg-white border-t p-3 z-10 max-w-[430px] w-full">
        <Button
          color="blue"
          size="lg"
          className="w-full py-2.5 text-base"
          onClick={() => navigate("/shop/cart")}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          장바구니 보기 {cartCount > 0 && `(${cartCount})`}
        </Button>
      </div> */}
    </div>
  );
}
