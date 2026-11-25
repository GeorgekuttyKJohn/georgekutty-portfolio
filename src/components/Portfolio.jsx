import { useState, useEffect, useMemo } from 'react';
import { projects as initialProjects } from '../data/projects';
import { fetchGoogleSheetProjects } from '../utils/googleSheetProjects';
import { useLocation } from 'react-router-dom';
import { X, Play, Loader2 } from 'lucide-react';
import './Portfolio.css';

const Portfolio = () => {
    const [sheetItems, setSheetItems] = useState([]);
    const [isLoadingSheet, setIsLoadingSheet] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    const location = useLocation();

    useEffect(() => {
        const controller = new AbortController();

        const loadSheetProjects = async () => {
            try {
                const fetched = await fetchGoogleSheetProjects(undefined, controller.signal);
                setSheetItems(fetched);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.warn('Could not load Google Sheet projects, showing local projects only:', error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingSheet(false);
                }
            }
        };

        loadSheetProjects();
        return () => controller.abort();
    }, []);

    const mergedProjects = useMemo(() => {
        if (sheetItems.length === 0) return initialProjects;

        return initialProjects.map((cat) => {
            const matchingExtras = sheetItems
                .filter(({ category }) => {
                    const normalized = category.trim().toLowerCase();
                    return (
                        normalized === cat.title.toLowerCase() ||
                        normalized === cat.category.toLowerCase()
                    );
                })
                .map(({ item }) => item);

            if (matchingExtras.length === 0) return cat;

            return {
                ...cat,
                gallery: [...cat.gallery, ...matchingExtras]
            };
        });
    }, [sheetItems]);

    const selectedCategory = useMemo(
        () => mergedProjects.find((c) => c.id === selectedCategoryId) || null,
        [mergedProjects, selectedCategoryId]
    );

    useEffect(() => {
        if (selectedCategoryId) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('portfolio-modal-open');

            // Push history state so browser back button closes modal
            window.history.pushState({ portfolioModal: true }, '');

            const handlePopState = () => {
                setSelectedCategoryId(null);
                setSelectedProject(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        } else {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('portfolio-modal-open');
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('portfolio-modal-open');
        };
    }, [selectedCategoryId]);

    // Close modal when location changes (e.g. clicking nav links)
    useEffect(() => {
        if (selectedCategoryId) {
            closeCategory();
        }
    }, [location]);

    const openCategory = (category) => {
        setSelectedCategoryId(category.id);
    };

    const closeCategory = () => {
        if (window.history.state && window.history.state.portfolioModal) {
            window.history.back();
        } else {
            setSelectedCategoryId(null);
            setSelectedProject(null);
        }
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

                {isLoadingSheet && (
                    <div className="sheet-loading-status" aria-live="polite">
                        <Loader2 size={16} className="sheet-loading-spinner" />
                        <span>Syncing latest projects...</span>
                    </div>
                )}

                {/* 3 Main Category Cards Description */}
                <div className="portfolio-categories-grid">
                    {mergedProjects.map((category) => (
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
                                    {isLoadingSheet && (
                                        <div className="sheet-loading-status modal-loading-status" aria-live="polite">
                                            <Loader2 size={16} className="sheet-loading-spinner" />
                                            <span>Syncing latest projects...</span>
                                        </div>
                                    )}
                                    <div className="modal-gallery-grid">
                                        {selectedCategory.gallery.map((item, index) => (
                                            <div key={index} className="gallery-item" onClick={() => openProject(item)}>
                                                {item.type === 'video' ? (
                                                    <div className="video-wrapper">
                                                        {item.isEmbed ? (
                                                            <img src={item.thumbnail || item.src} alt={item.title || `Project ${index + 1}`} />
                                                        ) : (
                                                            <video autoPlay loop muted playsInline>
                                                                <source src={item.src} type="video/mp4" />
                                                            </video>
                                                        )}
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
                                                selectedProject.isEmbed ? (
                                                    <iframe
                                                        className="detail-embed-frame"
                                                        src={selectedProject.src}
                                                        title={selectedProject.title}
                                                        allow="autoplay; encrypted-media"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <video autoPlay loop muted playsInline controls>
                                                        <source src={selectedProject.src} type="video/mp4" />
                                                    </video>
                                                )
                                            ) : (
                                                <img src={selectedProject.src} alt={selectedProject.title} />
                                            )}
                                        </div>

                                        <div className="detail-info">
                                            <h1>{selectedProject.title}</h1>
                                            {selectedProject.description && (
                                                <p className="detail-description">{selectedProject.description}</p>
                                            )}

                                            {selectedProject.software && selectedProject.software.length > 0 && (
                                                <div className="detail-meta">
                                                    <h3>Software Used</h3>
                                                    <div className="tech-tags">
                                                        {selectedProject.software.map((tech, i) => (
                                                            <span key={i} className="tech-tag">{tech}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

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
