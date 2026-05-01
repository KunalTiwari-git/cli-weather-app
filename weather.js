require('dotenv').config();
const axios = require('axios');

const city = process.argv[2];

if (!city) {
  console.log('Usage: node weather.js <city>');
  console.log('Example: node weather.js London');
  process.exit(1);
}

const API_KEY = process.env.WEATHER_API_KEY;
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

async function getWeather() {
  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log('\n============================');
    console.log(`  ${data.name}, ${data.sys.country}`);
    console.log('============================');
    console.log(`  Temperature : ${data.main.temp}°C`);
    console.log(`  Feels like  : ${data.main.feels_like}°C`);
    console.log(`  Condition   : ${data.weather[0].description}`);
    console.log(`  Humidity    : ${data.main.humidity}%`);
    console.log(`  Wind speed  : ${data.wind.speed} m/s`);
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