import { Button, Carousel } from "flowbite-react";

export default function EventBanner() {
  const banners = [
    {
      id: 1,
      title: "4월 할인 이벤트",
      description: "봄맞이 특별 할인 최대 30%",
      bgColor: "from-blue-500 to-indigo-600",
      buttonText: "할인 상품 보기",
    },
    {
      id: 2,
      title: "봄 맞이 피크닉 세트",
      description: "도시락과 음료를 한번에! 세트 구매시 10% 할인",
      bgColor: "from-green-500 to-teal-500",
      buttonText: "세트 구매하기",
    },
    {
      id: 3,
      title: "새학기 문구류 할인",
      description: "필기구, 노트 등 새학기 준비물 20% 할인",
      bgColor: "from-red-500 to-pink-500",
      buttonText: "문구류 보기",
    },
  ];

  return (
    <div className="mb-8">
      <Carousel className="h-56 sm:h-64 xl:h-80">
        {/* April Discount Event Banner */}
        <div
          className={`relative flex h-full items-center justify-center bg-gradient-to-r ${banners[0].bgColor}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full absolute">
              {/* Decorative elements */}
              <div className="absolute top-5 right-10 w-20 h-20 bg-white opacity-20 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-white opacity-10 rounded-full"></div>

              {/* Sale tag */}
              <div className="absolute top-8 right-8 sm:top-10 sm:right-16 bg-red-500 text-white px-4 py-2 rounded-lg transform rotate-12 shadow-lg">
                <span className="text-sm sm:text-base font-bold">
                  최대 30% 할인
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center text-white p-6 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {banners[0].title}
            </h2>
            <p className="text-lg opacity-90 mb-4">{banners[0].description}</p>
            <Button color="light" className="mt-2">
              {banners[0].buttonText}
            </Button>
          </div>
        </div>

        {/* Spring Picnic Set Banner */}
        <div
          className={`relative flex h-full items-center justify-center bg-gradient-to-r ${banners[1].bgColor}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full absolute">
              {/* Decorative picnic elements */}
              <div className="absolute top-10 left-10 w-24 h-24 rounded-lg bg-white opacity-20 transform -rotate-12"></div>
              <div className="absolute bottom-10 right-10 w-32 h-20 rounded-lg bg-white opacity-10 transform rotate-6"></div>

              {/* Picnic icon */}
              <div className="absolute top-8 right-8 sm:top-10 sm:right-16">
                <svg
                  className="w-12 h-12 text-white opacity-80"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm.293 7.707a1 1 0 010-1.414L10.586 5H7a1 1 0 110-2h10a1 1 0 110 2h-3.586l3.293 3.293a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center text-white p-6 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {banners[1].title}
            </h2>
            <p className="text-lg opacity-90 mb-4">{banners[1].description}</p>
            <Button color="light" className="mt-2">
              {banners[1].buttonText}
            </Button>
          </div>
        </div>

        {/* New Semester Stationery Banner */}
        <div
          className={`relative flex h-full items-center justify-center bg-gradient-to-r ${banners[2].bgColor}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full absolute">
              {/* Decorative stationery elements */}
              <div className="absolute top-1/4 left-16 w-16 h-2 bg-white opacity-30 transform rotate-45"></div>
              <div className="absolute top-1/3 left-20 w-12 h-2 bg-white opacity-20 transform rotate-45"></div>
              <div className="absolute bottom-1/4 right-16 w-20 h-3 bg-white opacity-20 transform -rotate-30"></div>

              {/* Pencil icon */}
              <div className="absolute top-8 right-8 sm:top-10 sm:right-16">
                <svg
                  className="w-12 h-12 text-white opacity-80"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center text-white p-6 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {banners[2].title}
            </h2>
            <p className="text-lg opacity-90 mb-4">{banners[2].description}</p>
            <Button color="light" className="mt-2">
              {banners[2].buttonText}
            </Button>
          </div>
        </div>
      </Carousel>
    </div>
  );
}
