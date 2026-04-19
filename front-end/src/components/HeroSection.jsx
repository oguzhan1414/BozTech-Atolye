import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiCode, FiAward } from 'react-icons/fi';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>#AtolyeBozok</span>
            </div>
            <h1 className="hero-title">
              Geleceği <span className="highlight">Birlikte</span> Kodluyoruz
            </h1>
            <p className="hero-description">
              Yozgat Bozok Universitesi'nde yapay zekadan mobil uygulamalara, robotikten siber guvenlige kadar genis bir yelpazede projeler gelistiriyoruz.
              Teoriyi pratige donusturmek icin aramiza katil.
            </p>
            
          
            
            <div className="hero-buttons">
              <Link to="/apply" className="btn btn-primary btn-lg">
                Aramiza Katil <FiArrowRight />
              </Link>
              <Link to="/club-info" className="btn btn-outline btn-lg">
                Toplulugu Kesfet
              </Link>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="hero-image-container">
              {/* Buraya görsel ekleyebilirsin */}
              <div className="image-placeholder">
                <div className="code-snippet">
                  <pre>{`
function innovate() {
  const ideas = getIdeas();
  const team = getTeam();
  return buildFuture(ideas, team);
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;