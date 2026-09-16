import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import './ProjectDetail.css';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
        return (
            <div className="project-not-found">
                <h2>Project Not Found</h2>
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} /> Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="project-detail">
            <div className="container">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} /> Back to Portfolio
                </Link>

                <div className="project-header">
                    <h1 className="project-title">{project.title}</h1>
                    <span className="project-category">{project.category}</span>
                </div>

                <div className="project-content">
                    <div className="project-main-media">
                        {project.video ? (
                            <div className="video-wrapper">
                                {project.video.includes('youtube.com') || project.video.includes('youtu.be') ? (
                                    <iframe
                                        src={project.video.replace('watch?v=', 'embed/')}
                                        title={project.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        controls
                                        poster={project.poster || project.img}
                                        preload="metadata"
                                        playsInline
                                    >
                                        <source src={`${project.video}#t=0.1`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        ) : (
                            <div className="project-main-img">
                                <img src={project.img} alt={project.title} />
                            </div>
                        )}
                    </div>

                    <div className="project-info">
                        <div className="info-section">
                            <h3>About the Project</h3>
                            <p>{project.description}</p>
                        </div>

                        <div className="info-section">
                            <h3>Technologies Used</h3>
                            <div className="tech-tags">
                                {project.technologies.map((tech) => (
                                    <span key={tech} className="tech-tag">{tech}</span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="project-gallery">
                    <h3>Gallery</h3>
                    <div className="gallery-grid">
                        {project.gallery.map((img, index) => (
                            <div key={index} className="gallery-item">
                                <img src={img} alt={`${project.title} gallery ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
