import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Coffee,
  Pizza,
  Sandwich,
  BeerIcon as Drink,
  IceCream,
  Cigarette,
  Gift,
} from "lucide-react";
import { Card, Badge, Button } from "flowbite-react";

export default function ShopHome() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // 나중에 api 따와서 수정
  const featuredProducts = [
    {
      id: 1,
      name: "Iced Americano",
      price: 2.5,
      category: "Drinks",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 2,
      name: "Chicken Sandwich",
      price: 4.99,
      category: "Food",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 3,
      name: "Energy Drink",
      price: 3.29,
      category: "Drinks",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 4,
      name: "Chocolate Bar",
      price: 1.99,
      category: "Snacks",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 5,
      name: "Potato Chips",
      price: 2.49,
      category: "Snacks",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 6,
      name: "Fresh Salad",
      price: 5.99,
      category: "Food",
      image: "/placeholder.svg?height=120&width=120",
    },
  ];

  // Categories with icons
  const categories = [
    { name: "Coffee", icon: Coffee, color: "bg-amber-100" },
    { name: "Food", icon: Pizza, color: "bg-red-100" },
    { name: "Sandwiches", icon: Sandwich, color: "bg-green-100" },
    { name: "Drinks", icon: Drink, color: "bg-blue-100" },
    { name: "Ice Cream", icon: IceCream, color: "bg-purple-100" },
    { name: "Tobacco", icon: Cigarette, color: "bg-gray-100" },
    { name: "Gifts", icon: Gift, color: "bg-pink-100" },
  ];

  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with search and cart */}
      <header className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Quick Mart</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 text-white rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {/* Welcome banner */}
        <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to Quick Mart!</h2>
          <p className="opacity-90">
            Find everything you need, quickly and easily.
          </p>
        </div>

        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                className="h-auto flex flex-col items-center justify-center p-4 gap-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => navigate(`/products?category=${category.name}`)}
              >
                <div className={`p-3 rounded-full ${category.color}`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="max-w-sm">
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-40 rounded-t-lg"
                  />
                  <Badge color="info" className="absolute top-2 right-2">
                    {product.category}
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{product.name}</h3>
                    <span className="font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    color="blue"
                    className="w-full"
                    size="sm"
                    onClick={addToCart}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-between max-w-7xl mx-auto">
          <Button
            color="blue"
            size="lg"
            className="w-full"
            onClick={() => navigate("/checkout")}
          >
            Start Order
          </Button>
        </div>
      </div>
    </div>
  );
}
