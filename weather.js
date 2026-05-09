require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const FAVOURITES_FILE = path.join(__dirname, 'favourites.json');

const API_KEY = process.env.WEATHER_API_KEY;
if (!API_KEY) {
  console.log('Missing API key. Please add WEATHER_API_KEY to your .env file.');
  process.exit(1);
}

const isFahrenheit = args.includes('--fahrenheit');
const apiUnit = isFahrenheit ? 'imperial' : 'metric';
const tempSymbol = isFahrenheit ? '°F' : '°C';
const speedSymbol = isFahrenheit ? 'mph' : 'm/s';

// Load favourites from file
function loadFavourites() {
  if (!fs.existsSync(FAVOURITES_FILE)) return [];
  return JSON.parse(fs.readFileSync(FAVOURITES_FILE, 'utf-8'));
}

// Save favourites to file
function saveFavourites(favourites) {
  fs.writeFileSync(FAVOURITES_FILE, JSON.stringify(favourites, null, 2));
}

// Add a city to favourites
function addFavourite(city) {
  const favourites = loadFavourites();
  if (favourites.includes(city)) {
    console.log(`"${city}" is already in your favourites.`);
    return;
  }
  favourites.push(city);
  saveFavourites(favourites);
  console.log(`"${city}" added to favourites.`);
}

// Remove a city from favourites
function removeFavourite(city) {
  let favourites = loadFavourites();
  if (!favourites.includes(city)) {
    console.log(`"${city}" is not in your favourites.`);
    return;
  }
  favourites = favourites.filter(f => f !== city);
  saveFavourites(favourites);
  console.log(`"${city}" removed from favourites.`);
}

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
  // Handle --add-favourite flag
  const addIndex = args.indexOf('--add-favourite');
  if (addIndex !== -1) {
    const city = args[addIndex + 1];
    if (!city) {
      console.log('Please provide a city name: node weather.js --add-favourite <city>');
      process.exit(1);
    }
    addFavourite(city);
    return;
  }

  // Handle --remove-favourite flag
  const removeIndex = args.indexOf('--remove-favourite');
  if (removeIndex !== -1) {
    const city = args[removeIndex + 1];
    if (!city) {
      console.log('Please provide a city name: node weather.js --remove-favourite <city>');
      process.exit(1);
    }
    removeFavourite(city);
    return;
  }

  // Handle --favourites flag
  if (args.includes('--favourites')) {
    const favourites = loadFavourites();
    if (favourites.length === 0) {
      console.log('No favourite cities saved. Use --add-favourite <city> to add one.');
      return;
    }
    console.log('\nFetching weather for your favourite cities...');
    for (const city of favourites) {
      await getWeather(city);
    }
    return;
  }

  // Default: get weather for provided cities
  const cities = args.filter(arg => !arg.startsWith('--'));
  if (cities.length === 0) {
    console.log('Usage: node weather.js <city> [city2] [city3]...');
    console.log('       node weather.js --add-favourite <city>');
    console.log('       node weather.js --remove-favourite <city>');
    console.log('       node weather.js --favourites');
    process.exit(1);
  }

  for (const city of cities) {
    await getWeather(city);
  }
}

main();
