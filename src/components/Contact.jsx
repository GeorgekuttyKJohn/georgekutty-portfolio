import { useState } from 'react';
import { Mail, Send, User, MessageSquare, Linkedin, Instagram } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [showPopup, setShowPopup] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const handleIframeLoad = () => {
        if (submitted) {
            setShowPopup(true);
            setFormData({ name: '', email: '', message: '' });
            setSubmitted(false);

            // Hide popup after 3 seconds
            setTimeout(() => {
                setShowPopup(false);
            }, 3000);
        }
    };

    return (
        <section className="section contact-section" id="contact">
            <div className="container">
                <h2 className="section-title">GET IN TOUCH</h2>

                <div className="contact-content">
                    <div className="contact-text">
                        <h3>Let's Work Together</h3>
                        <p>Have a project in mind or want to discuss a potential collaboration? I'd love to hear from you. Fill out the form or send me an email directly.</p>

                        <div className="contact-direct">
                            <div className="contact-method">
                                <Mail className="contact-icon" size={24} />
                                <span>georgekuttykochumuriyil@gmail.com</span>
                            </div>

                            <div className="social-links">
                                <a href="https://www.linkedin.com/in/georgekutty-k-john/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                                    <Linkedin size={24} />
                                </a>
                                <a href="https://www.instagram.com/mr_george__kutty?igsh=MWFobHpybzNuMWlwZA==" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                                    <Instagram size={24} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <iframe
                        name="hidden_iframe"
                        id="hidden_iframe"
                        style={{ display: 'none' }}
                        onLoad={handleIframeLoad}
                    ></iframe>

                    <form
                        className="contact-form"
                        action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSeOj3BlW_WChpeJNT6KcQz9L4cJQapE4xTUtGF6FRnMrD-F2A/formResponse"
                        method="POST"
                        target="hidden_iframe"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="name">
                                <User size={18} /> Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="entry.726747389"
                                value={formData.name}
                                onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <Mail size={18} /> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="entry.125047873"
                                value={formData.email}
                                onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } })}
                                placeholder="Your Email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">
                                <MessageSquare size={18} /> Message
                            </label>
                            <textarea
                                id="message"
                                name="entry.1215520573"
                                value={formData.message}
                                onChange={(e) => handleChange({ target: { name: 'message', value: e.target.value } })}
                                placeholder="Tell me about your project..."
                                rows="5"
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn" disabled={submitted}>
                            <Send size={18} /> {submitted ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>

            {showPopup && (
                <div className="popup-notification">
                    <div className="popup-content">
                        <div className="popup-icon">✓</div>
                        <h3>Message Sent!</h3>
                        <p>Thank you for reaching out.</p>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Contact;
