import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Badge, Button, Alert, Spinner } from "flowbite-react";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";
import categoryMapping from "../../../components/categoryMapping";
import { addItemToCart } from "../utils/CartUtils";
import { fetchRecommendations, fetchSubName } from "../api/HttpShopService";


export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddedAlert, setShowAddedAlert] = useState(false);

  const [subName, setSubName] = useState("");
  const [recommendations, setRecommendations] = useState([]);

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

  // 나중에 삭제하기
  useEffect(() => {
    if (subName) {
      console.log("✅ 소분류명:", subName);
    }
  }, [subName]);

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

  // 수량 변경 함수
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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

    // 3초 후 알림 숨기기
    setTimeout(() => {
      setShowAddedAlert(false);
    }, 3000);
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

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600">상품 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 오류 표시
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">오류 발생</h1>
        <p className="mb-6">{error}</p>
        <Button as={Link} to="/shop/products">
          상품 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  // 상품을 찾을 수 없는 경우
  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h1>
        <p className="mb-6">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
        <Button as={Link} to="/shop/products">
          상품 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* 장바구니 추가 알림 */}
      {showAddedAlert && (
        <Alert
          color="success"
          className="mb-4 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span className="font-medium">
              장바구니에 상품이 추가되었습니다!
            </span>
          </div>
        </Alert>
      )}

      {/* 뒤로 가기 버튼 */}
      <Button
        color="light"
        as={Link}
        to="/shop/products"
        className="mb-6 flex items-center"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        상품 목록으로 돌아가기
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="rounded-lg overflow-hidden justify-center items-center flex">
          <img
            src={product.goods_image || "/placeholder.svg?height=400&width=400"}
            alt={product.goods_name}
            className="w-auto h-auto object-cover"
          />
        </div>

        {/* 상품 상세 정보 */}
        <div>
          <div className="flex items-center mb-2">
            <Badge color="info">{getCategoryName(product.category_id)}</Badge>
          </div>

          <h1 className="text-3xl font-bold mt-2">{product.goods_name}</h1>

          {/* 가격 정보 */}
          <div className="mt-2 mb-4">
            {isDiscounted(product) ? (
              <div className="flex items-center">
                <span className="text-gray-500 line-through mr-2">
                  ₩{product.originalPrice.toLocaleString()}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  ₩{product.goods_price.toLocaleString()}
                </span>
                <Badge color="failure" className="ml-2">
                  {product.discountRate}% 할인
                </Badge>
              </div>
            ) : (
              <p className="text-2xl font-bold">
                ₩{product.goods_price.toLocaleString()}
              </p>
            )}
          </div>

          <p className="text-gray-600 mb-6">
            {product.goods_description || "상품 설명이 없습니다."}
          </p>

          {/* 재고 정보 */}
          <div className="flex items-center mb-6">
            <span className="text-sm">
              {product.goods_stock > 0
                ? `재고 ${product.goods_stock}개 남음`
                : "품절"}
            </span>
          </div>

          {/* 수량 선택기 */}
          <div className="flex items-center mb-6">
            <span className="mr-4 font-medium">수량:</span>
            <Button
              color="light"
              size="sm"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 text-xl font-medium w-8 text-center">
              {quantity}
            </span>
            <Button
              color="light"
              size="sm"
              onClick={incrementQuantity}
              disabled={product.goods_stock <= 0}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 장바구니 추가 버튼 */}
          <Button
            color="blue"
            className="w-full mb-6"
            size="lg"
            onClick={addToCart}
            disabled={product.goods_stock <= 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.goods_stock > 0
              ? `장바구니에 담기 - ₩${(
                  product.goods_price * quantity
                ).toLocaleString()}`
              : "품절된 상품입니다"}
          </Button>
        </div>
        <div className="col-span-2 mt-8">
          <h2 className="text-xl font-bold mb-4">함께 구매하면 좋은 상품</h2>

          {recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((item) => (
                <Link
                  key={item.goods_id}
                  to={`/shop/products/${item.goods_id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={
                          item.goods_image ||
                          "/placeholder.svg?height=400&width=400"
                        }
                        alt={item.goods_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.goods_name}
                      </h3>

                      <div className="mt-auto">
                        <p className="font-bold text-lg text-blue-700">
                          ₩
                          {item.goods_price?.toLocaleString() ||
                            "가격 정보 없음"}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <Badge color="indigo" className="text-xs">
                            추천 상품
                          </Badge>
                          <span className="text-sm text-gray-500">
                            지금 구매하기
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">추천 상품이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
