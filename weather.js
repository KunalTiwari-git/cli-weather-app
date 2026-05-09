require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const args = process.argv.slice(2);
const FAVOURITES_FILE = path.join(__dirname, 'favourites.json');

const API_KEY = process.env.WEATHER_API_KEY;
if (!API_KEY) {
  console.log(chalk.red('Missing API key. Please add WEATHER_API_KEY to your .env file.'));
  process.exit(1);
}

const isFahrenheit = args.includes('--fahrenheit');
const isForecast = args.includes('--forecast');
const apiUnit = isFahrenheit ? 'imperial' : 'metric';
const tempSymbol = isFahrenheit ? '°F' : '°C';
const speedSymbol = isFahrenheit ? 'mph' : 'm/s';

function getTemperatureColor(temp) {
  if (temp < 10) return chalk.blue(temp + tempSymbol);
  if (temp < 25) return chalk.green(temp + tempSymbol);
  return chalk.red(temp + tempSymbol);
}

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
    console.log(chalk.yellow(`"${city}" is already in your favourites.`));
    return;
  }
  favourites.push(city);
  saveFavourites(favourites);
  console.log(chalk.green(`"${city}" added to favourites.`));
}

function removeFavourite(city) {
  let favourites = loadFavourites();
  if (!favourites.includes(city)) {
    console.log(chalk.yellow(`"${city}" is not in your favourites.`));
    return;
  }
  favourites = favourites.filter(f => f !== city);
  saveFavourites(favourites);
  console.log(chalk.green(`"${city}" removed from favourites.`));
}

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${apiUnit}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log('\n' + chalk.cyan('============================'));
    console.log(chalk.cyan.bold(`  ${data.name}, ${data.sys.country}`));
    console.log(chalk.cyan('============================'));
    console.log(`  Temperature : ${getTemperatureColor(data.main.temp)}`);
    console.log(`  Feels like  : ${getTemperatureColor(data.main.feels_like)}`);
    console.log(`  Condition   : ${chalk.white(data.weather[0].description)}`);
    console.log(`  Humidity    : ${chalk.blue(data.main.humidity + '%')}`);
    console.log(`  Wind speed  : ${chalk.yellow(data.wind.speed + ' ' + speedSymbol)}`);
    console.log(chalk.cyan('============================') + '\n');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(chalk.red(`\nCity "${city}" not found. Please check the spelling.\n`));
    } else if (error.response?.status === 401) {
      console.log(chalk.red('Invalid API key. Please check your .env file.'));
    } else {
      console.log(chalk.red(`Something went wrong for "${city}". Please try again.`));
    }
  }
}

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${apiUnit}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log('\n' + chalk.cyan.bold(`📅 5-Day Forecast for ${data.city.name}, ${data.city.country}`));
    console.log(chalk.cyan('========================================'));

    const days = {};
    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) {
        days[date] = item;
      }
    }

    for (const [date, item] of Object.entries(days)) {
      console.log('\n  ' + chalk.magenta.bold(`📆 ${date}`));
      console.log(`  Temperature : ${getTemperatureColor(item.main.temp)}`);
      console.log(`  Feels like  : ${getTemperatureColor(item.main.feels_like)}`);
      console.log(`  Condition   : ${chalk.white(item.weather[0].description)}`);
      console.log(`  Humidity    : ${chalk.blue(item.main.humidity + '%')}`);
      console.log(`  Wind speed  : ${chalk.yellow(item.wind.speed + ' ' + speedSymbol)}`);
      console.log(chalk.cyan('  ----------------------------------------'));
    }

  } catch (error) {
    if (error.response?.status === 404) {
      console.log(chalk.red(`\nCity "${city}" not found. Please check the spelling.\n`));
    } else if (error.response?.status === 401) {
      console.log(chalk.red('Invalid API key. Please check your .env file.'));
    } else {
      console.log(chalk.red(`Something went wrong for "${city}". Please try again.`));
    }
  }
}

async function main() {
  const addIndex = args.indexOf('--add-favourite');
  if (addIndex !== -1) {
    const city = args[addIndex + 1];
    if (!city) {
      console.log(chalk.red('Please provide a city name: node weather.js --add-favourite <city>'));
      process.exit(1);
    }
    addFavourite(city);
    return;
  }

  const removeIndex = args.indexOf('--remove-favourite');
  if (removeIndex !== -1) {
    const city = args[removeIndex + 1];
    if (!city) {
      console.log(chalk.red('Please provide a city name: node weather.js --remove-favourite <city>'));
      process.exit(1);
    }
    removeFavourite(city);
    return;
  }

  if (args.includes('--favourites')) {
    const favourites = loadFavourites();
    if (favourites.length === 0) {
      console.log(chalk.yellow('No favourite cities saved. Use --add-favourite <city> to add one.'));
      return;
    }
    console.log(chalk.cyan('\nFetching weather for your favourite cities...'));
    for (const city of favourites) {
      await getWeather(city);
    }
    return;
  }

  const cities = args.filter(arg => !arg.startsWith('--'));
  if (cities.length === 0) {
    console.log(chalk.yellow('Usage: node weather.js <city> [city2] [city3]...'));
    console.log(chalk.yellow('       node weather.js <city> --forecast'));
    console.log(chalk.yellow('       node weather.js <city> --fahrenheit'));
    console.log(chalk.yellow('       node weather.js --add-favourite <city>'));
    console.log(chalk.yellow('       node weather.js --remove-favourite <city>'));
    console.log(chalk.yellow('       node weather.js --favourites'));
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