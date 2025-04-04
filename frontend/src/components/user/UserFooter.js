import { Facebook, Twitter, Instagram } from "lucide-react";
import { Footer } from "flowbite-react";

export default function UserFooter() {
  return (
    <Footer container className="bg-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-6 md:mb-0">
            <Footer.Brand
              href="/shop"
              src="https://flowbite.com/docs/images/logo.svg"
              alt="Flowbite Logo"
              name="Daily24"
            />
            <p className="text-sm text-gray-600 mt-2 md:max-w-xs">
              24시간 운영되는 무인 매장, 필요한 모든 것을 언제든 제공합니다.
            </p>
            {/* SNS */}
            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <Footer.Copyright href="#" by="Daily24" year={2025} />
      </div>
    </Footer>
  );
}
