require('dotenv').config();
const axios = require('axios');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node weather.js <city> [city2] [city3]...');
  console.log('Example: node weather.js London Mumbai Tokyo');
  process.exit(1);
}

const API_KEY = process.env.WEATHER_API_KEY;

if (!API_KEY) {
  console.log('Missing API key. Please add WEATHER_API_KEY to your .env file.');
  process.exit(1);
}

const isFahrenheit = args.includes('--fahrenheit');
const cities = args.filter(arg => !arg.startsWith('--'));
const apiUnit = isFahrenheit ? 'imperial' : 'metric';
const tempSymbol = isFahrenheit ? '°F' : '°C';
const speedSymbol = isFahrenheit ? 'mph' : 'm/s';

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${apiUnit}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log('\n============================');
    console.log(`  ${data.name}, ${data.sys.country}`);
    console.log('============================');
    console.log(`  Temperature : ${data.main.temp}${tempSymbol}`);
    console.log(`  Feels like  : ${data.main.feels_like}${tempSymbol}`);
    console.log(`  Condition   : ${data.weather[0].description}`);
    console.log(`  Humidity    : ${data.main.humidity}%`);
    console.log(`  Wind speed  : ${data.wind.speed} ${speedSymbol}`);
    console.log('============================\n');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`\nCity "${city}" not found. Please check the spelling.\n`);
    } else if (error.response?.status === 401) {
      console.log('Invalid API key. Please check your .env file.');
    } else {
      console.log(`Something went wrong for "${city}". Please try again.`);
    }
  }
}

async function main() {
  for (const city of cities) {
    await getWeather(city);
  }
}

main();