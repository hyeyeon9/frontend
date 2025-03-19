// 현재 시각을 출력하는 함수

import { useEffect, useState } from "react";
import { useTime } from "../contexts/TimeContext";

export default function Time() {
  const { date, time } = useTime();

  return (
    <div className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
      <span>{`${date} ${time}`}</span>
    </div>
  );
}
