import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Minus,
  Plus,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { Badge, Button, Spinner } from "flowbite-react";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";
import categoryMapping from "../../../components/categoryMapping";
import { addItemToCart } from "../utils/CartUtils";
import { fetchRecommendations, fetchSubName } from "../api/HttpShopService";

export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddedAlert, setShowAddedAlert] = useState(false);

  const [subName, setSubName] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  // 추천 상품 스크롤 참조
  const recommendationsRef = useRef(null);

  // 개별 상품 데이터 가져오기
  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        const response = await fetchGoodsDetail(id);
        setProduct(response);
        console.log("상품", response);
      } catch (error) {
        console.error("상품 목록을 불러오는 중 오류 발생:", error);
        setProduct();
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  // 소분류 이름 가져오기
  useEffect(() => {
    if (!product) return;
    const getSubName = async () => {
      try {
        const data = await fetchSubName(product.goods_id);
        setSubName(data);
      } catch (e) {
        console.log(e.message);
      }
    };
    getSubName();
  }, [product]);

  // 연관상품 들고오기
  useEffect(() => {
    if (!subName) return;
    const getRecommendations = async () => {
      try {
        const data = await fetchRecommendations(subName);
        setRecommendations(data);
        console.log("연관 상품 가져오기", recommendations);
      } catch (e) {
        console.log(e.message);
      }
    };
    getRecommendations();
  }, [subName]);

  // 장바구니에 추가 - 세션 스토리지에 저장
  const addToCart = () => {
    if (!product) return;

    // 장바구니에 추가
    addItemToCart(product, quantity);

    // 부모 컴포넌트의 onAddToCart가 있으면 호출
    if (onAddToCart) {
      onAddToCart(product.goods_id, quantity);
    }

    // 알림 표시
    setShowAddedAlert(true);

    // 2초 후 알림 숨기기
    setTimeout(() => {
      setShowAddedAlert(false);
    }, 2000);
  };

  // 상품 ID가 변경될 때 수량 초기화
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId) => {
    const category = categoryMapping.find((cat) => cat.id === categoryId);
    return category ? category.sub : `카테고리 ${categoryId}`;
  };

  // 할인율 표시 여부 확인
  const isDiscounted = (product) => {
    return (
      product.discountRate > 0 &&
      product.discountEndAt &&
      new Date(product.discountEndAt) > new Date()
    );
  };

  // 추천 상품 스크롤 함수
  const scrollRecommendations = (direction) => {
    if (recommendationsRef.current) {
      const { current } = recommendationsRef;
      const scrollAmount = direction === "left" ? -200 : 200;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // 주문수량 값 변경
  const handleInputChange = (e) => {
    const value = Number(e.target.value);

    if (isNaN(value)) return;

    if (value < 1) {
      setQuantity(1);
    } else if (value > product.goods_stock) {
      setQuantity(product.goods_stock);
    } else {
      setQuantity(value);
    }
  };

  const canDecrement = quantity > 1;
  const canIncrement = quantity < product.goods_stock;

  // 로딩 중 표시
  if (loading || !product) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-4 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 text-sm">
            상품 정보를 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  // 오류 표시
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-4 text-center">
        <h1 className="text-xl font-bold mb-4 text-red-600">오류 발생</h1>
        <p className="mb-6 text-sm">{error}</p>
        <Button as={Link} to="/shop/products" size="sm">
          상품 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  // 상품을 찾을 수 없는 경우
  if (!product) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-4 text-center">
        <h1 className="text-xl font-bold mb-4">상품을 찾을 수 없습니다</h1>
        <p className="mb-6 text-sm">
          요청하신 상품이 존재하지 않거나 삭제되었습니다.
        </p>
        <Button as={Link} to="/shop/products" size="sm">
          상품 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container w-full max-w-6xl mx-auto flex flex-col sm:px-6 h-full">
      {/* 장바구니 추가 알림 */}
      {showAddedAlert && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg text-center">
            <p className="text-sm font-medium">장바구니에 상품을 담았어요</p>
          </div>
        </div>
      )}

      {/* 뒤로 가기 버튼 */}
      <Button
        color="light"
        as={Link}
        to="/shop/products"
        className="flex items-center w-full md:w-fit md:ml-0 rounded-none sm:rounded-md mb-6"
        size="sm"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        상품 목록으로
      </Button>

      {/* 상품 상세 정보 - 데스크탑에서는 2열 레이아웃 */}
      <div className="sm:flex md:gap-6">
        {/* 상품 이미지 */}
        <div className="bg-white rounded-lg overflow-hidden mb-4 sm:shadow-sm md:w-1/2 md:sticky md:top-4 md:self-start">
          <img
            src={product.goods_image || "/placeholder.svg?height=400&width=400"}
            alt={product.goods_name}
            className="max-h-80 md:max-h-none aspect-square object-cover mx-auto"
          />
        </div>

        {/* 상품 정보 및 구매 옵션 */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <div className="flex items-center mb-2">
              <Badge color="info">{getCategoryName(product.category_id)}</Badge>
              {isDiscounted(product) && (
                <Badge color="failure" className="ml-2">
                  {product.discountRate}% 할인
                </Badge>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold mt-1 mb-2">
              {product.goods_name}
            </h1>

            {/* 가격 정보 */}
            <div className="mb-3">
              {isDiscounted(product) ? (
                <div className="flex items-center">
                  <span className="text-gray-500 line-through mr-2 text-sm">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-red-600">
                    {product.goods_price.toLocaleString()}원
                  </span>
                </div>
              ) : (
                <p className="text-xl md:text-2xl font-bold">
                  {product.goods_price.toLocaleString()}원
                </p>
              )}
            </div>

            <p className="text-gray-600 text-sm md:text-base mb-4">
              {product.goods_description || "상품 설명이 없습니다."}
            </p>

            {/* 수량 선택기 */}
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium mr-2">수량:</span>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => canDecrement && setQuantity(quantity - 1)}
                  disabled={!canDecrement}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleInputChange}
                  className="w-14 text-center font-medium text-sm focus:outline-none appearance-none border-none
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
        [-moz-appearance:textfield]"
                  min={1}
                  max={product.goods_stock}
                />
                <button
                  onClick={() => canIncrement && setQuantity(quantity + 1)}
                  disabled={!canIncrement}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* 재고 정보 표시 */}
              <span className="ml-4 text-sm text-gray-500 block">
                {product.goods_stock > 0
                  ? `남은 수량: ${product.goods_stock}개`
                  : "품절"}
              </span>
            </div>

            {/* 장바구니 추가 버튼 */}
            <button
              onClick={addToCart}
              disabled={product.goods_stock <= 0}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-between text-white transition-colors ${
                product.goods_stock <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1C64F2] text-[#FFFFFF] transition-shadow duration-150 hover:shadow-md"
              }`}
            >
              {/* 왼쪽 - 수량 + 텍스트 */}
              <div className="flex items-center">
                <div className="bg-white text-[#1C64F2] font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                  {quantity}
                </div>
                <span className="text-base font-semibold">장바구니 담기</span>
              </div>

              {/* 오른쪽 - 가격 */}
              <span className="text-base font-semibold">
                {(product.goods_price * quantity).toLocaleString()}원
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 다른 사람들이 함께 구매한 상품 - 가로 스크롤 */}
      {recommendations && recommendations.length > 0 && (
        <div className=" bg-gray-100 rounded-lg">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">
                다른 사람들이 함께 구매한 상품
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => scrollRecommendations("left")}
                  className="p-1 bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollRecommendations("right")}
                  className="p-1 bg-gray-100 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={recommendationsRef}
              className="flex overflow-x-auto hide-scrollbar gap-3 pb-2"
            >
              {recommendations.map((item) => (
                <div
                  key={item.goods_id}
                  className="flex-shrink-0 min-w-[100px] max-w-[200px] w-[30vw] bg-white border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/shop/products/${item.goods_id}`)}
                >
                  <div className="relative">
                    <img
                      src={
                        item.goods_image ||
                        "/placeholder.svg?height=200&width=200"
                      }
                      alt={item.goods_name}
                      className="w-full aspect-square object-cover rounded-t-lg"
                    />

                    {/* 장바구니 추가 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToCart(item, 1);
                        setShowAddedAlert(true);
                        setTimeout(() => setShowAddedAlert(false), 2000);
                      }}
                      className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center rounded-full shadow-md bg-white border border-gray-200 text-[#1C64F2] hover:bg-[#f0faf9]"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-2">
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 min-h-[32px] md:min-h-[40px]">
                      {item.goods_name}
                    </h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-xs md:text-sm text-[#1C64F2]">
                        {item.goods_price?.toLocaleString() + "원" ||
                          "가격 정보 없음"}
                      </span>
                    </div>

                    {/* 재고 정보 표시 */}
                    {item.goods_stock > 0 && item.goods_stock <= 5 && (
                      <p className="text-xs md:text-sm text-red-500 mt-1">
                        {item.goods_stock}개 남았어요
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
