import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ChevronLeft, Plus, Minus } from "lucide-react";
import { Button, Card, Badge } from "flowbite-react";

export default function CartPage() {
  // In a real app, this would come from a global state or context
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Iced Americano",
      price: 2.5,
      quantity: 2,
      category: "Coffee",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      name: "Energy Drink",
      price: 3.29,
      quantity: 1,
      category: "Drinks",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 4,
      name: "Chocolate Bar",
      price: 1.99,
      quantity: 3,
      category: "Snacks",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Button
        color="light"
        as={Link}
        to="/shop"
        className="mb-6 flex items-center"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Button>

      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.id} className="mb-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-24 h-24">
                    <img
                      src={
                        `https://wvmmoqvaxudiftvldxts.supabase.co/storage/v1/object/public/kdt-final-images/goods_images/${item.image}` ||
                        "/placeholder.svg"
                      }
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
                        <Badge
                          color="info"
                          className="hidden sm:inline-flex mt-1"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <span className="font-bold">
                        ${item.price.toFixed(2)}
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
                          ${(item.price * item.quantity).toFixed(2)}
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
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <Button color="blue" className="w-full mt-4" size="lg">
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button as={Link} to="/shop">
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
}
