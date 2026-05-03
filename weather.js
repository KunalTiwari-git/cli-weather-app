require('dotenv').config();
const axios = require('axios');

// Safely extract the city by finding the first argument that isn't a flag
const args = process.argv.slice(2);
const city = args.find(arg => !arg.startsWith('--'));

if (!city) {
  console.log('Usage: node weather.js <city> [--fahrenheit]');
  console.log('Example: node weather.js London');
  console.log('Example: node weather.js London --fahrenheit');
  process.exit(1);
}

// 1. Check if the user passed the --fahrenheit flag
const isFahrenheit = process.argv.includes('--fahrenheit');

// 2. Set the API unit and display symbols dynamically
const apiUnit = isFahrenheit ? 'imperial' : 'metric';
const tempSymbol = isFahrenheit ? '°F' : '°C';
const speedSymbol = isFahrenheit ? 'mph' : 'm/s';

const API_KEY = process.env.WEATHER_API_KEY;

// 3. Inject the dynamic unit into the API URL
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${apiUnit}`;

async function getWeather() {
  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log('\n============================');
    console.log(`  ${data.name}, ${data.sys.country}`);
    console.log('============================');
    // 4. Inject the dynamic temperature symbols
    console.log(`  Temperature : ${data.main.temp}${tempSymbol}`);
    console.log(`  Feels like  : ${data.main.feels_like}${tempSymbol}`);
    console.log(`  Condition   : ${data.weather[0].description}`);
    console.log(`  Humidity    : ${data.main.humidity}%`);
    console.log(`  Wind speed  : ${data.wind.speed} ${speedSymbol}`);
    console.log('============================\n');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`City "${city}" not found. Please check the spelling.`);
    } else if (error.response?.status === 401) {
      console.log('Invalid API key. Please check your .env file.');
    } else {
      console.log('Something went wrong. Please try again.');
    }
  }
}

getWeather();