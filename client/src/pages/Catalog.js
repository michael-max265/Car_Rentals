import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCarStore from '../store/useCarStore';
import CarQuiz from '../components/CarQuiz';
import './Catalog.css';

function Catalog() {
  const { cars, loading, error, fetchCars } = useCarStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Extract unique fuel categories
  const categories = useMemo(() => {
    if (!cars) return ['All'];
    const fuels = new Set(cars.map((c) => c.specs?.fuel || 'Other'));
    return ['All', ...Array.from(fuels)];
  }, [cars]);

  // Filter cars based on search input and fuel category
  const filteredCars = useMemo(() => {
    if (!cars) return [];
    return cars.filter((car) => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            car.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || (car.specs?.fuel === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [cars, searchQuery, selectedCategory]);

  return (
    <div className="catalog-page-container">
      <div className="catalog-hero">
        <h1>Explore Our Premium Fleet</h1>
        <p>Choose from over 20 state-of-the-art vehicles equipped with immersive 3D customization options.</p>
      </div>

      {/* Interactive recommendation quiz */}
      <CarQuiz cars={cars} onSelectCar={(carId) => navigate(`/showroom?carId=${carId}`)} />

      {/* Filter and Search Section */}
      <div className="catalog-filter-bar">
        <div className="search-box-wrap">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by model or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="catalog-search-input"
          />
        </div>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {loading && (
        <div className="catalog-grid-loading">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="catalog-card-skeleton animate-pulse" />
          ))}
        </div>
      )}

      {error && <div className="catalog-error">Failed to load fleet: {error}</div>}

      {!loading && !error && filteredCars.length === 0 && (
        <div className="catalog-no-results">
          <h3>No vehicles match your criteria</h3>
          <p>Try resetting the search or category filters.</p>
        </div>
      )}

      {!loading && !error && filteredCars.length > 0 && (
        <div className="catalog-grid">
          {filteredCars.map((car) => (
            <div key={car.id} className="catalog-card">
              <div className="card-image-wrap">
                {car.image ? (
                  <img src={car.image} alt={car.name} className="card-image" />
                ) : (
                  <div className="card-fallback-color" style={{ backgroundColor: car.color }} />
                )}
                <div className="card-badge">{car.specs?.fuel || 'Premium'}</div>
              </div>

              <div className="card-body">
                <div className="card-title-row">
                  <h3>{car.name}</h3>
                  <span className="card-price">{car.price}</span>
                </div>
                
                <p className="card-description">{car.description}</p>

                {/* Specs Section */}
                <div className="card-specs-row">
                  <div className="card-spec-item">
                    <span className="spec-val">{car.specs?.seats || 5}</span>
                    <span className="spec-lbl">Seats</span>
                  </div>
                  <div className="card-spec-item">
                    <span className="spec-val">{car.specs?.range || '300mi'}</span>
                    <span className="spec-lbl">Range</span>
                  </div>
                  <div className="card-spec-item">
                    <span className="spec-val">{car.specs?.transmission?.split(' ')[0] || 'Auto'}</span>
                    <span className="spec-lbl">Gearbox</span>
                  </div>
                </div>

                <button
                  className="card-cta-btn"
                  onClick={() => navigate(`/showroom?carId=${car.id}`)}
                >
                  View in 3D Showroom
                  <svg className="cta-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;
