import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Card, Badge, Button, TextInput, Select, Modal } from "flowbite-react";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [sortBy, setSortBy] = useState("popularity");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sample product data - in a real app, this would come from an API
  const allProducts = [
    {
      id: 1,
      name: "Iced Americano",
      price: 2.5,
      category: "Coffee",
      popularity: 10,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "Chicken Sandwich",
      price: 4.99,
      category: "Food",
      popularity: 8,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 3,
      name: "Energy Drink",
      price: 3.29,
      category: "Drinks",
      popularity: 7,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 4,
      name: "Chocolate Bar",
      price: 1.99,
      category: "Snacks",
      popularity: 9,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 5,
      name: "Potato Chips",
      price: 2.49,
      category: "Snacks",
      popularity: 9,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 6,
      name: "Fresh Salad",
      price: 5.99,
      category: "Food",
      popularity: 6,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 7,
      name: "Bottled Water",
      price: 1.49,
      category: "Drinks",
      popularity: 10,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 8,
      name: "Latte",
      price: 3.99,
      category: "Coffee",
      popularity: 8,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 9,
      name: "Soda",
      price: 1.99,
      category: "Drinks",
      popularity: 7,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 10,
      name: "Candy Bar",
      price: 1.29,
      category: "Snacks",
      popularity: 6,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 11,
      name: "Hot Dog",
      price: 3.49,
      category: "Food",
      popularity: 7,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 12,
      name: "Ice Cream",
      price: 2.99,
      category: "Ice Cream",
      popularity: 9,
      image: "/placeholder.svg?height=200&width=200",
    },
  ];

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(
      (product) =>
        (selectedCategory ? product.category === selectedCategory : true) &&
        (searchQuery
          ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true)
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      // Default: sort by popularity
      return b.popularity - a.popularity;
    });

  // Get unique categories for filter
  const categories = [
    ...new Set(allProducts.map((product) => product.category)),
  ];

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          {selectedCategory ? `${selectedCategory} Products` : "All Products"}
        </h1>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <TextInput
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-[180px]"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </Select>

            <Button color="light" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          color={selectedCategory === "" ? "blue" : "light"}
          size="sm"
          onClick={() => setSelectedCategory("")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            color={selectedCategory === category ? "blue" : "light"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="max-w-sm">
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-48 rounded-t-lg"
                />
                <Badge color="info" className="absolute top-2 right-2">
                  {product.category}
                </Badge>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{product.name}</h3>
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                </div>
                <Button color="blue" className="w-full" size="sm">
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        show={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <Modal.Header>Filter Products</Modal.Header>
        <Modal.Body>
          <div className="py-4">
            <h3 className="mb-2 text-sm font-medium">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                color={selectedCategory === "" ? "blue" : "light"}
                size="sm"
                onClick={() => {
                  setSelectedCategory("");
                  setIsFilterModalOpen(false);
                }}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  color={selectedCategory === category ? "blue" : "light"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFilterModalOpen(false);
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
