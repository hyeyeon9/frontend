/**
 * 장바구니 관련 유틸리티 함수
 */

// 세션 스토리지 키
const CART_STORAGE_KEY = "shop_cart_items";

/**
 * 세션 스토리지에서 장바구니 아이템 가져오기
 * @returns {Array} 장바구니 아이템 배열
 */
export const getCartItems = () => {
  try {
    const cartItems = sessionStorage.getItem(CART_STORAGE_KEY);
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error("장바구니 아이템을 불러오는 중 오류 발생:", error);
    return [];
  }
};

/**
 * 세션 스토리지에 장바구니 아이템 저장
 * @param {Array} cartItems 장바구니 아이템 배열
 */
export const saveCartItems = (cartItems) => {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("장바구니 아이템을 저장하는 중 오류 발생:", error);
  }
};

/**
 * 장바구니에 상품 추가
 * @param {Object} product 추가할 상품 정보
 * @param {number} quantity 추가할 수량
 * @returns {Array} 업데이트된 장바구니 아이템 배열
 */
export const addItemToCart = (product, quantity = 1) => {
  const cartItems = getCartItems();

  // 이미 장바구니에 있는 상품인지 확인
  const existingItemIndex = cartItems.findIndex(
    (item) => item.id === product.goods_id
  );

  if (existingItemIndex !== -1) {
    // 이미 있는 상품이면 수량만 증가
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // 새 상품이면 장바구니에 추가
    cartItems.push({
      id: product.goods_id,
      name: product.goods_name,
      price: product.goods_price,
      originalPrice: product.originalPrice,
      discountRate: product.discountRate,
      category: product.category_name || getCategoryName(product.category_id),
      image: product.goods_image || "/placeholder.svg?height=100&width=100",
      quantity: quantity,
      stock: product.goods_stock,
    });
  }

  // 세션 스토리지에 저장
  saveCartItems(cartItems);

  return cartItems;
};

/**
 * 장바구니에서 상품 수량 업데이트
 * @param {number} productId 상품 ID
 * @param {number} quantity 새 수량
 * @returns {Array} 업데이트된 장바구니 아이템 배열
 */
export const updateCartItemQuantity = (productId, quantity) => {
  const cartItems = getCartItems();

  const updatedItems = cartItems.map((item) =>
    item.id === productId ? { ...item, quantity: quantity } : item
  );

  saveCartItems(updatedItems);

  return updatedItems;
};

/**
 * 장바구니에서 상품 제거
 * @param {number} productId 제거할 상품 ID
 * @returns {Array} 업데이트된 장바구니 아이템 배열
 */
export const removeCartItem = (productId) => {
  const cartItems = getCartItems();

  const updatedItems = cartItems.filter((item) => item.id !== productId);

  saveCartItems(updatedItems);

  return updatedItems;
};

/**
 * 장바구니 아이템 개수 가져오기
 * @returns {number} 장바구니에 있는 총 아이템 개수
 */
export const getCartItemCount = () => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

/**
 * 카테고리 ID로 카테고리 이름 가져오기
 * @param {number} categoryId 카테고리 ID
 * @returns {string} 카테고리 이름
 */
const getCategoryName = (categoryId) => {
  // 이 함수는 categoryMapping을 import하여 사용할 수도 있지만,
  // 순환 참조 문제를 방지하기 위해 간단하게 구현
  return `카테고리 ${categoryId}`;
};
