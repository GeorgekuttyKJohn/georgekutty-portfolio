import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './VideoCharacter.css';

const VideoCharacter = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        // Ensure video is explicitly muted in DOM property so modern browsers allow autoplay
        video.muted = true;
        video.defaultMuted = true;

        let animationFrameId;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const processFrame = () => {
            if (video.paused || video.ended || video.readyState < 2) {
                animationFrameId = requestAnimationFrame(processFrame);
                return;
            }

            const w = canvas.width;
            const h = canvas.height;

            if (w === 0 || h === 0) {
                animationFrameId = requestAnimationFrame(processFrame);
                return;
            }

            // Draw current video frame
            ctx.drawImage(video, 0, 0, w, h);

            // Fetch pixel data
            const frame = ctx.getImageData(0, 0, w, h);
            const data = frame.data;
            const len = data.length;

            if (!window._chromaLogged2) {
                window._chromaLogged2 = true;
                // Sample 4 corners and mid-edge
                const p1 = 0; // (0,0)
                const p2 = (w - 10) * 4; // top right
                const p3 = (Math.floor(h / 2) * w + 10) * 4; // mid left
                console.log('SAMPLE_BG:',
                    'TopLeft:', data[p1], data[p1 + 1], data[p1 + 2],
                    'TopRight:', data[p2], data[p2 + 1], data[p2 + 2],
                    'MidLeft:', data[p3], data[p3 + 1], data[p3 + 2]
                );
            }

            for (let i = 0; i < len; i += 4) {
                const pixelIndex = i / 4;
                const x = pixelIndex % w;
                const y = Math.floor(pixelIndex / w);

                // 1. Clean perimeter borders & corner artifacts
                if (
                    y > h * 0.94 || // Floor border below shoes
                    y < h * 0.03 || // Ceiling above hair
                    (x > w * 0.90 && y > h * 0.90) // Bottom right corner logo/artifact
                ) {
                    data[i + 3] = 0;
                    continue;
                }

                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const maxRB = Math.max(r, b);

                // 2. Green studio keying (for character.mp4)
                const isGreenStudio =
                    (g > 55 && g > maxRB * 1.08) ||
                    (g > 35 && g > maxRB + 4) ||
                    (g > 45 && g > r && g > b);

                // 3. Light-blue studio keying (for character (2).mp4)
                // BG is pastel sky-blue: B: 170-230, G: 160-215, R: 140-190 (B > G > R)
                // Character: Black shirt/pants (RGB < 60), Skin (R > G > B, R > 150, B < 110)
                const isBlueStudio =
                    (b > 135 && g > 125 && b >= g - 6 && b - r >= 12) ||
                    (b > 115 && g > 105 && b >= g && b - r >= 10);

                if (isGreenStudio || isBlueStudio) {
                    data[i + 3] = 0;
                } else if (b > r + 8 && b > 125) {
                    // Soft edge despill for light blue: reduce blue tint on character contour
                    data[i + 2] = Math.max(r, g);
                } else if (g > maxRB && g > 45) {
                    // Soft edge despill for green
                    data[i + 1] = maxRB;
                }
            }

            // Put processed transparent frame back on canvas
            ctx.putImageData(frame, 0, 0);

            animationFrameId = requestAnimationFrame(processFrame);
        };

        const updateCanvasSize = () => {
            if (video.videoWidth && video.videoHeight) {
                const aspect = video.videoWidth / video.videoHeight;
                const targetWidth = Math.min(640, video.videoWidth);
                canvas.width = targetWidth;
                canvas.height = Math.round(targetWidth / aspect);
            }
        };

        const startPlayback = () => {
            updateCanvasSize();
            video.muted = true;
            video.play().catch(() => { });
        };

        // When video finishes playing once, smoothly fade out and hide
        const handleEnded = () => {
            setIsFadingOut(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 650);
        };

        video.addEventListener('loadedmetadata', startPlayback);
        video.addEventListener('canplay', startPlayback);
        video.addEventListener('ended', handleEnded);

        if (video.readyState >= 1) {
            startPlayback();
        }

        animationFrameId = requestAnimationFrame(processFrame);

        return () => {
            cancelAnimationFrame(animationFrameId);
            video.removeEventListener('loadedmetadata', startPlayback);
            video.removeEventListener('canplay', startPlayback);
            video.removeEventListener('ended', handleEnded);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={`video-character-container ${isFadingOut ? 'fading-out' : ''}`}
            aria-label="Animated Video Character"
        >
            {/* Hidden Source Video (Muted, Non-looping) */}
            <video
                ref={videoRef}
                src="/character (2).mp4"
                playsInline
                muted
                autoPlay
                className="video-character-source"
            />

            {/* Transparent Canvas Renderer */}
            <canvas ref={canvasRef} width={640} height={360} className="video-character-canvas" />

            {/* Dismiss Button */}
            <button
                type="button"
                className="video-character-dismiss-btn"
                onClick={() => {
                    setIsFadingOut(true);
                    setTimeout(() => setIsVisible(false), 300);
                }}
                title="Dismiss character"
                aria-label="Close character"
            >
                <X size={13} />
            </button>
        </div>
    );
};

export default VideoCharacter;
