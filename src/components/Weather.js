import { useEffect, useState } from "react";
import axios from "axios";

// api 키
const API_KEY = "00969a8e1074e794f1dcffa02b9f3621";
// 위도와 경도 - 신세계아이앤씨 교육장으로 설정
const LAT = "35.1658";
const LON = "129.1325";

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
        );
        setWeather(res.data);
      } catch (err) {
        setError("날씨 정보를 불러올 수 없습니다.");
        console.error(err);
      }
    };

    fetchWeather();

    // 데이터를 가져오는 주기 설정(10분)
    const interval = setInterval(fetchWeather, 5 * 10 * 1000);

    // 컴포넌트가 언마운트 될 때 인터벌 초기화
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
      {error ? (
        <span>{error}</span>
      ) : weather ? (
        <div className="flex items-center space-x-2">
          {/* 날씨 아이콘 */}
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].decription}
            className="w-6 h-6"
          />
          <span>
            {weather.name} {weather.main.temp.toFixed(1)}℃
          </span>
        </div>
      ) : (
        <span>날씨 정보를 불러오는 중...</span>
      )}
    </div>
  );
}
