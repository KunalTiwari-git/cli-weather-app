# Contributing to CLI Weather App

Thanks for your interest in contributing! Here's everything you need to get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/cli-weather-app.git
cd cli-weather-app
```
3. Install dependencies:
```bash
npm install
```
4. Create a `.env` file with your OpenWeatherMap API key:
WEATHER_API_KEY=your_key_here
## How to Contribute

1. Find an open issue or create one describing what you want to work on
2. Comment on the issue to get assigned
3. Create a new branch:
```bash
git switch -c your-branch-name
```
4. Make your changes
5. Test locally before submitting
6. Commit with a clear message:
```bash
git commit -m "feat: describe what you did"
```
7. Push and open a Pull Request

## Commit Message Format

Use these prefixes:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code changes that aren't features or fixes

## Code Style

- Use `const` and `let` — never `var`
- Always handle errors with try/catch
- Add a newline at end of every file
- Keep functions small and focused

## Pull Request Guidelines

- Reference the issue in your PR description using `Closes #<issue number>`
- Test all existing features still work before submitting
- Keep PRs focused — one feature or fix per PR

## Need Help?

Open an issue and ask — we're happy to help!