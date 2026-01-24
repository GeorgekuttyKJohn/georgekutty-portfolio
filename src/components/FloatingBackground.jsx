import {
    Pencil, Ruler, Palette,
    Film, Video, Scissors,
    Settings, Wrench, Compass,
    Cpu, Hammer, PenTool
} from 'lucide-react';
import './FloatingBackground.css';

const FloatingBackground = () => {
    const icons = [
        { Icon: Pencil, size: 40, top: '10%', left: '5%', delay: '0s' },
        { Icon: Ruler, size: 30, top: '25%', left: '85%', delay: '1s' },
        { Icon: Palette, size: 35, top: '70%', left: '15%', delay: '2s' },
        { Icon: Film, size: 45, top: '40%', left: '90%', delay: '3s' },
        { Icon: Video, size: 38, top: '85%', left: '80%', delay: '4s' },
        { Icon: Scissors, size: 32, top: '15%', left: '70%', delay: '5s' },
        { Icon: Settings, size: 50, top: '50%', left: '5%', delay: '1.5s' },
        { Icon: Wrench, size: 42, top: '30%', left: '20%', delay: '2.5s' },
        { Icon: Compass, size: 36, top: '65%', left: '95%', delay: '3.5s' },
        { Icon: Cpu, size: 44, top: '5%', left: '50%', delay: '0.5s' },
        { Icon: Hammer, size: 34, top: '90%', left: '40%', delay: '4.5s' },
        { Icon: PenTool, size: 38, top: '60%', left: '50%', delay: '1.2s' },
    ];

    return (
        <div className="floating-background">
            {icons.map((item, index) => (
                <div
                    key={index}
                    className="floating-icon"
                    style={{
                        top: item.top,
                        left: item.left,
                        animationDelay: item.delay,
                        opacity: 0.2
                    }}
                >
                    <item.Icon size={item.size} strokeWidth={1.5} />
                </div>
            ))}
        </div>
    );
};

export default FloatingBackground;
