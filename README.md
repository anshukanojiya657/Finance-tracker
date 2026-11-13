# 💰 FinTrack: Personal Finance Tracker

A full-stack **MERN** application that helps users track their income and expenses, set monthly budgets, and monitor their spending habits. Each user has a private account, and no one can access another user's financial data.

Built as the final project for **DevCamp 2.0 (Web Development Track)**.

## 🔗 Live Demo

- **Live App:** https://frontend-lake-pi-77.vercel.app
- **Backend API:** https://finance-tracker-qjqx.onrender.com

> Note: The backend runs on Render's free plan, so the first request after a period of inactivity may take 30-60 seconds while the server wakes up.

## ✨ Features

### 🔐 Authentication
- User signup and login with form validation
- Passwords hashed using **bcrypt**
- Secure **JWT**-based authentication
- Protected routes on both frontend and backend

### 📊 Dashboard
- Total balance, total income and total expenses (calculated dynamically)
- Monthly spending summary with a month selector
- Income vs. expenses bar chart (Recharts)
- Recent transactions list

### 💳 Transactions
- Add, edit and delete income/expense transactions
- Fields: title, amount, type, category, date
- Filter by type and category
- Clean table layout with success and error messages

### 🎯 Budget & Categories
- Set a monthly spending budget (per month)
- Add, edit and delete categories
- Spent vs. remaining budget with a progress bar
- Visual warning when spending approaches (80%+) or exceeds (100%+) the budget

### 🔒 Security & Data Isolation
- Every database query is filtered by the logged-in user
- Users can only view and modify their own records

## 🛠️ Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React (Vite), React Router, Axios, Recharts  |
| Backend    | Node.js, Express.js                          |
| Database   | MongoDB (Mongoose), MongoDB Atlas            |
| Auth       | JWT, bcryptjs                                |
| Deployment | Vercel (frontend), Render (backend)          |

## 📁 Project Structure

```
Finance-tracker/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route logic (auth, transactions, categories, budget)
│   ├── middleware/      # JWT auth middleware
│   ├── models/          # Mongoose schemas (User, Transaction, Category, Budget)
│   ├── routes/          # API routes
│   └── server.js
└── frontend/
    └── src/
        ├── api/         # Axios instance
        ├── components/  # Navbar, Layout, ProtectedRoute
        ├── context/     # AuthContext
        └── pages/       # Auth, Dashboard, Transactions, Budget
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| POST   | `/api/auth/signup`  | Register a new user    |
| POST   | `/api/auth/login`   | Login and receive JWT  |
| GET    | `/api/auth/me`      | Get logged-in user     |

### Transactions (protected)
| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/transactions`         | List transactions (filter by type, category, month) |
| POST   | `/api/transactions`         | Add a transaction                    |
| PUT    | `/api/transactions/:id`     | Update a transaction                 |
| DELETE | `/api/transactions/:id`     | Delete a transaction                 |
| GET    | `/api/transactions/summary` | Income, expense and balance totals   |

### Categories (protected)
| Method | Endpoint               | Description         |
|--------|------------------------|---------------------|
| GET    | `/api/categories`      | List categories     |
| POST   | `/api/categories`      | Add a category      |
| PUT    | `/api/categories/:id`  | Update a category   |
| DELETE | `/api/categories/:id`  | Delete a category   |

### Budget (protected)
| Method | Endpoint       | Description                                   |
|--------|----------------|-----------------------------------------------|
| GET    | `/api/budget`  | Budget status for a month (spent, remaining)  |
| POST   | `/api/budget`  | Set the monthly budget                        |

## 🚀 Run Locally

### Prerequisites
- Node.js (LTS)
- A MongoDB database (local or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/anshukanojiya657/Finance-tracker.git
cd Finance-tracker
```

### 2. Setup the backend
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Start the server:
```bash
npm run dev
```

### 3. Setup the frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## 🌐 Deployment

- **Database:** MongoDB Atlas
- **Backend:** Render (Root Directory: `backend`, Start Command: `npm start`)
- **Frontend:** Vercel (Root Directory: `frontend`)

Environment variables used in production:
- Backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
- Frontend: `VITE_API_URL`

## 👤 Author

**Anshu**
GitHub: [@anshukanojiya657](https://github.com/anshukanojiya657)

---
Built with ❤️ for DevCamp 2.0