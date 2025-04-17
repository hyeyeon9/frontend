import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  ChevronLeft,
  Plus,
  Minus,
  ShoppingBag,
  Check,
} from "lucide-react";
import { Button, Card, Badge, Alert } from "flowbite-react";
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../utils/CartUtils";
import { fetchPostOrder } from "../api/HttpShopService";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const navigate = useNavigate();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // 컴포넌트 마운트 시 장바구니 아이템 로드
  useEffect(() => {
    loadCartItems();
  }, []);

  // 장바구니 아이템 로드
  const loadCartItems = () => {
    const items = getCartItems();
    setCartItems(items);
  };

  // 수량 업데이트
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cartItems.find((item) => item.id === id);
    if (item && item.stock && newQuantity > item.stock) {
      // 재고보다 많은 수량으로 변경 시도 시 알림
      showAlertMessage(`재고가 ${item.stock}개 남았습니다.`, "warning");
      return;
    }

    const updatedItems = updateCartItemQuantity(id, newQuantity);
    setCartItems(updatedItems);
  };

  // 아이템 제거
  const removeItem = (id) => {
    const updatedItems = removeCartItem(id);
    setCartItems(updatedItems);
    showAlertMessage("상품이 장바구니에서 제거되었습니다.", "success");
  };

  // 알림 메시지 표시
  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    // 2초 후 알림 숨기기
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  };

  // 소계 계산
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // message 이벤트에서 성공 시 상태 true로 설정
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "PAYMENT_SUCCESS") {
        setIsPaymentSuccess(true); // ✅ 성공 여부 저장
        clearCart();
        navigate("/shop/complete");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 장바구니 아이템 결제하기
  const handlePayment = async () => {
    console.log("장바구니 아이템", cartItems);
    try {
      const order = {
        member: null,
        finalPrice: calculateTotal(),
        orderSummary:
          cartItems.length > 0
            ? cartItems.length > 1
              ? `${cartItems[0].name} 외 ${cartItems.length - 1}건`
              : `${cartItems[0].name}`
            : "주문 없음",
        paymentStatus: 0,
        orderItems: cartItems.map((item) => ({
          goodsId: item.id, // 상품 ID
          saleAmount: item.quantity, // 수량
          salePrice: item.price, // 개별 가격
        })),
      };

      // 주문 후 toss 결제 url 받아오기
      const orderId = await fetchPostOrder(order);

      const orderData = {
        id: orderId,
        timestamp: Date.now(),
      };

      // ✅ 임시로 localStorage에 성공 여부 저장
      localStorage.setItem("pendingPayment", JSON.stringify(orderData));

      // toss 결제창 띄우기
      const paymentUrl = `/payment?orderId=${orderId}&amount=${order.finalPrice}&orderSummary=${order.orderSummary}`;
      const paymentWindow = window.open(
        paymentUrl,
        "_blank",
        "width=500,height=700,resizable=yes,scrollbars=yes"
      );


      const timer = setInterval(() => {
        if (paymentWindow && paymentWindow.closed) {
          clearInterval(timer);
          localStorage.removeItem("pendingPayment");
        }
      }, 500);
    } catch (error) {
      console.error("결제 처리 중 오류 발생:", error);
      showAlertMessage("결제 처리 중 오류가 발생했습니다.", "failure");
    }
  };

  return (
    <div className="container flex flex-col px-0 sm:px-6 min-h-screen">
      {/* 알림 메시지 */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[2000]">
          <Alert color={alertType} className="shadow-lg">
            <div className="flex items-center gap-2">
              {alertType === "success" && <Check className="h-4 w-4" />}
              <span className="font-medium text-md">{alertMessage}</span>
            </div>
          </Alert>
        </div>
      )}

      <div className="sm:p-4">
        <Button
          color="light"
          as={Link}
          to="/shop"
          className="mb-4 flex items-center rounded-none sm:rounded-md"
          size="sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          쇼핑 계속하기
        </Button>

        <div className="flex items-center mb-4 ml-3 sm:ml-0">
          <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold">장바구니</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="md:flex md:gap-4">
            <div className="md:w-[60%] mb-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-3 rounded-none sm:rounded-md">
                  <div className="flex">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="object-cover w-full h-full rounded-l-lg"
                      />
                      {item.discountRate > 0 && (
                        <Badge
                          color="failure"
                          className="absolute top-1 left-1 text-sm px-1 py-0.5"
                        >
                          {item.discountRate}%
                        </Badge>
                      )}
                    </div>
                    <div className="p-2 flex-1">
                      <div className="flex justify-between">
                        <div className="pr-2">
                          <h3 className="font-medium text-md line-clamp-1">
                            {item.name}
                          </h3>
                          {item.discountRate > 0 && (
                            <div className="flex items-center mt-0.5">
                              <span className="text-gray-500 line-through text-xs mr-1">
                                {item.originalPrice.toLocaleString()}원
                              </span>
                              <span className="text-red-600 text-sm font-bold">
                                {item.price.toLocaleString()}원
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            className="px-2 py-1 text-gray-500"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 py-1 text-xs font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 py-1 text-gray-500"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-bold text-sm">
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="md:w-[40%]">
              <Card className="mb-20 rounded-none sm:rounded-md sticky top-4">
                <h3 className="text-md font-semibold mb-3">주문 요약</h3>
                <div className="mb-3">
                  <div className="grid grid-cols-12 text-sm font-medium border-b pb-2 mb-2">
                    <span className="col-span-7 font-bold">상품명</span>
                    <span className="col-span-2 text-center font-bold">
                      수량
                    </span>
                    <span className="col-span-3 text-right font-bold">
                      가격
                    </span>
                  </div>

                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 py-2 border-b border-gray-100 text-sm"
                    >
                      <span className="col-span-7 pr-2">{item.name}</span>
                      <span className="col-span-2 text-center">
                        {item.quantity}
                      </span>
                      <span className="col-span-3 text-right">
                        {item.discountRate > 0 ? (
                          <div>
                            <span className="line-through text-gray-400 block text-xs">
                              {(
                                item.originalPrice * item.quantity
                              ).toLocaleString()}
                              원
                            </span>
                            <span className="text-red-600 font-bold">
                              {(item.price * item.quantity).toLocaleString()}원
                            </span>
                          </div>
                        ) : (
                          <span>
                            {(item.price * item.quantity).toLocaleString()}원
                          </span>
                        )}
                      </span>
                    </div>
                  ))}

                  <div className="grid grid-cols-12 py-3 mt-2 font-bold text-sm">
                    <span className="col-span-9">총합</span>
                    <span className="col-span-3 text-right">
                      {calculateTotal().toLocaleString()}원
                    </span>
                  </div>
                </div>
                <Button
                  color="blue"
                  className="w-full"
                  size="md"
                  onClick={handlePayment}
                >
                  결제하기
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              장바구니가 비어있습니다
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              아직 장바구니에 상품을 추가하지 않으셨습니다.
            </p>
            <Button
              as={Link}
              to="/shop/products"
              size="sm"
              className="w-full sm:w-1/2 sm:mx-auto rounded-none sm:rounded-md"
            >
              쇼핑 시작하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
