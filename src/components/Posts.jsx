import { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import './Posts.css';

// Convert Google Drive share URL to direct image URL
function getDirectImageUrl(url) {
    if (!url) return '';
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (driveOpen) return `https://drive.google.com/uc?export=view&id=${driveOpen[1]}`;
    return url;
}

// Generate stable unique key for each post (for serverless global like count)
function getPostKey(post) {
    if (!post) return '';
    const raw = (post['Date'] || '') + '_' + (post['Content'] || '').slice(0, 35);
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return `gk_post_${Math.abs(hash)}`;
}

// Extract all valid image URLs from a post row (supports comma-separated URLs or Image URL 2 column)
function getPostImages(post) {
    if (!post) return [];
    const urls = [];
    const possibleKeys = ['Image URL', 'Image URL 1', 'Image URL 2', 'Image 1', 'Image 2', 'Image', 'Images'];
    possibleKeys.forEach(key => {
        if (post[key]) {
            // Split on comma or newline to support multiple URLs in one cell
            const parts = post[key].split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
            parts.forEach(u => {
                if (u.startsWith('http') && !urls.includes(u)) {
                    urls.push(u);
                }
            });
        }
    });
    return urls;
}

// Google Sheets published CSV URL
const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQvX_lm8YZBNYnkV6JK5nSJq2pm0ma0pdavx5EbpDhbGe1Al6hfVdTnHrsrXYnCEhtCK6sv9FiXDPmT/pub?output=csv';

// Parse CSV text — handles multi-line quoted fields
function parseCSV(csvText) {
    let current = '';
    let inQuotes = false;
    const fields = [];
    const allRows = [];

    for (let i = 0; i < csvText.length; i++) {
        const ch = csvText[i];
        const next = csvText[i + 1];
        if (ch === '"') {
            if (inQuotes && next === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            fields.push(current.trim()); current = '';
        } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
            if (ch === '\r') i++;
            fields.push(current.trim()); current = '';
            allRows.push([...fields]); fields.length = 0;
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    if (fields.some(f => f)) allRows.push([...fields]);

    if (allRows.length < 2) return [];
    const headers = allRows[0].map(h => h.replace(/^"|"$/g, '').trim());
    return allRows.slice(1).map((cols, idx) => {
        const obj = { id: idx + 1 };
        headers.forEach((h, i) => { obj[h] = (cols[i] || '').replace(/^"|"$/g, ''); });
        return obj;
    }).filter(row => row['Content'] && row['Content'].trim().length > 0);
}

const VISIBLE = 3; // cards visible at once

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [current, setCurrent] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
    const [selectedPost, setSelectedPost] = useState(null);
    const [likes, setLikes] = useState({});
    const [userLiked, setUserLiked] = useState(() => {
        try {
            const stored = localStorage.getItem('gk_user_liked_posts');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const trackRef = useRef(null);
    const cardRef = useRef(null);

    const closeModal = () => setSelectedPost(null);

    // Escape key listener & body scroll locking when modal is open
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        if (selectedPost) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPost]);

    // Fetch live like counts for all loaded posts
    useEffect(() => {
        if (posts.length === 0) return;
        posts.forEach(post => {
            const key = getPostKey(post);
            fetch(`https://countapi.mileshilliard.com/api/v1/get/${key}`)
                .then(res => res.json())
                .then(data => {
                    if (data && typeof data.value === 'number') {
                        setLikes(prev => ({ ...prev, [key]: data.value }));
                    }
                })
                .catch(() => {});
        });
    }, [posts]);

    // Handle like click (optimistic update + serverless count API hit)
    const handleLike = (post, e) => {
        if (e) e.stopPropagation();
        const key = getPostKey(post);
        const isAlreadyLiked = userLiked.includes(key);

        if (isAlreadyLiked) return; // Prevent multiple likes by same user

        // Optimistic UI update
        setLikes(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        const newLiked = [...userLiked, key];
        setUserLiked(newLiked);
        try {
            localStorage.setItem('gk_user_liked_posts', JSON.stringify(newLiked));
        } catch {}

        // Hit global count API
        fetch(`https://countapi.mileshilliard.com/api/v1/hit/${key}`)
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.value === 'number') {
                    setLikes(prev => ({ ...prev, [key]: data.value }));
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        fetch(SHEET_CSV_URL)
            .then(res => { if (!res.ok) throw new Error(); return res.text(); })
            .then(csv => {
                const parsed = parseCSV(csv);
                // Sort by date descending — most recent first (DD/MM/YYYY format)
                parsed.sort((a, b) => {
                    const toDate = str => {
                        if (!str) return 0;
                        const parts = str.trim().split('/');
                        if (parts.length === 3) {
                            // DD/MM/YYYY → YYYY-MM-DD for correct comparison
                            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                        }
                        return new Date(str).getTime() || 0;
                    };
                    return toDate(b['Date']) - toDate(a['Date']);
                });
                setPosts(parsed);
                setLoading(false);
            })
            .catch(() => { setError(true); setLoading(false); });
    }, []);

    // Measure card width on resize
    useEffect(() => {
        const measure = () => {
            if (cardRef.current) {
                const gap = 18;
                setCardWidth(cardRef.current.offsetWidth + gap);
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [posts]);

    // Recalculate visible count based on screen width
    const getVisible = () => {
        const w = window.innerWidth;
        if (w <= 580) return 1;
        if (w <= 900) return 2;
        return 3;
    };
    const visibleCount = getVisible();
    const maxIndex = Math.max(0, posts.length - visibleCount);

    const prev = () => setCurrent(c => Math.max(0, c - 1));
    const next = () => setCurrent(c => Math.min(maxIndex, c + 1));

    // Clamp current on resize
    useEffect(() => {
        setCurrent(c => Math.min(c, maxIndex));
    }, [maxIndex]);

    return (
        <section className="section posts-section">
            <div className="container">
                <div className="posts-header">
                    <h2 className="section-title">POSTS</h2>
                    <div className="posts-subtitle">
                        <span>Latest updates from my</span>
                        <span className="linkedin-badge">
                            <FaLinkedin /> LinkedIn Feed
                        </span>
                    </div>
                </div>

                {loading && (
                    <div className="posts-loading">
                        <div className="posts-loading-spinner"></div>
                        <p>Loading posts...</p>
                    </div>
                )}
                {error && (
                    <div className="posts-empty">
                        <p>⚠️ Posts load ചെയ്യാൻ കഴിഞ്ഞില്ല. Google Sheet public ആണോ എന്ന് check ചെയ്യൂ.</p>
                    </div>
                )}
                {!loading && !error && posts.length === 0 && (
                    <div className="posts-empty">
                        <p>Google Sheet-ൽ ഇതുവരെ posts ഒന്നും add ചെയ്തിട്ടില്ല.</p>
                    </div>
                )}

                {!loading && !error && posts.length > 0 && (
                    <div className="carousel-wrapper">
                        {/* Left Arrow */}
                        <button
                            className={`carousel-arrow carousel-arrow-left ${current === 0 ? 'disabled' : ''}`}
                            onClick={prev}
                            disabled={current === 0}
                            aria-label="Previous posts"
                        >
                            <FaChevronLeft />
                        </button>

                        {/* Sliding Track */}
                        <div className="carousel-viewport">
                            <div
                                className="carousel-track"
                                ref={trackRef}
                                style={{ transform: `translateX(-${current * (cardWidth || 0)}px)` }}
                            >
                            {posts.map((post, i) => (
                                <div
                                    className="post-card"
                                    key={post.id}
                                    ref={i === 0 ? cardRef : null}
                                    onClick={() => setSelectedPost(post)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedPost(post);
                                        }
                                    }}
                                    title="Click to view full post"
                                >
                                    {/* Image */}
                                    {(() => {
                                        const cardImages = getPostImages(post);
                                        if (cardImages.length === 0) {
                                            return (
                                                <div className="post-card-image post-card-image--placeholder">
                                                    <FaLinkedin size={32} />
                                                </div>
                                            );
                                        }
                                        if (cardImages.length === 1) {
                                            return (
                                                <div className="post-card-image">
                                                    <img
                                                        src={getDirectImageUrl(cardImages[0])}
                                                        alt="Post media"
                                                        onError={e => { e.target.parentElement.style.display = 'none'; }}
                                                    />
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="post-card-image post-card-image--multi">
                                                <div className="post-card-image-grid">
                                                    {cardImages.slice(0, 2).map((imgUrl, imgIdx) => (
                                                        <img
                                                            key={imgIdx}
                                                            src={getDirectImageUrl(imgUrl)}
                                                            alt={`Post media ${imgIdx + 1}`}
                                                            onError={e => { e.target.style.display = 'none'; }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="post-card-image-badge">{cardImages.length} Photos</span>
                                            </div>
                                        );
                                    })()}

                                    {/* Body */}
                                    <div className="post-card-body">
                                        <p className="post-card-caption">{post['Content']}</p>
                                        <span className="post-card-readmore">Read more →</span>
                                    </div>

                                    {/* Footer */}
                                    <div className="post-card-footer">
                                        {post['Date'] && <span className="post-card-date">{post['Date']}</span>}
                                        <div className="post-card-footer-actions">
                                            {(() => {
                                                const pKey = getPostKey(post);
                                                const isLiked = userLiked.includes(pKey);
                                                const count = likes[pKey] || 0;
                                                return (
                                                    <button
                                                        type="button"
                                                        className={`post-like-btn ${isLiked ? 'liked' : ''}`}
                                                        onClick={(e) => handleLike(post, e)}
                                                        title={isLiked ? 'You liked this post' : 'Like this post'}
                                                        aria-label="Like post"
                                                    >
                                                        {isLiked ? <FaHeart className="heart-icon liked" size={13} /> : <FaRegHeart className="heart-icon" size={13} />}
                                                        <span className="like-count">{count}</span>
                                                    </button>
                                                );
                                            })()}
                                            {post['Post Link'] && (
                                                <a
                                                    href={post['Post Link']}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="post-card-link"
                                                    title="View on LinkedIn"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View <FaExternalLinkAlt size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                            className={`carousel-arrow carousel-arrow-right ${current >= maxIndex ? 'disabled' : ''}`}
                            onClick={next}
                            disabled={current >= maxIndex}
                            aria-label="Next posts"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}

                {/* Dots */}
                {!loading && !error && posts.length > visibleCount && (
                    <div className="carousel-dots">
                        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                            <button
                                key={i}
                                className={`carousel-dot ${i === current ? 'active' : ''}`}
                                onClick={() => setCurrent(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className="posts-footer-banner">
                    <p>Connect with me professionally on LinkedIn</p>
                    <a
                        href="https://www.linkedin.com/in/georgekutty-k-john/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaLinkedin size={16} /> Follow on LinkedIn
                    </a>
                </div>
            </div>

            {/* Post Enlarged Detail Modal */}
            {selectedPost && (
                <div
                    className="post-modal-backdrop"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="post-modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="post-modal-header">
                            <div className="post-modal-meta">
                                <span className="linkedin-badge">
                                    <FaLinkedin /> LinkedIn Post
                                </span>
                                {selectedPost['Date'] && (
                                    <span className="post-modal-date">{selectedPost['Date']}</span>
                                )}
                            </div>
                            <button
                                className="post-modal-close-icon"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="post-modal-body">
                            {(() => {
                                const modalImages = getPostImages(selectedPost);
                                if (modalImages.length === 0) return null;
                                if (modalImages.length === 1) {
                                    return (
                                        <div className="post-modal-image-wrap">
                                            <img
                                                src={getDirectImageUrl(modalImages[0])}
                                                alt="Post media enlarged"
                                                className="post-modal-image"
                                                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                            />
                                        </div>
                                    );
                                }
                                return (
                                    <div className="post-modal-images-grid">
                                        {modalImages.map((imgUrl, imgIdx) => (
                                            <div className="post-modal-image-wrap" key={imgIdx}>
                                                <img
                                                    src={getDirectImageUrl(imgUrl)}
                                                    alt={`Post media enlarged ${imgIdx + 1}`}
                                                    className="post-modal-image"
                                                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                            <div className="post-modal-caption">
                                {selectedPost['Content']}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="post-modal-footer">
                            {(() => {
                                const pKey = getPostKey(selectedPost);
                                const isLiked = userLiked.includes(pKey);
                                const count = likes[pKey] || 0;
                                return (
                                    <button
                                        type="button"
                                        className={`post-like-btn post-modal-like-btn ${isLiked ? 'liked' : ''}`}
                                        onClick={(e) => handleLike(selectedPost, e)}
                                        title={isLiked ? 'You liked this post' : 'Like this post'}
                                        aria-label="Like post"
                                    >
                                        {isLiked ? <FaHeart className="heart-icon liked" size={15} /> : <FaRegHeart className="heart-icon" size={15} />}
                                        <span>{count} {count === 1 ? 'Like' : 'Likes'}</span>
                                    </button>
                                );
                            })()}
                            {selectedPost['Post Link'] && (
                                <a
                                    href={selectedPost['Post Link']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary post-modal-link-btn"
                                >
                                    <FaLinkedin size={15} /> View on LinkedIn <FaExternalLinkAlt size={11} />
                                </a>
                            )}
                            <button
                                type="button"
                                className="post-modal-close-btn"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Posts;
