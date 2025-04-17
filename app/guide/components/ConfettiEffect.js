// components/ConfettiEffect.js
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const ConfettiEffect = () => {
  useEffect(() => {
    // 폭죽을 시작하는 함수
    const startConfetti = () => {
      const duration = 2 * 1000; // 3초
      const end = Date.now() + duration;

      (function frame() {
        // 왼쪽에서 발사
        confetti({
          particleCount: 10,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.3 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });

        // 오른쪽에서 발사
        confetti({
          particleCount: 10,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.3 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    };

    // 폭죽 시작
    startConfetti();

    // 3초 후에 클린업
    const timeout = setTimeout(() => confetti.reset(), 1000);

    // 컴포넌트 언마운트 시 클린업
    return () => clearTimeout(timeout);
  }, []);

  return null; // 화면에 직접적으로 그릴 필요가 없으므로 null 반환
};

export default ConfettiEffect;
