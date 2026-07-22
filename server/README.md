# TimeFlow Backend Server (Node.js + Express + MongoDB)

## 🚀 How to Run the Backend

### Prerequisites
- Node.js (v18+)
- MongoDB installed locally OR MongoDB Atlas connection string.

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timeflow
```
*(Or use your MongoDB Atlas URI e.g. `mongodb+sandbox.mongodb.net/...`)*

### 3. Start the Backend Server
```bash
# Development mode with auto-reload (Nodemon)
npm run dev

# Production mode
npm start
```

Server will start on: **`http://localhost:5000`**

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health Check |
| `GET` | `/api/tasks` | Get all tasks (or filter with `?date=YYYY-MM-DD`) |
| `GET` | `/api/tasks/:id` | Get single task by ID |
| `POST` | `/api/tasks` | Create new task |
| `PUT` | `/api/tasks/:id` | Update existing task |
| `DELETE` | `/api/tasks/:id` | Delete task by ID |

---

## 📄 Example JSON Task Payload (POST / PUT)
```json
{
  "date": "2026-07-21",
  "startTime": "09:00",
  "endTime": "10:30",
  "project": "TimeFlow",
  "module": "Backend API",
  "description": "Created Node.js Express REST API with MongoDB Mongoose",
  "status": "completed",
  "remarks": "API endpoints for CRUD operations"
}
```
