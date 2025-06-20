import React, { useEffect, useState, useRef } from 'react';
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

  const weatherIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": drizzle_icon,
    "03n": drizzle_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
    "50d": cloud_icon,
    "50n": cloud_icon,
  };

  const fetchWeatherData = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError(null);
    setWeatherData(null);
    
    try {
      const apiKey = import.meta.env.VITE_APP_ID;
      if (!apiKey) {
        throw new Error('API key is missing');
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod && data.cod !== 200) {
        throw new Error(data.message || 'City not found');
      }

      if (!data.weather || !data.main || !data.wind) {
        throw new Error('Invalid weather data received');
      }

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        temperature: Math.round(data.main.temp),
        location: data.name,
        icon: weatherIcons[data.weather[0].icon] || clear_icon,
        description: data.weather[0].description,
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error.message.includes('city not found') 
        ? 'City not found. Please try again.' 
        : 'Failed to fetch weather data');
      setCity('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeatherData(city);
    }
  };

  return (
    <div className="weather">
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading || !city.trim()}
          aria-label="Search weather"
        >
          <img src={search_icon} alt="Search" />
        </button>
      </div>

      {loading && <div className="loading">Loading weather data...</div>}
      
      {error && (
        <div className="error">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="retry-button"
          >
            Try again
          </button>
        </div>
      )}

      {weatherData && !loading && (
        <div className="weather-info">
          <img 
            src={weatherData.icon} 
            alt={weatherData.description} 
            className="weather-icon" 
            title={weatherData.description}
          />
          <div className="temperature-container">
            <p className="temperature">{weatherData.temperature}</p>
            <span className="degree-symbol">°C</span>
          </div>
          <p className="location">{weatherData.location}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p className="value">{weatherData.humidity}%</p>
                <span className="label">Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind" />
              <div>
                <p className="value">{weatherData.windSpeed} km/h</p>
                <span className="label">Wind Speed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;