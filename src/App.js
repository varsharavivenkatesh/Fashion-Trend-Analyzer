import React, { useState, useEffect } from 'react';

// TrendCard component: Displays individual fashion trend information.
const TrendCard = ({ trend }) => {
  // Determine text color for popularity change based on positive or negative value
  const popularityColor = trend.predictedPopularityChange.startsWith('+')
    ? 'text-success' // Bootstrap success color (green)
    : 'text-danger'; // Bootstrap danger color (red)

  return (
    // Bootstrap card structure
    <div className="card h-100 shadow-sm rounded-lg border-0 transform transition-transform duration-300 hover:scale-105">
      {/* Image for the trend */}
      <img
        src={trend.imageUrl}
        alt={trend.trendName}
        className="card-img-top" // Bootstrap class for top image in card
        style={{ height: '200px', objectFit: 'cover' }}
        // Fallback for image loading errors
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/CCCCCC/666666?text=Image+Unavailable'; }}
      />
      <div className="card-body p-4">
        {/* Trend name */}
        <h5 className="card-title mb-2 text-dark">{trend.trendName}</h5>
        {/* Trend category */}
        <p className="card-subtitle mb-3 text-muted">{trend.category}</p>
        {/* Current popularity */}
        <div className="d-flex align-items-center mb-2">
          <span className="me-2 text-secondary">Current Popularity:</span>
          <span className="text-primary font-weight-bold">{trend.currentPopularity}%</span>
        </div>
        {/* Predicted popularity change */}
        <div className="d-flex align-items-center mb-3">
          <span className="me-2 text-secondary">Predicted Change:</span>
          <span className={`${popularityColor} font-weight-bold`}>{trend.predictedPopularityChange}%</span>
        </div>
        {/* Trend description */}
        <p className="card-text text-secondary mb-3">{trend.description}</p>
        {/* Keywords/tags */}
        <div className="d-flex flex-wrap gap-2">
          {trend.keywords.map((keyword, index) => (
            <span
              key={index}
              className="badge bg-info-subtle text-info-emphasis rounded-pill px-2 py-1" // Bootstrap badge classes
            >
              #{keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  // State for search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for filtered trends based on search
  const [filteredTrends, setFilteredTrends] = useState([]); // Initialize as empty
  // State for all fetched trends (before filtering)
  const [allTrends, setAllTrends] = useState([]);
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

  // Effect to fetch data from the backend when the component mounts
  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/trends'); // Endpoint of your Flask backend
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllTrends(data); // Store all fetched data
        setFilteredTrends(data); // Initially, filtered data is all data
      } catch (e) {
        console.error("Failed to fetch trends:", e);
        setError("Failed to load fashion trends. Please ensure the Python backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to filter trends whenever searchTerm, selectedCategory, or allTrends changes
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = allTrends.filter(trend => {
      // Check if trend name or any keyword includes the search term
      const matchesSearch =
        trend.trendName.toLowerCase().includes(lowercasedSearchTerm) ||
        trend.keywords.some(keyword => keyword.toLowerCase().includes(lowercasedSearchTerm));

      // Check if the trend matches the selected category
      const matchesCategory =
        selectedCategory === 'All' || trend.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
    setFilteredTrends(filtered);
  }, [searchTerm, selectedCategory, allTrends]); // Dependencies for the effect

  // Get unique categories from fetched data for the filter dropdown
  // This will now depend on `allTrends`
  const categories = ['All', ...new Set(allTrends.map(trend => trend.category))];

  // Trends predicted to rise significantly (example of "prediction" logic)
  // This also depends on `allTrends`
  const risingTrends = allTrends
    .filter(trend => trend.predictedPopularityChange.startsWith('+') && parseInt(trend.predictedPopularityChange.substring(1)) > 10)
    .sort((a, b) => parseInt(b.predictedPopularityChange.substring(1)) - parseInt(a.predictedPopularityChange.substring(1)))
    .slice(0, 3); // Show top 3 rising trends

  return (
    // Bootstrap container for responsive layout and padding
    <div className="container-fluid bg-light min-vh-100 py-5">
      {/* Bootstrap CDN links - IMPORTANT: Add these to your public/index.html <head> or similar */}
      {/* <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"> */}
      {/* <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" xintegrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script> */}

      {/* Header section */}
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">
          Fashion Trend Analyzer
        </h1>
        <p className="lead text-secondary mx-auto" style={{ maxWidth: '700px' }}>
          Discover and predict the next big things in fashion.
        </p>
      </header>

      {/* Loading and Error Messages */}
      {isLoading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading fashion trends from backend...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center my-5" role="alert">
          {error}
        </div>
      )}

      {/* Render content only if not loading and no error, or if there's data */}
      {!isLoading && !error && (
        <>
          {/* Predicted Trends section */}
          <section className="mb-5 bg-white rounded-4 shadow-sm p-4">
            <h2 className="h3 fw-bold text-primary mb-4 text-center">
              ⚡ Hot Predictions: What's Next? ⚡
            </h2>
            {risingTrends.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {risingTrends.map(trend => (
                  <div key={trend.id} className="col">
                    <div className="card h-100 bg-light border-primary-subtle shadow-sm p-3">
                      <h5 className="card-title text-primary mb-2">{trend.trendName}</h5>
                      <p className="card-subtitle text-muted mb-2">{trend.category}</p>
                      <p className="card-text fs-5 fw-bold text-success">
                        Expected Rise: {trend.predictedPopularityChange}%
                      </p>
                      <p className="card-text text-secondary-emphasis mt-2">{trend.description.substring(0, 80)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted">No significant rising trends predicted at the moment.</p>
            )}
          </section>

          {/* Search and Filter section */}
          <section className="mb-5 bg-white rounded-4 shadow-sm p-4 d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
            {/* Search input */}
            <div className="input-group flex-grow-1 me-md-3 mb-3 mb-md-0">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill" id="search-addon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                className="form-control border-start-0 rounded-end-pill ps-0"
                placeholder="Search trends (e.g., 'blazer', 'cargo', 'y2k')"
                aria-label="Search trends"
                aria-describedby="search-addon"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category filter dropdown */}
            <div className="flex-grow-0 w-100 w-md-25">
              <select
                className="form-select rounded-pill"
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Display Trends section */}
          <section>
            <h2 className="h3 fw-bold text-primary mb-4 text-center">
              All Fashion Trends
            </h2>
            {filteredTrends.length > 0 ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {filteredTrends.map(trend => (
                  <div key={trend.id} className="col">
                    <TrendCard trend={trend} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted fs-5">No trends found matching your criteria.</p>
            )}
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="text-center mt-5 text-muted small">
        <p>&copy; 2024 Fashion Trend Analyzer. All rights reserved.</p>
        <p>Data provided by backend API (simulated).</p>
      </footer>
    </div>
  );
};

export default App;
