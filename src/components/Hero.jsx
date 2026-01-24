import './Hero.css';
import FloatingBackground from './FloatingBackground';

const Hero = () => {
    return (
        <section className="hero-section">
            <FloatingBackground />
            <div className="container hero-container">
                <div className="hero-content">
                    <h1>
                        <span className="name-first">Georgekutty</span>
                        <br />
                        <span className="name-last">K John</span>
                    </h1>
                    <h2 className="hero-subtitle">Mechanical Engineer</h2>


                </div>
            </div>
        </section>
    );
};

export default Hero;
