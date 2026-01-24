import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Resume from './components/Resume';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import ProjectDetail from './components/ProjectDetail';

import FloatingBackground from './components/FloatingBackground';
import ScrollToHash from './components/ScrollToHash';

const HomePage = () => (
  <>
    <div id="home">
      <Hero />
    </div>
    <div id="about">
      <About />
    </div>
    <div id="resume">
      <Resume />
    </div>
    <div id="portfolio">
      <Portfolio />
    </div>
    <div id="contact">
      <Contact />
    </div>
  </>
);

function App() {
  return (
    <Router>
      <ScrollToHash />
      <div className="App">
        <FloatingBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
