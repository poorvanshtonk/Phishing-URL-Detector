# 🛡️ Phishing URL Detector

## 📌 Overview

The **Phishing URL Detector** is a JavaScript-based web application that analyzes URLs to identify potential phishing threats. It combines external API validation with a custom-built rule-based risk engine to classify URLs as **Safe**, **Suspicious**, or **Phishing**.

This project demonstrates practical applications of cybersecurity concepts using core JavaScript, API integration, and data processing techniques.

---

## 🎯 Objectives

* Detect malicious or suspicious URLs
* Analyze URL structure using heuristic rules
* Integrate external phishing detection APIs
* Provide an interactive UI with search, filter, and sorting
* Demonstrate clean and modular JavaScript architecture

---

## ⚙️ Tech Stack

* **JavaScript (ES6+)** – Core logic and data handling
* **HTML5 & CSS3** – UI structure and styling
* **Fetch API** – API integration
* **LocalStorage** – Persistent data storage

---

## 🚀 Features

### 🔍 URL Analysis

* Accepts user-input URLs
* Performs real-time phishing analysis

### 🌐 API Integration

* Checks URLs against phishing databases (e.g., PhishTank / Safe Browsing)

### 🧠 Custom Risk Engine

* Evaluates URLs based on:

  * Length
  * Presence of special characters (@, -)
  * HTTPS usage
  * Subdomain depth
* Generates a **risk score**

### 📊 Classification System

* Safe 🟢
* Suspicious 🟡
* Phishing 🔴

### 🔎 Search Functionality

* Search through previously analyzed URLs

### 🎯 Filtering

* Filter URLs based on risk level

### 🔽 Sorting

* Sort URLs by risk score

### 💾 Local Storage

* Saves analysis history persistently

---

## ⭐ Advanced Features

### ⚡ Debouncing

Optimized search input to reduce unnecessary computations.

### ⏳ Loading Indicators

Displays visual feedback during API calls.

### 📈 Risk Visualization (Optional Enhancement)

Graphical representation of risk scores.

### 🧠 Heuristic Scoring System

Custom weighted scoring logic for more accurate classification.

### 🔄 Modular Code Architecture

Separation of concerns:

* API handling
* Risk analysis
* UI rendering
* Storage

### 🌙 Dark Mode (Optional)

Improves user experience and accessibility.

---

## 🧪 How It Works

1. User inputs a URL
2. The system:

   * Calls a phishing detection API
   * Applies custom heuristic rules
3. A risk score is generated
4. The URL is classified and displayed
5. Results are stored for future analysis

---

## 📂 Project Structure

```
/js
  ├── api.js
  ├── analyzer.js
  ├── ui.js
  ├── storage.js
  └── utils.js
```

---

## 🛠️ Setup Instructions

1. Clone the repository:

```
git clone https://github.com/your-username/phishing-url-detector.git
```

2. Open `index.html` in your browser

---

## 📅 Milestone Mapping

* **Milestone 1:** Project planning and setup
* **Milestone 2:** API integration and data display
* **Milestone 3:** Search, filter, sort using HOFs
* **Milestone 4:** Deployment and documentation

---

## 💡 Future Enhancements

* Real-time URL monitoring
* Machine learning-based phishing detection
* Browser extension version

---

## 🧠 Learning Outcomes

* Practical cybersecurity concepts
* API integration using Fetch
* JavaScript higher-order functions
* Modular code design
* Performance optimization techniques

---

## 👨‍💻 Author

Developed as part of a JavaScript project to explore real-world problem solving using modern web technologies.
