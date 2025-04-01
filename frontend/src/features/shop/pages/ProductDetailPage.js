import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Clock,
  Check,
  Info,
} from "lucide-react";
import { Card, Badge, Button, Alert } from "flowbite-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [showAddedAlert, setShowAddedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // In a real app, you would fetch this data from an API
  const product = {
    id: Number(id),
    name: "아이스 아메리카노",
    price: 2.5,
    category: "Coffee",
    rating: 4.8,
    reviewCount: 124,
    stock: 50,
    description:
      "에스프레소 샷에 차가운 물을 더해 깔끔하고 강렬한 커피 맛을 느낄 수 있는 음료입니다. 얼음이 듬뿍 들어가 시원하게 즐길 수 있습니다.",
    longDescription:
      "아이스 아메리카노는 에스프레소 샷에 차가운 물을 더해 만든 음료로, 깔끔하고 강렬한 커피 맛을 느낄 수 있습니다. 얼음이 듬뿍 들어가 시원하게 즐길 수 있어 더운 날씨에 특히 인기가 많습니다. 고품질의 원두를 사용하여 추출한 에스프레소는 풍부한 향과 깊은 맛을 제공합니다. 당사의 아이스 아메리카노는 매장에서 직접 추출한 신선한 에스프레소를 사용하여 최상의 맛을 보장합니다.",
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&text=Side",
      "/placeholder.svg?height=400&width=400&text=Top",
    ],
    nutritionalInfo: {
      calories: 15,
      fat: "0g",
      carbs: "3g",
      protein: "0g",
      caffeine: "150mg",
    },
    features: [
      "100% 아라비카 원두 사용",
      "매장에서 직접 추출한 에스프레소",
      "얼음 듬뿍 제공",
      "무설탕 음료",
      "카페인 함유",
    ],
    relatedProducts: [
      {
        id: 8,
        name: "카페 라떼",
        price: 3.99,
        category: "Coffee",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 3,
        name: "에너지 드링크",
        price: 3.29,
        category: "Drinks",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 7,
        name: "생수",
        price: 1.49,
        category: "Drinks",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addToCart = () => {
    console.log(`Added ${quantity} of product ${id} to cart`);
    setCartCount((prev) => prev + quantity);
    setShowAddedAlert(true);

    // Hide alert after 3 seconds
    setTimeout(() => {
      setShowAddedAlert(false);
    }, 3000);
  };

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [id]);

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
      {/* Added to cart alert */}
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
        {/* Product Images */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={`${product.image}` || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-auto object-cover"
          />

          {/* Thumbnail images */}
          <div className="flex mt-4 gap-2">
            {product.images.map((img, index) => (
              <div
                key={index}
                className="w-20 h-20 border-2 border-gray-200 rounded cursor-pointer hover:border-blue-500"
              >
                <img
                  src={`${img}` || "/placeholder.svg"}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-center mb-2">
            <Badge color="info">{product.category}</Badge>
            <div className="flex items-center ml-4">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-gray-500 ml-1">
                ({product.reviewCount} 리뷰)
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          <p className="text-2xl font-bold mt-2 mb-4">
            ₩{product.price.toLocaleString()}
          </p>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Stock information */}
          <div className="flex items-center mb-6">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">
              {product.stock > 10
                ? "지금 주문하시면 오늘 바로 받아보실 수 있습니다"
                : product.stock > 0
                ? `재고 ${product.stock}개 남음`
                : "품절"}
            </span>
          </div>

          {/* Quantity selector */}
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
            <Button color="light" size="sm" onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to cart button */}
          <Button
            color="blue"
            className="w-full mb-6"
            size="lg"
            onClick={addToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            장바구니에 담기 - ₩{(product.price * quantity).toLocaleString()}
          </Button>

          {/* Product features */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">상품 특징</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Product tabs - Using standard tabs instead of Tabs.Group */}
      <div className="mt-12 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-block p-4 border-b-2 rounded-t-lg ${
              activeTab === 0
                ? "text-blue-600 border-blue-600 active"
                : "border-transparent hover:text-gray-600 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab(0)}
          >
            상세 설명
          </button>
          <button
            className={`inline-block p-4 border-b-2 rounded-t-lg ${
              activeTab === 1
                ? "text-blue-600 border-blue-600 active"
                : "border-transparent hover:text-gray-600 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab(1)}
          >
            영양 정보
          </button>
        </div>

        <div className="py-4">
          {activeTab === 0 && (
            <div className="py-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.longDescription}
              </p>
            </div>
          )}

          {activeTab === 1 && (
            <div className="py-4">
              <h3 className="text-xl font-semibold mb-4">영양 성분</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="block text-gray-500 text-sm">칼로리</span>
                  <span className="block font-bold text-lg">
                    {product.nutritionalInfo.calories}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="block text-gray-500 text-sm">지방</span>
                  <span className="block font-bold text-lg">
                    {product.nutritionalInfo.fat}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="block text-gray-500 text-sm">탄수화물</span>
                  <span className="block font-bold text-lg">
                    {product.nutritionalInfo.carbs}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="block text-gray-500 text-sm">단백질</span>
                  <span className="block font-bold text-lg">
                    {product.nutritionalInfo.protein}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="block text-gray-500 text-sm">카페인</span>
                  <span className="block font-bold text-lg">
                    {product.nutritionalInfo.caffeine}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  영양 정보는 표준 제조 방법을 기준으로 제공됩니다. 실제 제품은
                  제조 과정에서 약간의 차이가 있을 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">함께 구매하면 좋은 상품</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {product.relatedProducts.map((relatedProduct) => (
            <Card
              key={relatedProduct.id}
              className="max-w-sm cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => navigate(`/shop/products/${relatedProduct.id}`)}
            >
              <div className="relative">
                <img
                  src={`${relatedProduct.image}` || "/placeholder.svg"}
                  alt={relatedProduct.name}
                  className="object-cover w-full h-32 rounded-t-lg"
                />
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{relatedProduct.name}</h3>
                  <span className="font-bold">
                    ₩{relatedProduct.price.toLocaleString()}
                  </span>
                </div>
                <Button
                  color="light"
                  className="w-full"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shop/products/${relatedProduct.id}`);
                  }}
                >
                  상세 보기
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white border-t p-4 mt-8">
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
