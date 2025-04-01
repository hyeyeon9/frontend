import { Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { Button, Navbar } from "flowbite-react";
import { useUser } from "../../features/member/UserContext";

export default function UserHeader() {
  const { user } = useUser();

  return (
    <Navbar fluid className="border-b shadow-sm">
      <Navbar.Brand as={Link} to="/shop">
        <img
          src="https://flowbite.com/docs/images/logo.svg"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite Logo"
        />
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          Daily24
        </span>
      </Navbar.Brand>

      <div className="flex md:order-2 items-center gap-2">
        <Link to="/shop/cart" className="p-2 relative">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-5 w-5 text-xs bg-blue-600 text-white rounded-full flex items-center justify-center">
            0
          </span>
        </Link>

        {user ? (
          <div className="flex items-center ml-4">
            <Link to="/shop/account" className="p-2">
              <User className="h-6 w-6" />
            </Link>
            {user.isAdmin && (
              <Link
                to="/admin"
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium border border-gray-300"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="hidden md:flex ml-4 items-center">
            <Link
              to="/login"
              className="px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </Link>
            <Button color="blue" as={Link} to="/signup" className="ml-4">
              Sign Up
            </Button>
          </div>
        )}

        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        <Navbar.Link as={Link} to="/shop" active>
          Home
        </Navbar.Link>
        <Navbar.Link as={Link} to="/shop/products">
          Products
        </Navbar.Link>
        <Navbar.Link as={Link} to="/shop/#">
          Promotions
        </Navbar.Link>
        <Navbar.Link as={Link} to="/shop/#">
          Locations
        </Navbar.Link>

        {!user && (
          <div className="md:hidden flex flex-col mt-4 gap-2">
            <Navbar.Link as={Link} to="/login">
              Login
            </Navbar.Link>
            <Button color="blue" as={Link} to="/signup">
              Sign Up
            </Button>
          </div>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
