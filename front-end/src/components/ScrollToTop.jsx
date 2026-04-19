import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sayfa yolu her değiştiğinde scroll'u 0,0 noktasına çeker
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;