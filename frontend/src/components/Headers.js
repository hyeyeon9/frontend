import { useUser } from "../features/member/UserContext";
import Time from "./Time";
import Weather from "./Weather";
import GlobalNotification from "./GlobalNotification";

export default function Headers() {
  const { user, setUser } = useUser();
  // console.log("현재 user 값:", user);

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-gray-100">
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between">
          {/* Left space for sidebar toggle */}
          <div className="w-10"></div>

          {/* Centered logo */}
          <a href="/" className="flex items-center justify-center">
            <img
              src="https://wvmmoqvaxudiftvldxts.supabase.co/storage/v1/object/public/kdt-final-images//logo.svg"
              className="mr-3 h-6 sm:h-9"
              alt="Daily24 Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Daily24
            </span>
          </a>

          {/* Weather and Notification on right */}
          <div className="flex items-center gap-2">
            <GlobalNotification />
            <Weather />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex flex-wrap justify-between items-center mx-auto mr-24">
          <a href="/" className="flex items-center ml-12 lg:ml-0">
            <img
              src="https://wvmmoqvaxudiftvldxts.supabase.co/storage/v1/object/public/kdt-final-images//logo.svg"
              className="mr-3 h-6 sm:h-9"
              alt="Daily24 Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Daily24
            </span>
          </a>
          <div className="flex items-center lg:order-2">
            {user && (
              <>
                <div className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                  {user.memberId}
                </div>

                <div
                  onClick={() => setUser(null)}
                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800 cursor-pointer"
                >
                  로그아웃
                </div>
              </>
            )}

            <Time />
            <Weather />
            <GlobalNotification />
          </div>
        </div>
      </nav>
    </header>
  );
}
