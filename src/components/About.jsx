import './About.css';

const About = () => {
    return (
        <section className="section about-section">
            <div className="container about-container">

                <div className="about-text">
                    <h2 className="section-title">ABOUT</h2>
                    <div className="about-description">
                        <p>
                            I'm a Mechanical Engineer. Currently, I'm a Business Support Engineer at CADD Centre, Pala.
                        </p>
                        <p>
                            I am a versatile mechanical engineer (B.Tech) with a career defined by technical precision and creative expression. My professional journey includes experience as a Management Trainee at Popular Vehicles and Services.
                        </p>
                        <p>
                            I bridge the gap between traditional engineering and modern digital solutions. I am proficient in industry-standard engineering tools like SolidWorks, ANSYS, and AutoCAD, while simultaneously possessing a strong command of web technologies including React, HTML, CSS, and JavaScript.
                        </p>
                        <p>
                            Beyond technical development, I bring stories to life through professional video editing and content creation. Using Adobe Premiere Pro, After Effects, and DaVinci Resolve, I craft high-impact visual narratives and responsive websites that merge engineering logic with artistic flair.
                        </p>
                    </div>
                </div>

                <div className="about-image">
                    <img src="/about-image.jpg" alt="Georgekutty K John" />
                </div>

            </div>
        </section>
    );
};

export default About;
