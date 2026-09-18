import React, { useEffect, useRef, useState } from 'react';
import './ScrollCar.css';

const ScrollCar = () => {
    const carRef = useRef(null);
    const progressTrackRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        let animationFrameId;
        let isDrivingActive = false;

        const setDriving = (driving) => {
            if (isDrivingActive === driving) return;
            isDrivingActive = driving;
            if (carRef.current) {
                if (driving) {
                    carRef.current.classList.add('is-driving');
                } else {
                    carRef.current.classList.remove('is-driving');
                }
            }
        };

        const updatePosition = () => {
            const scrollTop = Math.max(
                window.pageYOffset || 0,
                document.documentElement.scrollTop || 0,
                document.body.scrollTop || 0
            );

            const docHeight = Math.max(
                document.documentElement.scrollHeight || 0,
                document.body.scrollHeight || 0
            );
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const scrollHeight = docHeight - windowHeight;
            const progress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;

            const carEl = carRef.current;
            const trackEl = progressTrackRef.current;

            if (carEl) {
                const carWidth = carEl.offsetWidth || 46;
                const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 360;

                // Starts just outside left edge, reaches and exits right edge at bottom of page
                const startX = -carWidth - 8;
                const endX = viewportWidth + 8;
                const currentX = startX + progress * (endX - startX);

                carEl.style.transform = `translate3d(${currentX}px, 0, 0)`;
            }

            if (trackEl) {
                trackEl.style.width = `${progress * 100}%`;
            }
        };

        const onScroll = () => {
            setDriving(true);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                setDriving(false);
            }, 180);

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(updatePosition);
        };

        const onResize = () => {
            updatePosition();
        };

        // MutationObserver to detect when portfolio modal opens / closes
        const observer = new MutationObserver(() => {
            const modalOpen = document.body.classList.contains('portfolio-modal-open');
            setIsModalOpen(modalOpen);
            if (!modalOpen) {
                requestAnimationFrame(updatePosition);
            }
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Touch & scroll listeners for smooth 60/120fps tracking
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('touchmove', onScroll, { passive: true });
        window.addEventListener('touchend', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('orientationchange', onResize, { passive: true });

        // Initial positions and fallbacks for dynamic image loading
        updatePosition();
        const timer1 = setTimeout(updatePosition, 150);
        const timer2 = setTimeout(updatePosition, 600);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('touchmove', onScroll);
            window.removeEventListener('touchend', onScroll);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div 
            className={`scroll-car-container ${isModalOpen ? 'is-hidden' : ''}`} 
            aria-hidden="true"
        >
            {/* Subtle road line indicator along bottom of screen */}
            <div className="scroll-road">
                <div className="scroll-road-progress" ref={progressTrackRef} />
            </div>

            {/* Moving Car Element */}
            <div
                ref={carRef}
                className="scroll-car-wrapper"
            >
                {/* Soft ambient headlight glow */}
                <div className="car-headlight-beam" />

                {/* Car Image - guaranteed aspect ratio */}
                <img
                    src="/car.png"
                    alt=""
                    className="scroll-car-img"
                    draggable="false"
                />

                {/* Exhaust puffs controlled by CSS class */}
                <div className="car-exhaust-smoke">
                    <span className="smoke-puff p1" />
                    <span className="smoke-puff p2" />
                </div>
            </div>
        </div>
    );
};

export default ScrollCar;
