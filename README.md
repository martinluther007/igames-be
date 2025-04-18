# 🎮 iGaming Backend

This is the backend for the iGaming assignment. It handles user authentication, session management, game logic, and real-time communication via WebSockets.

---

## 🚀 Features

- User registration/login with JWT
- Real-time game sessions (20s duration) via Socket.IO
- Store and retrieve player stats and game sessions from MongoDB
- WebSocket event handling for:
  - Countdown
  - Player joining
  - Player count updates
  - Session start/end
- API to get top 10 players and user-specific stats

---

## 🛠️ Technologies

- Node.js
- Express
- MongoDB (via Mongoose)
- Socket.IO
- JWT
- CORS

---

## 🧪 Setup Instructions

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **run the development server**:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## 📡 API Endpoints

| Method | Endpoint       | Description                    |
| ------ | -------------- | ------------------------------ |
| POST   | /auth/register | Register user by username      |
| GET    | /leaderboard   | Top 10 users by wins           |
| GET    | auth/stats     | Get wins/losses (JWT required) |

### Listened to by the backend

| Event Name  | Description                           |
| ----------- | ------------------------------------- |
| `join_game` | Triggered when a user joins a session |

### Emitted by the backend

| Event Name       | Description                                  |
| ---------------- | -------------------------------------------- |
| `session_start`  | Triggered when a new game session starts     |
| `session_end`    | Triggered when the session ends with results |
| `countdown_tick` | Sends the countdown time left in seconds     |
| `numOfPlayers`   | Number of players currently in the session   |
