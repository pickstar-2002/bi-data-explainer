import { useEffect, useState } from 'react';

export function useScale(designWidth: number = 1920, designHeight: number = 1080) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scaleX = windowWidth / designWidth;
      const scaleY = windowHeight / designHeight;

      // 保持比例，取较小的缩放值
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [designWidth, designHeight]);

  return scale;
}
