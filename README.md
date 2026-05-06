# CLI Weather App

A simple command-line weather app built with Node.js.

## Usage

```bash
# Basic weather
node weather.js <city> [city2] [city3]...
node weather.js London Mumbai Tokyo
node weather.js --fahrenheit London

# Favourite cities
node weather.js --add-favourite London      # Save a city
node weather.js --list-favourites            # List saved cities
node weather.js --favourites                 # Show weather for all favourites
node weather.js --remove-favourite London    # Remove a city
```

## Features

- Get current weather for any city
- Support for multiple cities in one command
- **Favourite cities** — save, view, remove
- Fahrenheit / Celsius toggle

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with your OpenWeatherMap API key:
   ```
   WEATHER_API_KEY=your_key_here
   ```
4. Get a free API key from [openweathermap.org](https://openweathermap.org)

## Tech

- Node.js
- axios
- dotenv
