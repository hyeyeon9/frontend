import { Footer } from "flowbite-react";

export default function UserFooter() {
  return (
    <Footer container className="bg-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-6 md:mb-0">
            <Footer.Brand
              href="/shop"
              src="https://wvmmoqvaxudiftvldxts.supabase.co/storage/v1/object/public/kdt-final-images//logo.svg"
              alt="Daily24 Logo"
              name="Daily24"
            />
            <p className="text-sm text-gray-600 mt-2 md:max-w-xs">
              24시간 운영되는 무인 매장, 필요한 모든 것을 언제든 제공합니다.
            </p>
          </div>
        </div>
        <Footer.Copyright href="" by="Daily24" year={2025} />
      </div>
    </Footer>
  );
}
