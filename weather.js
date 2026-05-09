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
const isForecast = args.includes('--forecast');
const apiUnit = isFahrenheit ? 'imperial' : 'metric';
const tempSymbol = isFahrenheit ? '°F' : '°C';
const speedSymbol = isFahrenheit ? 'mph' : 'm/s';

function loadFavourites() {
  if (!fs.existsSync(FAVOURITES_FILE)) return [];
  return JSON.parse(fs.readFileSync(FAVOURITES_FILE, 'utf-8'));
}

function saveFavourites(favourites) {
  fs.writeFileSync(FAVOURITES_FILE, JSON.stringify(favourites, null, 2));
}

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

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${apiUnit}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log(`\n📅 5-Day Forecast for ${data.city.name}, ${data.city.country}`);
    console.log('========================================');

    const days = {};
    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) {
        days[date] = item;
      }
    }

    for (const [date, item] of Object.entries(days)) {
      console.log(`\n  📆 ${date}`);
      console.log(`  Temperature : ${item.main.temp}${tempSymbol}`);
      console.log(`  Feels like  : ${item.main.feels_like}${tempSymbol}`);
      console.log(`  Condition   : ${item.weather[0].description}`);
      console.log(`  Humidity    : ${item.main.humidity}%`);
      console.log(`  Wind speed  : ${item.wind.speed} ${speedSymbol}`);
      console.log('  ----------------------------------------');
    }

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

  const cities = args.filter(arg => !arg.startsWith('--'));
  if (cities.length === 0) {
    console.log('Usage: node weather.js <city> [city2] [city3]...');
    console.log('       node weather.js <city> --forecast');
    console.log('       node weather.js <city> --fahrenheit');
    console.log('       node weather.js --add-favourite <city>');
    console.log('       node weather.js --remove-favourite <city>');
    console.log('       node weather.js --favourites');
    process.exit(1);
  }

  if (isForecast) {
    for (const city of cities) {
      await getForecast(city);
    }
    return;
  }

  for (const city of cities) {
    await getWeather(city);
  }
}

main();