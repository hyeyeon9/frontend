import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useUser } from "../../features/member/UserContext";
import { ShoppingCart, User } from "lucide-react";
import { Button, Navbar } from "flowbite-react";
import { useEffect, useState } from "react";
import { getCartItemCount } from "../../features/shop/utils/CartUtils";

export default function UserHeader() {
  const { user } = useUser();
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // 컴포넌트 마운트 시 장바구니 개수 로드
  useEffect(() => {
    // 초기 로드
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
    <Navbar
      fluid
      className="border-b shadow-sm sticky px-5 top-0 z-[1000] bg-white dark:bg-gray-800"
    >
      <Navbar.Brand as={Link} to="/shop">
        <img
          src="https://flowbite.com/docs/images/logo.svg"
          className="mx-3 h-6 sm:h-9"
          alt="Flowbite Logo"
        />
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          Daily24
        </span>
      </Navbar.Brand>

      <div className="flex mr-2 md:order-2 items-center gap-2">
        <Link to="/shop/cart" className="p-2 relative">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 text-xs bg-blue-600 text-white rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        <Navbar.Link as={Link} to="/shop" className="p-0">
          <div
            className={`px-3 py-1 rounded-lg transition-colors duration-200
        ${
          location.pathname === "/shop"
            ? "text-blue-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }
      `}
          >
            메인
          </div>
        </Navbar.Link>

        <Navbar.Link as={Link} to="/shop/products" className="p-0">
          <div
            className={`px-3 py-1 rounded-lg transition-colors duration-200
        ${
          location.pathname.startsWith("/shop/products")
            ? "text-blue-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }
      `}
          >
            상품
          </div>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
