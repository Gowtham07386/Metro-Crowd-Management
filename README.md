# 🚇 MetroFlow AI — Smart Metro Crowd Management & Peak Hour Mobile Alert System

<div align="center">

![MetroFlow AI Banner](https://img.shields.io/badge/MetroFlow-AI%20Smart%20Transit%20OS-blueviolet?style=for-the-badge&logo=metro)

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![CatBoost](https://img.shields.io/badge/CatBoost-1.2.0-yellow.svg?style=flat-square&logo=catboost&logoColor=black)](https://catboost.ai/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1.svg?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.9-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-38BDF8.svg?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**An End-to-End AI-Powered Intelligent Urban Mass Rapid Transit (MRT) Operating System**

[Key Features](#-key-features) • [System Architecture](#%EF%B8%8F-system-architecture) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [ML Pipeline](#-machine-learning-pipeline) • [Demo Credentials](#-demo-credentials)

</div>

---

## 📌 Overview

**MetroFlow AI** is a comprehensive, production-grade AI platform designed to transform urban metro transit systems. By harnessing gradient-boosted machine learning models (CatBoost), real-time IoT station telemetry, automated passenger flow analysis, and interactive transit maps, MetroFlow AI optimizes train schedules, mitigates platform overcrowding, and provides passengers with live congestion alerts and smart route recommendations.

Whether managing daily rush-hour surges across high-density metro corridors (e.g., Delhi, Mumbai, Bengaluru, Hyderabad) or providing passengers with real-time crowd heatmaps, MetroFlow AI bridges the gap between mass transit operations and predictive artificial intelligence.

---

## ✨ Key Features

### 🔮 1. AI Crowd Density Forecasting & Surge Alerts
* **Multi-Horizon Predictions**: Predicts platform occupancy (%), estimated passenger wait times, and crowd risk levels for **15-minute, 30-minute, and 45-minute** horizons.
* **CatBoost ML Engine**: Evaluates complex variables including historical footfall, AFC smart card taps, weather conditions, POI categories, peak hour flags, and dwell times.
* **Risk Categorization**: Categorizes station platforms into **Normal Flow (Low)**, **Moderate**, **Heavy Crowd (High)**, and **Critical Overcrowding**.

### 🚉 2. Live Station Telemetry & Crowd Monitoring
* **Real-time Station Heatmaps**: Interactive station monitoring dashboard supporting **10 major metro networks** (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Kochi, Jaipur, Lucknow).
* **AFC & Gate Throughput Tracking**: Monitors entry/exit gate counts, smart card taps, QR ticket usage, and concourse queue lengths.
* **Line-Wide Metrics**: Tracks train load factors, dwell times, and platform safety thresholds.

### 🚆 3. Dynamic AI-Assisted Train Scheduling
* **Automated Headway Adjustment**: Generates real-time train frequency recommendations (e.g., automatically reducing headway from 8 mins to 3 mins during surge conditions).
* **Dispatch Suggestions**: Recommends deploying standby coaches or loop trains to clear congested interchange hubs.

### 🗺️ 4. Smart Passenger Journey Planner
* **Crowd-Aware Routing**: Calculates optimal travel routes taking into account line congestion, transit time, transfer counts, and ticket fares.
* **Real-time Alternatives**: Suggests lower-density alternative routes or off-peak travel windows for passengers.

### 🚨 5. Peak-Hour Mobile Alerts & Emergency Response
* **Automated Background Telemetry**: 5-minute periodic background worker evaluating live occupancy thresholds and triggering automated service advisories.
* **One-Tap Emergency Assistance**: Passenger panic alert system linked directly to station control rooms and transit authorities.

### 📊 6. Executive Analytics & Operational Reports
* **Comprehensive Dashboards**: Visualizes historical footfall trends, peak-hour distributions, station bottleneck analysis, and daily fare revenue.
* **PDF & CSV Exporting**: Generate audit-ready operational analytics reports for transit administration.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | SPA architecture for responsive passenger & admin portals |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Framer Motion | Modern dark/light glassmorphic UI with smooth animations |
| **Data Viz** | Recharts | Dynamic real-time charts for crowd density, footfall & wait times |
| **Backend API** | FastAPI, Uvicorn | High-performance asynchronous Python REST API |
| **Database** | PostgreSQL, SQLAlchemy ORM | Relational data store for stations, trains, users & tickets |
| **Machine Learning**| CatBoost Regressor, Pandas, Scikit-learn | Gradient boosting model for station crowd occupancy prediction |
| **Auth & Security** | PyJWT, Passlib, OAuth2 Bearer | Role-Based Access Control (RBAC) with JWT tokens |

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |         React 18 + Vite Frontend      |
                                  | (Passenger Portal / Admin Dashboard)  |
                                  +-------------------+-------------------+
                                                      |
                                          HTTP / REST | Axios & JWT
                                                      v
                                  +---------------------------------------+
                                  |          FastAPI Backend Service      |
                                  |     (Routers, Middleware, Auth)       |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +---------------------+
                     |                                                                |
                     v                                                                v
   +-----------------------------------+                            +-----------------------------------+
   |       PostgreSQL Database         |                            |     CatBoost ML Prediction        |
   | (Users, Stations, Trains, Alerts) |                            |   (`crowd_occupancy_final.cbm`)   |
   +-----------------------------------+                            +-----------------------------------+
                     ^                                                                |
                     |                                                                |
                     +-------------------- Background Task (5 min) -------------------+
```

---

## 📁 Project Structure

```
MetroFLow_AI_New/
├── README.md                     # Project Master Documentation
├── requirements.txt              # Root Python Dependencies
├── datasets/                     # Raw & Synthetic Metro Data
│   ├── 01_crowd_occupancy_forecasting.csv
│   ├── 02_passenger_flow_forecasting.csv
│   ├── 03_crowd_risk_classification.csv
│   ├── 05_operational_analytics.csv
│   └── 06_station_master.csv     # Master Station Data across 10 Metro Networks
├── ml/                           # Machine Learning Pipeline
│   ├── models/
│   │   ├── crowd_occupancy_final.cbm   # Trained CatBoost Model
│   │   ├── crowd_final_features.json   # Feature Vector Definition
│   │   └── crowd_final_metrics.json    # Performance Metrics
│   ├── preprocess_crowd.py       # Data Cleaning & Feature Engineering
│   ├── training/                 # Model Training Scripts
│   ├── evaluation/               # Model Evaluation & Metrics
│   └── inference/                # Inference Testers
├── backend/                      # FastAPI Python Backend
│   ├── run_seed.py               # Database Seeding Script
│   ├── app/
│   │   ├── main.py               # Application Entry Point & Async Tasks
│   │   ├── config/               # Settings & Environment Variables
│   │   ├── database/             # SQLAlchemy Engine & Session
│   │   ├── models/               # ORM Database Schemas
│   │   ├── routers/              # API Endpoints (auth, stations, trains, ai, etc.)
│   │   ├── schemas/              # Pydantic Request/Response Models
│   │   ├── services/             # Core Services & ML Ingestion Logic
│   │   └── utils/                # Password Hashing & Security Helpers
└── frontend/                     # React + Vite Frontend Application
    ├── package.json              # Node.js Dependencies & Scripts
    ├── tailwind.config.js        # Styling Tokens & Theme Setup
    ├── vite.config.js            # Vite Bundler Configuration
    └── src/
        ├── App.jsx               # Main React Application Component
        ├── components/           # UI Modals, Navbar, Charts & Cards
        ├── context/              # Authentication & App Context
        ├── pages/                # Passenger & Admin View Controllers
        ├── services/             # Axios API Client
        └── styles/               # Global CSS & Tailwind Directives
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up and run MetroFlow AI locally on your development environment.

### Prerequisites

Ensure you have the following tools installed:
* **Python**: `v3.10` or higher
* **Node.js**: `v18.0.0` or higher (with `npm`)
* **PostgreSQL**: `v14` or higher running locally or accessible via URL

---

### 1. Database Setup (PostgreSQL)

Create a PostgreSQL database named `postgres` (or your preferred database name):

```sql
CREATE DATABASE postgres;
```

---

### 2. Backend Setup & Run

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file inside `backend/`:
   ```env
   PROJECT_NAME="Metro Flow API"
   API_V1_STR="/api"
   SECRET_KEY="your_super_secret_jwt_key"
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/postgres"
   ```

5. Seed the database with master stations, trains, and demo users:
   ```bash
   python run_seed.py
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   * The API will be live at `http://127.0.0.1:8000`
   * Interactive API docs (Swagger): `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup & Run

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file inside `frontend/`:
   ```env
   VITE_API_BASE_URL="http://127.0.0.1:8000/api"
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   * Open your browser and navigate to `http://localhost:5173`

---

## 🔑 Demo Credentials

After running `python run_seed.py`, the following demo accounts are created for testing:

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Passenger** | Demo User | `demo@metroflow.app` | `MetroFlow@123` | Live Crowd, Journey Planner, Alerts, Emergency |
| **Passenger** | Rahul Sharma | `passenger@metroflow.app` | `Passenger@123` | Live Crowd, Journey Planner, Profile |
| **Administrator** | System Administrator | `admin@metroflow.app` | `Admin@123` | Complete Control Center, AI Predictions, Analytics |
| **Operator** | Kashmere Gate Manager | `operator@metroflow.app` | `Operator@123` | Station Telemetry, Train Dispatching |

---

## 🔌 API Documentation

FastAPI automatically generates interactive documentation accessible when the backend server is running:
* **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT access token |
| `GET` | `/api/cities` | List all supported metro cities & line metadata |
| `GET` | `/api/stations` | Get stations, platform occupancy & current crowd stats |
| `GET` | `/api/trains` | Fetch live train schedules, headway & delays |
| `POST`| `/api/predict` | Run CatBoost ML crowd occupancy prediction for a station |
| `POST`| `/api/journey/plan` | Calculate crowd-optimized travel routes & fares |
| `GET` | `/api/alerts` | Retrieve active crowd alerts and service warnings |
| `POST`| `/api/emergency/alert` | Trigger emergency panic response & control dispatch |
| `GET` | `/api/admin/analytics` | Retrieve system analytics, revenues & operational metrics |

---

## 🧠 Machine Learning Pipeline

MetroFlow AI utilizes **CatBoost Regressor** trained on high-dimensional urban transit data.

```
+--------------------------+
| Telemetry & Input Data   |
| - AFC Smart Card Taps    |
| - Platform Dwell Time    |     +-------------------------+     +--------------------------+
| - Weather & AQI          | --> | Feature Engineering     | --> | CatBoost Regressor Model |
| - POI & Event Flags      |     | (`preprocess_crowd.py`) |     | (`crowd_occupancy.cbm`)  |
| - Time Slot & Peak Flags |     +-------------------------+     +-------------+------------+
+--------------------------+                                                   |
                                                                               v
                                                                 +--------------------------+
                                                                 | Output & Metrics         |
                                                                 | - Occupancy %            |
                                                                 | - Waiting Time (min)     |
                                                                 | - Risk Level (15/30/45m) |
                                                                 | - Dispatch Headway Rec.  |
                                                                 +--------------------------+
```

### Feature Vectors Included:
* **Temporal Attributes**: `hour`, `day_of_week`, `peak_period`, `is_weekend`, `office_hours_flag`
* **Station Parameters**: `station_type` (Interchange/Regular), `num_platforms`, `num_afc_gates`, `concourse_area_sqm`
* **Real-time Flow Indicators**: `afc_smart_card_taps`, `qr_ticket_taps`, `queue_length_at_gate`, `train_load_factor`, `avg_dwell_time`
* **External Conditions**: `weather_condition`, `temperature`, `rainfall_mm`, `special_event_flag`

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for Modern Urban Mobility & Smart Transit Infrastructure</sub>
</div>
