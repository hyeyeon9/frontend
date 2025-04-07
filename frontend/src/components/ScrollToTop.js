import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 부드러운 스크롤 애니메이션
    }); // 페이지 이동 시 항상 위로
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
