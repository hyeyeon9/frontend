import Products from "../components/Products";

export default function ProductsPage({ onAddToCart }) {
  return (
    <section className="max-w-7xl mx-auto px-4 mb-10 py-10">
      <Products onAddToCart={onAddToCart} isFullPage={true} />
    </section>
  );
}
