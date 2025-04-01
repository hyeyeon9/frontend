import { Link } from "react-router-dom";

export default function UserHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
            </Link>
            <nav className="ml-6 flex space-x-8">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link
                to="/products"
                className="px-3 py-2 rounded-md text-sm font-medium"
              >
                Products
              </Link>
              {/* Add more navigation links */}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
