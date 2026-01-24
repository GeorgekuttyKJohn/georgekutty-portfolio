import { useState, useEffect } from 'react';
import { projects } from '../data/projects';
import { useLocation } from 'react-router-dom';
import { X, Play } from 'lucide-react';
import './Portfolio.css';

const Portfolio = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    const location = useLocation();

    useEffect(() => {
        if (selectedCategory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto'; // Or '' to remove inline style
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedCategory]);

    // Close modal when location changes (e.g. clicking nav links)
    useEffect(() => {
        if (selectedCategory) {
            closeCategory();
        }
    }, [location]);

    const openCategory = (category) => {
        setSelectedCategory(category);
    };

    const closeCategory = () => {
        setSelectedCategory(null);
        setSelectedProject(null);
    };

    const openProject = (project) => {
        setSelectedProject(project);
    };

    const closeProject = (e) => {
        e.stopPropagation();
        setSelectedProject(null);
    };

    return (
        <section className="section portfolio-section" id="portfolio">
            <div className="container">
                <h2 className="section-title">PORTFOLIO</h2>

                {/* 3 Main Category Cards Description */}
                <div className="portfolio-categories-grid">
                    {projects.map((category) => (
                        <div
                            key={category.id}
                            className="category-card"
                            onClick={() => openCategory(category)}
                        >
                            <div className="category-img-wrapper">
                                <img src={category.img} alt={category.title} />
                                <div className="category-overlay">
                                    <h3>{category.title}</h3>
                                    <p>Tap to view gallery</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Full Screen Modal */}
                {selectedCategory && (
                    <div className="portfolio-modal-overlay">
                        <button className="modal-close-btn" onClick={closeCategory}>
                            <X size={32} />
                        </button>

                        <div className="modal-content">
                            {!selectedProject ? (
                                <>
                                    <button className="back-btn" onClick={closeCategory}>
                                        ← Back to Portfolio
                                    </button>
                                    <h2 className="modal-title">{selectedCategory.title}</h2>
                                    <div className="modal-gallery-grid">
                                        {selectedCategory.gallery.map((item, index) => (
                                            <div key={index} className="gallery-item" onClick={() => openProject(item)}>
                                                {item.type === 'video' ? (
                                                    <div className="video-wrapper">
                                                        <video autoPlay loop muted playsInline>
                                                            <source src={item.src} type="video/mp4" />
                                                        </video>
                                                        <div className="video-indicator"><Play size={20} fill="white" /></div>
                                                    </div>
                                                ) : (
                                                    <img src={item.src} alt={item.title || `Project ${index + 1}`} />
                                                )}
                                                <div className="gallery-item-overlay">
                                                    <span>View Details</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="project-detail-view">
                                    <button className="back-btn" onClick={closeProject}>
                                        ← Back to Gallery
                                    </button>

                                    <div className="detail-container">
                                        <div className="detail-media">
                                            {selectedProject.type === 'video' ? (
                                                <video autoPlay loop muted playsInline controls>
                                                    <source src={selectedProject.src} type="video/mp4" />
                                                </video>
                                            ) : (
                                                <img src={selectedProject.src} alt={selectedProject.title} />
                                            )}
                                        </div>

                                        <div className="detail-info">
                                            <h1>{selectedProject.title}</h1>
                                            <p className="detail-description">{selectedProject.description}</p>

                                            <div className="detail-meta">
                                                <h3>Software Used</h3>
                                                <div className="tech-tags">
                                                    {selectedProject.software?.map((tech, i) => (
                                                        <span key={i} className="tech-tag">{tech}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedProject.link && selectedProject.link !== '#' && (
                                                <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                                                    Visit Project
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Portfolio;
