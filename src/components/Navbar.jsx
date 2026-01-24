import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const getNavLink = (id) => {
        return isHome ? `#${id}` : `/#${id}`;
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <div className="nav-links-desktop">
                    <Link to="/">Home</Link>
                    <a href={getNavLink('about')}>About</a>
                    <a href={getNavLink('resume')}>Resume</a>
                    <a href={getNavLink('portfolio')}>Portfolio</a>
                    <a href={getNavLink('contact')}>Contact</a>
                </div>

                <div className="hamburger" onClick={toggleMenu}>
                    <div className={`bar ${isOpen ? 'open' : ''}`}></div>
                    <div className={`bar ${isOpen ? 'open' : ''}`}></div>
                    <div className={`bar ${isOpen ? 'open' : ''}`}></div>
                </div>

                <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={toggleMenu}>Home</Link>
                    <a href={getNavLink('about')} onClick={toggleMenu}>About</a>
                    <a href={getNavLink('resume')} onClick={toggleMenu}>Resume</a>
                    <a href={getNavLink('portfolio')} onClick={toggleMenu}>Portfolio</a>
                    <a href={getNavLink('contact')} onClick={toggleMenu}>Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
