import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ChevronLeft, Plus, Minus } from "lucide-react";
import { Button, Card, Badge, Alert } from "flowbite-react";
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
} from "../utils/CartUtils";
import { fetchPostOrder } from "../api/HttpShopService";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

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

    // 3초 후 알림 숨기기
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  // 소계 계산
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // 장바구니 아이템 결제하기
  const handlePayment = async () => {
    try {
      const order = {
        member: null,
        finalPrice: calculateTotal(),
        orderSummary: `${cartItems[0].name} 외 ${cartItems.length - 1}건`,
        paymentStatus: 0,
      };

      // 주문 후 toss 결제 url 받아오기
      const orderId = await fetchPostOrder(order);

      // toss 결제창 띄우기
      const paymentUrl = `/payment?orderId=${orderId}&amount=${order.finalPrice}&orderSummary=${order.orderSummary}`;
      window.open(
        paymentUrl,
        "_blank",
        "width=500,height=700,resizable=yes,scrollbars=yes"
      );
    } catch (error) {
      console.error("결제 처리 중 오류 발생:", error);
      showAlertMessage("결제 처리 중 오류가 발생했습니다.", "failure");
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mb-10">
      <div className="container py-6 px-4">
        {/* 알림 메시지 */}
        {showAlert && (
          <Alert
            color={alertType}
            className="mb-4 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg"
          >
            <span className="font-medium">{alertMessage}</span>
          </Alert>
        )}

        <Button
          color="light"
          as={Link}
          to="/shop"
          className="mb-6 flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          쇼핑 계속하기
        </Button>

        <h1 className="text-2xl font-bold mb-6">장바구니</h1>

        {cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-4">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-24 h-24">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="object-cover w-full h-full rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                      />
                      <Badge
                        color="info"
                        className="absolute top-2 right-2 sm:hidden"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                        </div>
                        <span className="font-bold">
                          ₩{item.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <Button
                            color="light"
                            size="xs"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            color="light"
                            size="xs"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">
                            ₩{(item.price * item.quantity).toLocaleString()}
                          </span>
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <h3 className="text-lg font-semibold mb-4">주문 요약</h3>
                <div className="mb-4">
                  <div className="grid grid-cols-12 font-medium border-b pb-2 mb-2">
                    <span className="col-span-7">상품명</span>
                    <span className="col-span-2 text-center">수량</span>
                    <span className="col-span-3 text-right">가격</span>
                  </div>

                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 py-2 border-b border-gray-100"
                    >
                      <span className="col-span-7 pr-2">{item.name}</span>
                      <span className="col-span-2 text-center">
                        {item.quantity}
                      </span>
                      <span className="col-span-3 text-right">
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div className="grid grid-cols-12 py-3 mt-2 font-bold">
                    <span className="col-span-9">총합</span>
                    <span className="col-span-3 text-right">
                      ₩{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  color="blue"
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                >
                  결제하기
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              장바구니가 비어있습니다
            </h3>
            <p className="text-gray-500 mb-6">
              아직 장바구니에 상품을 추가하지 않으셨습니다.
            </p>
            <Button as={Link} to="/shop/products">
              쇼핑 시작하기
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
