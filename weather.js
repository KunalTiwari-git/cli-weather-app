require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FAVOURITES_FILE = path.join(__dirname, 'favourites.json');

// ─── Favourites helpers ─────────────────────────────────

function loadFavourites() {
  try {
    if (fs.existsSync(FAVOURITES_FILE)) {
      return JSON.parse(fs.readFileSync(FAVOURITES_FILE, 'utf8'));
    }
  } catch {
    // corrupt file, start fresh
  }
  return [];
}

function saveFavourites(favourites) {
  fs.writeFileSync(FAVOURITES_FILE, JSON.stringify(favourites, null, 2) + '\n');
}

// ─── Weather API ────────────────────────────────────────

async function getWeather(city, apiUnit, tempSymbol, speedSymbol, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${apiUnit}`;
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
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`\nCity "${city}" not found. Please check the spelling.\n`);
    } else if (error.response?.status === 401) {
      console.log('Invalid API key. Please check your .env file.');
    } else {
      console.log(`Something went wrong for "${city}". Please try again.`);
    }
    return false;
  }
}

// ─── CLI ────────────────────────────────────────────────

const args = process.argv.slice(2);
const API_KEY = process.env.WEATHER_API_KEY;

function showUsage() {
  console.log(`
Usage:
  node weather.js <city> [city2] ...          Get weather for city/cities
  node weather.js --add-favourite <city>      Save a city to favourites
  node weather.js --favourites                Show weather for all saved cities
  node weather.js --remove-favourite <city>   Remove a city from favourites
  node weather.js --list-favourites           List saved cities (no weather)
  node weather.js --fahrenheit                Use Fahrenheit (works with any command)

Examples:
  node weather.js London Mumbai Tokyo
  node weather.js --add-favourite London
  node weather.js --favourites
  node weather.js --remove-favourite London
  node weather.js --list-favourites
  node weather.js --add-favourite --fahrenheit London
`);
}

async function main() {
  // No arguments → show usage
  if (args.length === 0) {
    showUsage();
    process.exit(0);
  }

  // Check API key (not needed for --list-favourites)
  if (!API_KEY && !args.includes('--list-favourites')) {
    console.log('Missing API key. Please add WEATHER_API_KEY to your .env file.');
    process.exit(1);
  }

  const isFahrenheit = args.includes('--fahrenheit');
  const apiUnit = isFahrenheit ? 'imperial' : 'metric';
  const tempSymbol = isFahrenheit ? '°F' : '°C';
  const speedSymbol = isFahrenheit ? 'mph' : 'm/s';

  // ── --add-favourite <city> ──
  if (args.includes('--add-favourite')) {
    const cityIdx = args.indexOf('--add-favourite') + 1;
    const city = args[cityIdx];
    if (!city || city.startsWith('--')) {
      console.log('Please provide a city name. Example: node weather.js --add-favourite London');
      process.exit(1);
    }
    const favourites = loadFavourites();
    if (favourites.some(c => c.toLowerCase() === city.toLowerCase())) {
      console.log(`"${city}" is already in your favourites.`);
    } else {
      favourites.push(city);
      saveFavourites(favourites);
      console.log(`✅ Added "${city}" to favourites.`);
    }
    return;
  }

  // ── --remove-favourite <city> ──
  if (args.includes('--remove-favourite')) {
    const cityIdx = args.indexOf('--remove-favourite') + 1;
    const city = args[cityIdx];
    if (!city || city.startsWith('--')) {
      console.log('Please provide a city name. Example: node weather.js --remove-favourite London');
      process.exit(1);
    }
    const favourites = loadFavourites();
    const newFavourites = favourites.filter(c => c.toLowerCase() !== city.toLowerCase());
    if (newFavourites.length === favourites.length) {
      console.log(`"${city}" is not in your favourites.`);
    } else {
      saveFavourites(newFavourites);
      console.log(`🗑️  Removed "${city}" from favourites.`);
    }
    return;
  }

  // ── --list-favourites ──
  if (args.includes('--list-favourites')) {
    const favourites = loadFavourites();
    if (favourites.length === 0) {
      console.log('No favourites saved yet. Add one with: node weather.js --add-favourite <city>');
    } else {
      console.log('\n⭐ Your favourite cities:');
      favourites.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
      console.log('');
    }
    return;
  }

  // ── --favourites ──
  if (args.includes('--favourites')) {
    const favourites = loadFavourites();
    if (favourites.length === 0) {
      console.log('No favourites saved yet. Add one with: node weather.js --add-favourite <city>');
      process.exit(0);
    }
    console.log(`\n⭐ Weather for your ${favourites.length} favourite city/cities:`);
    for (const city of favourites) {
      await getWeather(city, apiUnit, tempSymbol, speedSymbol, API_KEY);
    }
    return;
  }

  // ── Default: get weather for specified cities ──
  const cities = args.filter(arg => !arg.startsWith('--'));
  if (cities.length === 0) {
    showUsage();
    process.exit(0);
  }
  for (const city of cities) {
    await getWeather(city, apiUnit, tempSymbol, speedSymbol, API_KEY);
  }
}

main();
