import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { Card, Badge, Button } from "flowbite-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // In a real app, you would fetch this data from an API
  const product = {
    id: Number(id),
    name: "Iced Americano",
    price: 2.5,
    category: "Coffee",
    description:
      "A refreshing cold coffee made with espresso and cold water. Perfect for a hot day.",
    image: "/placeholder.svg?height=400&width=400",
    nutritionalInfo: {
      calories: 15,
      fat: "0g",
      carbs: "3g",
      protein: "0g",
      caffeine: "150mg",
    },
    relatedProducts: [
      {
        id: 8,
        name: "Latte",
        price: 3.99,
        category: "Coffee",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 3,
        name: "Energy Drink",
        price: 3.29,
        category: "Drinks",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 7,
        name: "Bottled Water",
        price: 1.49,
        category: "Drinks",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button as={Link} to="/products">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button
        color="light"
        as={Link}
        to="/products"
        className="mb-6 flex items-center"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <Badge color="info">{product.category}</Badge>
          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          <p className="text-2xl font-bold mt-2 mb-4">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-500 mb-6">{product.description}</p>

          <div className="flex items-center mb-6">
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

          <Button color="blue" className="w-full mb-4" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </Button>

          <hr className="my-6" />

          <h2 className="text-xl font-semibold mb-2">
            Nutritional Information
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="flex justify-between">
              <span>Calories:</span>
              <span>{product.nutritionalInfo.calories}</span>
            </div>
            <div className="flex justify-between">
              <span>Fat:</span>
              <span>{product.nutritionalInfo.fat}</span>
            </div>
            <div className="flex justify-between">
              <span>Carbs:</span>
              <span>{product.nutritionalInfo.carbs}</span>
            </div>
            <div className="flex justify-between">
              <span>Protein:</span>
              <span>{product.nutritionalInfo.protein}</span>
            </div>
            <div className="flex justify-between">
              <span>Caffeine:</span>
              <span>{product.nutritionalInfo.caffeine}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {product.relatedProducts.map((relatedProduct) => (
            <Card key={relatedProduct.id} className="max-w-sm">
              <div className="relative">
                <img
                  src={relatedProduct.image || "/placeholder.svg"}
                  alt={relatedProduct.name}
                  className="object-cover w-full h-32 rounded-t-lg"
                />
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{relatedProduct.name}</h3>
                  <span className="font-bold">
                    ${relatedProduct.price.toFixed(2)}
                  </span>
                </div>
                <Button
                  color="light"
                  className="w-full"
                  size="sm"
                  as={Link}
                  to={`/products/${relatedProduct.id}`}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
