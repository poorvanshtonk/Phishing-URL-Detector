# Phishing URL Detector

A frontend and backend web app that analyzes URLs and classifies them as `Safe`, `Suspicious`, or `Phishing`.

## Overview

The project combines:

- frontend URL validation and rendering
- heuristic risk scoring
- backend-only Safe Browsing API access
- local history storage in the browser

The frontend never exposes an API key. It sends URL checks only to the backend at `http://localhost:3000/check`.

## Features

- Validate URLs before analysis
- Detect suspicious patterns using heuristic rules
- Query the backend for phishing detection
- Render results safely without dynamic `innerHTML`
- Search, filter, and sort saved results
- Persist scan history with `localStorage`

## Tech Stack

- HTML
- CSS
- JavaScript (ES modules)
- Node.js
- Express
- Google Safe Browsing API

## Project Structure

```text
Phishing-URL-Detector/
├── index.html
├── script.js
├── style.css
├── js/
│   ├── analyzer.js
│   ├── api.js
│   ├── storage.js
│   ├── ui.js
│   └── utils.js
└── server/
    ├── package.json
    ├── package-lock.json
    └── server.js
```

## How It Works

1. The user enters a URL in the frontend.
2. The frontend normalizes and validates the URL with `new URL()`.
3. The frontend applies heuristic checks and sends the URL to the backend.
4. The backend calls the Safe Browsing API using the server-side API key.
5. The frontend displays the result and stores it in local history.

## Setup

### 1. Clone the project

```bash
git clone https://github.com/your-username/phishing-url-detector.git
cd phishing-url-detector
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server/` directory:

```env
API_KEY=your_google_safe_browsing_api_key
```

### 4. Start the backend

```bash
npm start
```

The backend runs on `http://localhost:3000`.

### 5. Open the frontend

Open `index.html` in a browser.

## Example URLs

### Suspicious or phishing-style test input

```text
http://testsafebrowsing.appspot.com/s/phishing.html
http://fake-login-example.com
```

### Normal input

```text
https://google.com
https://openai.com
```

## Security Notes

- API keys are stored only on the backend in `server/.env`.
- The frontend does not contain secret credentials.
- URL input is validated before processing.
- Results are rendered with DOM APIs instead of unsafe HTML injection.

## Limitations

- The frontend expects the backend server to be running locally on port `3000`.
- Browser history is stored only in local storage on the current device.
- Heuristic checks are basic and should not be treated as a complete security solution.

## Author

This project is created for the project purpose and as i m in cybersecurity field also so to work on a project i just created it..
