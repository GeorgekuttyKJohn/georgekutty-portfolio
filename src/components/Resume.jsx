import {
    SiDassaultsystemes,
    SiAutocad,
    SiAnsys,
    SiReact,
    SiJavascript,
    SiAdobepremierepro,
    SiAdobeaftereffects,
    SiGoogle
} from 'react-icons/si';
import './Resume.css';

const CatiaIcon = ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="#005686" />
        <path d="M16 4.5L26.5 10.6V21.4L16 27.5L5.5 21.4V10.6L16 4.5Z" fill="#003355" />
        <path d="M16 4.5L26.5 10.6L16 16.7L5.5 10.6L16 4.5Z" fill="#0077B6" />
        <path d="M16 16.7L26.5 10.6V21.4L16 27.5V16.7Z" fill="#00A8E8" />
        <text x="16" y="21" fontStyle="italic" fontWeight="900" fontSize="7.5" fill="#FFFFFF" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">CATIA</text>
    </svg>
);

const Resume = () => {
    return (
        <section className="section resume-section">
            <div className="container">

                {/* Navigation/Tabs for Resume could be added here if needed, but per design it's a single view */}

                <div className="resume-grid">

                    {/* Column 1: Skills */}
                    <div className="resume-col">
                        <h3 className="resume-title">SOFTWARE SKILLS</h3>
                        <div className="software-icons-grid">
                            <div className="software-icon-item">
                                <SiDassaultsystemes size={30} color="#005686" />
                                <span>SolidWorks</span>
                            </div>
                            <div className="software-icon-item">
                                <CatiaIcon size={30} />
                                <span>CATIA</span>
                            </div>
                            <div className="software-icon-item">
                                <SiAutocad size={30} color="#E51937" />
                                <span>AutoCAD</span>
                            </div>
                            <div className="software-icon-item">
                                <SiAnsys size={30} color="#FFB100" />
                                <span>ANSYS</span>
                            </div>
                            <div className="software-icon-item">
                                <SiReact size={30} color="#61dafb" />
                                <span>React JS</span>
                            </div>
                            <div className="software-icon-item">
                                <SiJavascript size={30} color="#f7df1e" />
                                <span>JavaScript</span>
                            </div>
                            <div className="software-icon-item">
                                <SiAdobepremierepro size={30} color="#9999ff" />
                                <span>Premiere Pro</span>
                            </div>
                            <div className="software-icon-item">
                                <SiAdobeaftereffects size={30} color="#9999ff" />
                                <span>After Effects</span>
                            </div>
                            <div className="software-icon-item">
                                <SiGoogle size={30} color="#4285F4" />
                                <span>Antigravity</span>
                            </div>
                        </div>

                        <h3 className="resume-title" style={{ marginTop: '40px' }}>LANGUAGES</h3>
                        <div className="skills-list">
                            <SkillBar name="English" level="100%" />
                            <SkillBar name="Malayalam" level="100%" />
                            <SkillBar name="Hindi" level="50%" />
                            <SkillBar name="Tamil" level="50%" />
                        </div>

                        <h3 className="resume-title" style={{ marginTop: '40px' }}>PERSONAL SKILLS</h3>
                        <div className="personal-skills">
                            <ul className="personal-skills-list">
                                <li>Leadership</li>
                                <li>Plant management</li>
                                <li>Team collaboration</li>
                                <li>Ability to learn, adapt and grow</li>
                                <li>Ability to communicate</li>
                                <li>Problem solving</li>
                                <li>Time management</li>
                                <li>Positive attitude</li>
                                <li>Technical proficiency</li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Experience & Education */}
                    <div className="resume-col">
                        <h3 className="resume-title">EXPERIENCE</h3>
                        <div className="timeline">
                            <TimelineItem
                                year="Present"
                                title="CADD CENTRE, PALA"
                                subtitle="Business Support Engineer"
                            />
                            <TimelineItem
                                year="Previous"
                                title="KONDODY AUTOCRAFT"
                                subtitle="Asst. Production Engineer"
                            />
                            <TimelineItem
                                year="Previous"
                                title="POPULAR VEHICLES AND SERVICES"
                                subtitle="Management Trainee"
                            />
                        </div>

                        <h3 className="resume-title" style={{ marginTop: '40px' }}>EDUCATION</h3>
                        <div className="education-item">
                            <p className="edu-degree">B.Tech in Mechanical Engineering</p>
                        </div>
                    </div>

                    {/* Column 3: Misc */}
                    <div className="resume-col">
                        <h3 className="resume-title">WHAT CAN I DO?</h3>
                        <div className="info-block">
                            <p>3D Modeling & Mechanical Design</p>
                            <p>Advanced CAD Drafting & Documentation</p>
                            <p>Full-Stack Web Development</p>
                            <p>Professional Video Editing</p>

                            <p>AI-Driven Process Optimization</p>
                        </div>

                        <h3 className="resume-title" style={{ marginTop: '40px' }}>DESIGN SKILLS</h3>
                        <div className="info-block">
                            <p>UI/UX Design Principles</p>
                            <p>Visual Storytelling & Narrative</p>
                            <p>Product Visualization & Rendering</p>
                            <p>Design for Manufacturing (DFM)</p>
                            <p>Responsive Layout & Grid systems</p>
                            <p>Digital Prototyping</p>
                        </div>

                        <h3 className="resume-title" style={{ marginTop: '40px' }}>HOBBIES & INTERESTS</h3>
                        <div className="hobbies-grid">
                            <div className="hobby-item">Videography</div>
                            <div className="hobby-item">Video Editing</div>
                            <div className="hobby-item">Content creation</div>
                            <div className="hobby-item">Meme creation</div>
                            <div className="hobby-item">Die-cast Model Collecting</div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

const SkillBar = ({ name, level }) => (
    <div className="skill-item">
        <div className="skill-info">
            <span>{name}</span>
        </div>
        <div className="skill-bar-bg">
            <div className="skill-bar-fill" style={{ width: level }}>
                <div className="skill-circle"></div>
            </div>
        </div>
    </div>
);

const TimelineItem = ({ year, title, subtitle }) => (
    <div className="timeline-item">
        <div className="timeline-marker">
            <div className="timeline-year">{year}</div>
            <div className="timeline-dot"></div>
        </div>
        <div className="timeline-content">
            <h4 className="timeline-title">{title}</h4>
            <p className="timeline-subtitle">{subtitle}</p>
        </div>
    </div>
);

export default Resume;
