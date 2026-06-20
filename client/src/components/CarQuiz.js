import React, { useState } from 'react';
import './CarQuiz.css';

const QUESTIONS = [
  {
    id: 'purpose',
    title: 'What is the primary purpose of your rental?',
    options: [
      { id: 'sport', label: '🏎️ Speed & Performance', desc: 'Exotic supercars and sports sedans' },
      { id: 'commute', label: '🚗 Eco-Friendly & Daily', desc: 'High-mileage commuter cars' },
      { id: 'family', label: '👨‍👩‍👧 Spacious & Premium', desc: 'Comfortable family rides and sedans' },
      { id: 'adventure', label: '⛰️ Off-Road & Outdoor', desc: 'Rugged 4x4s built for adventure' }
    ]
  },
  {
    id: 'seats',
    title: 'How many passenger seats do you need?',
    options: [
      { id: '2', label: '👤 2 Seats', desc: 'Sleek coupes and sports roadsters' },
      { id: '4', label: '👥 4-5 Seats', desc: 'Practical sedans, crossovers, and SUVs' }
    ]
  },
  {
    id: 'fuel',
    title: 'What is your preferred fuel type?',
    options: [
      { id: 'electric', label: '⚡ Electric / Hybrid', desc: 'Zero emissions or high hybrid efficiency' },
      { id: 'petrol', label: '⛽ Petrol / Gas', desc: 'Traditional gasoline combustion engines' },
      { id: 'diesel', label: '🚜 Diesel', desc: 'Maximum torque and long-range utility' }
    ]
  }
];

function CarQuiz({ cars = [], onSelectCar }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ purpose: '', seats: '', fuel: '' });
  const [results, setResults] = useState([]);

  const handleSelectOption = (questionId, optionId) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      calculateRecommendations(nextAnswers);
      setStep(QUESTIONS.length); // Results step
    }
  };

  const calculateRecommendations = (finalAnswers) => {
    if (!cars || cars.length === 0) return;

    const scored = cars.map((car) => {
      let score = 0;

      // 1. Purpose matching
      const priceVal = parseInt(car.price.replace(/[^0-9]/g, ''), 10) || 100;
      const descLower = car.description.toLowerCase();
      const isSportType = priceVal > 150 || descLower.includes('sport') || descLower.includes('supercar') || descLower.includes('performance') || descLower.includes('exotic');
      const isEcoType = car.specs?.fuel === 'Electric' || car.specs?.fuel === 'Hybrid' || priceVal < 80;
      const isAdventureType = descLower.includes('4x4') || descLower.includes('off-road') || descLower.includes('adventure') || car.name.includes('Defender') || car.name.includes('Wrangler');

      if (finalAnswers.purpose === 'sport' && isSportType) score += 3;
      if (finalAnswers.purpose === 'commute' && isEcoType) score += 3;
      if (finalAnswers.purpose === 'family' && car.specs?.seats >= 4 && !isSportType) score += 3;
      if (finalAnswers.purpose === 'adventure' && isAdventureType) score += 4;

      // 2. Seats matching
      if (finalAnswers.seats === '2') {
        if (car.specs?.seats === 2) score += 3;
        else score -= 2;
      } else {
        if (car.specs?.seats >= 4) score += 3;
        else score -= 2;
      }

      // 3. Fuel matching
      const fuelLower = car.specs?.fuel?.toLowerCase() || '';
      if (finalAnswers.fuel === 'electric') {
        if (fuelLower === 'electric' || fuelLower === 'hybrid') score += 3;
      } else if (finalAnswers.fuel === 'petrol') {
        if (fuelLower === 'petrol') score += 3;
      } else if (finalAnswers.fuel === 'diesel') {
        if (fuelLower === 'diesel') score += 3;
      }

      // Convert score to percentage
      const maxPossibleScore = 10;
      const percentage = Math.max(0, Math.min(100, Math.round((score / maxPossibleScore) * 100)));

      return { car, matchPercentage: percentage };
    });

    // Sort by match percentage descending and take top 3
    const sorted = scored
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);

    setResults(sorted);
  };

  const handleReset = () => {
    setAnswers({ purpose: '', seats: '', fuel: '' });
    setStep(0);
    setResults([]);
  };

  if (!isOpen) {
    return (
      <div className="quiz-collapsed-banner">
        <div className="banner-content">
          <h3>🔍 Not sure which car to rent?</h3>
          <p>Take our 1-minute interactive Ride Finder quiz to find your perfect vehicle matching.</p>
        </div>
        <button className="banner-start-btn" onClick={() => setIsOpen(true)}>
          Start Finder Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container-box">
      <div className="quiz-header">
        <h2>🚗 Ride Finder Assistant</h2>
        <button className="quiz-close-btn" onClick={() => { setIsOpen(false); handleReset(); }}>
          ✕ Close
        </button>
      </div>

      {step < QUESTIONS.length ? (
        <div className="quiz-body">
          {/* Step indicators */}
          <div className="quiz-steps-indicators">
            {QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                className={`step-dot-line ${idx <= step ? 'active' : ''}`}
                style={{ width: `${100 / QUESTIONS.length}%` }}
              />
            ))}
          </div>

          <h3 className="quiz-question-title">{QUESTIONS[step].title}</h3>

          <div className="quiz-options-grid">
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.id}
                className="quiz-option-card"
                onClick={() => handleSelectOption(QUESTIONS[step].id, opt.id)}
              >
                <div className="opt-label">{opt.label}</div>
                <div className="opt-desc">{opt.desc}</div>
              </button>
            ))}
          </div>

          {step > 0 && (
            <button className="quiz-back-btn" onClick={() => setStep(step - 1)}>
              &larr; Previous Question
            </button>
          )}
        </div>
      ) : (
        <div className="quiz-results-body">
          <h3>✨ Your Top Recommended Rides</h3>
          <p className="results-subtitle">Based on your preferences, these match your style perfectly:</p>

          <div className="results-cards-grid">
            {results.map(({ car, matchPercentage }) => (
              <div key={car.id} className="result-match-card">
                <div className="match-pill">{matchPercentage}% Match</div>
                <div className="result-img-wrap">
                  <img src={car.image} alt={car.name} />
                </div>
                <div className="result-details">
                  <h4>{car.name}</h4>
                  <p className="result-price">{car.price}</p>
                  <p className="result-specs-small">
                    👤 {car.specs.seats} Seats | ⛽ {car.specs.fuel}
                  </p>
                  <button
                    className="result-cta-btn"
                    onClick={() => {
                      onSelectCar(car.id);
                      setIsOpen(false);
                      handleReset();
                    }}
                  >
                    View in Showroom &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions-row">
            <button className="reset-quiz-btn" onClick={handleReset}>
              🔄 Retake Quiz
            </button>
            <button className="close-results-btn" onClick={() => { setIsOpen(false); handleReset(); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarQuiz;
