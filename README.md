# CLI Weather App 🌤️

A simple but powerful command-line weather app built with Node.js.

## Install

```bash
git clone https://github.com/KunalTiwari-git/cli-weather-app.git
cd cli-weather-app
npm install
```
## Install via npm

```bash
npm install -g kunal-weather-cli
```

## Setup

1. Get a free API key from [openweathermap.org](https://openweathermap.org)
2. Create a `.env` file in the root folder:
WEATHER_API_KEY=your_key_here
## Usage

### Current Weather
```bash
node weather.js <city>
node weather.js London
node weather.js London Mumbai Tokyo
```

### Fahrenheit
```bash
node weather.js London --fahrenheit
```

### 5-Day Forecast
```bash
node weather.js London --forecast
node weather.js London --forecast --fahrenheit
```

### Favourite Cities
```bash
# Add a city to favourites
node weather.js --add-favourite London

# Show weather for all favourites
node weather.js --favourites

# Remove a city from favourites
node weather.js --remove-favourite London
```

## Features

- 🌍 **Multiple cities** — check weather for several cities at once
- 🌡️ **Temperature units** — switch between Celsius and Fahrenheit
- 📅 **5-day forecast** — plan ahead with daily forecasts
- ⭐ **Favourite cities** — save and quickly check your regular cities
- 🎨 **Coloured output** — temperature colour changes based on value

## Tech

- Node.js
- axios
- dotenv
- chalk

## Contributing

Contributions are welcome! Check the open issues and feel free to submit a PR.