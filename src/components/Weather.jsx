import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import humidity_icon from '../assets/humidity.png';
import wind_icon from '../assets/wind.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';

const Weather = () => {
  const inputRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [showSettings, setShowSettings] = useState(false);

  const weatherIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": drizzle_icon,
    "03n": drizzle_icon,
    "04d": cloud_icon,
    "04n": cloud_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
    "50d": cloud_icon,
    "50n": cloud_icon,
  };

  const fetchWeatherData = useCallback(async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_APP_ID;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=${unit}&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod && data.cod !== 200) throw new Error(data.message || 'City not found');
      if (!data.weather || !data.main || !data.wind) throw new Error('Invalid weather data');

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: unit === 'metric' ? Math.round(data.wind.speed * 3.6) : Math.round(data.wind.speed),
        temperature: Math.round(data.main.temp),
        location: `${data.name}, ${data.sys.country}`,
        icon: data.weather[0].icon,
        description: data.weather[0].description,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        visibility: data.visibility / 1000,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      });
    } catch (error) {
      setError(error.message.includes('city not found') 
        ? 'City not found. Please try again.' 
        : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, [unit]);

  const handleSearch = () => fetchWeatherData(city);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSettings = () => setShowSettings(!showSettings);

  useEffect(() => {
    const fetchCurrentLocationWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${import.meta.env.VITE_APP_ID}`
              );
              const data = await response.json();
              if (data.name) setCity(data.name);
            } catch (error) {
              console.error('Error fetching location weather:', error);
            }
          },
          (error) => console.error('Geolocation error:', error)
        );
      }
    };

    fetchCurrentLocationWeather();
  }, [unit]);

  return (
    <div className={`weather-app ${darkMode ? 'dark' : 'light'}`}>
      <div className="app-header">
        <h1>Weather Forecast</h1>
        <div className="controls">
          <button className="icon-btn" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="icon-btn" onClick={toggleSettings}>
            ⚙️
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-option">
            <span>Units: </span>
            <button 
              className={`unit-toggle ${unit === 'metric' ? 'active' : ''}`}
              onClick={() => setUnit('metric')}
            >
              °C
            </button>
            <button 
              className={`unit-toggle ${unit === 'imperial' ? 'active' : ''}`}
              onClick={() => setUnit('imperial')}
            >
              °F
            </button>
          </div>
        </div>
      )}

      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}>
          <img src={search_icon} alt="Search" />
        </button>
      </div>

      {loading && <div className="loading-spinner"></div>}
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {weatherData && !loading && (
        <div className="weather-display">
          <div className="location-info">
            <h2>{weatherData.location}</h2>
            <p className="weather-description">{weatherData.description}</p>
          </div>

          <div className="main-weather">
            <div className="weather-icon">
              <img 
                src={weatherIcons[weatherData.icon] || clear_icon} 
                alt={weatherData.description}
              />
            </div>
            <div className="temperature-display">
              <span className="temp-value">{weatherData.temperature}</span>
              <span className="temp-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
              <p className="feels-like">Feels like: {weatherData.feelsLike}°{unit === 'metric' ? 'C' : 'F'}</p>
            </div>
          </div>

          <div className="weather-details">
            <div className="detail-card">
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <span className="detail-value">{weatherData.humidity}%</span>
                <span className="detail-label">Humidity</span>
              </div>
            </div>
            <div className="detail-card">
              <img src={wind_icon} alt="Wind" />
              <div>
                <span className="detail-value">{weatherData.windSpeed} {unit === 'metric' ? 'km/h' : 'mph'}</span>
                <span className="detail-label">Wind</span>
              </div>
            </div>
            <div className="detail-card">
              <div>
                <span className="detail-value">{weatherData.pressure} hPa</span>
                <span className="detail-label">Pressure</span>
              </div>
            </div>
            <div className="detail-card">
              <div>
                <span className="detail-value">{weatherData.visibility} km</span>
                <span className="detail-label">Visibility</span>
              </div>
            </div>
          </div>

          <div className="sun-times">
            <div className="sun-time">
              <span>🌅 Sunrise</span>
              <span>{weatherData.sunrise}</span>
            </div>
            <div className="sun-time">
              <span>🌇 Sunset</span>
              <span>{weatherData.sunset}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
