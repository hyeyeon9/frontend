import Products from "../components/Products";

export default function ProductsPage({ onAddToCart }) {
  return (
    <div className="container mx-auto py-6">
      <Products onAddToCart={onAddToCart} isFullPage={true} />
    </div>
  );
}
