# 📊 Oversight Hub (React)

> Admin dashboard for monitoring and managing the Glad Labs platform

## 📍 Location

- **Source**: `web/oversight-hub/`
- **Main Entry**: `web/oversight-hub/README.md` (component-level)
- **Component Docs**: This folder (`docs/components/oversight-hub/`)

---

## 📚 Documentation

### Development & Setup

- See `README.md` in `web/oversight-hub/` for local development

### Configuration

- **`.env.example`** - Environment variables template (uses `VITE_*` prefix)
- **Vite configuration** - `vite.config.js` at `web/oversight-hub/`
- **Routing configuration** - Application routes setup

---

## 🎯 Key Features

- **React 18** - Modern frontend framework
- **Zustand** - Global state management
- **Material-UI** - Component library
- **Task Management** - Create, track, and execute AI tasks
- **Dashboard Views** - System health, financials, content queue, marketing analytics
- **Real-time Updates** - WebSocket connection to FastAPI backend
- **Cost Tracking** - Monitor AI model costs and optimize spending

---

## 📂 Folder Structure

```
web/oversight-hub/
├── README.md                    ← Component README
├── src/
│   ├── App.jsx                 ← Root application component
│   ├── main.jsx                ← Vite entry point
│   ├── components/
│   │   ├── Header.jsx          ← App header
│   │   ├── Sidebar.jsx         ← Navigation sidebar
│   │   ├── TaskList.jsx        ← Task list component
│   │   └── [other components]
│   ├── routes/
│   │   ├── Dashboard.jsx       ← Dashboard route
│   │   ├── Content.jsx         ← Content management
│   │   ├── Analytics.jsx       ← Analytics view
│   │   └── Settings.jsx        ← Settings
│   ├── hooks/
│   │   ├── useTasks.js         ← Tasks hook
│   │   └── useWebSocket.js     ← WebSocket hook
│   ├── services/
│   │   └── taskService.js      ← Task operations (REST API)
│   ├── store/
│   │   └── useStore.js         ← Zustand state management
│   └── lib/
│       ├── api.js              ← FastAPI client (http://localhost:8000)
│       └── date.js             ← Date utilities
└── public/                     ← Static assets
```

---

## 🔗 Integration Points

### API Integration

**Client**: `src/lib/api.js`

Connects to:

- Co-founder Agent (`http://localhost:8000`) via REST
- Real-time updates via WebSocket: `ws://localhost:8000/api/workflow-progress/{id}`

### State Management

**Store**: `src/store/useStore.js`

Zustand global state for:

- Task list and status
- Agent monitoring data
- System health metrics

---

## 🧪 Testing

```bash
# Start from oversight-hub directory
cd web/oversight-hub

# Run tests (Vitest)
npx vitest run --pool=forks --poolOptions.forks.maxForks=4

# Build for production
npm run build
```

---

## 🚀 Development Workflow

### Local Development

```bash
# Start Vite dev server
npm run dev

# Run tests (Vitest)
npx vitest run

# Build for production
npm run build
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 📋 Related Documentation

**In this component docs:**

- Setup: See `README.md` in `web/oversight-hub/`

**In main docs hub:**

- Dashboard Architecture: `docs/02-Architecture/System-Design.md`
- Deployment: `docs/05-Operations/Operations-Maintenance.md`

---

## 🔑 Environment Variables

Required in `web/oversight-hub/.env.local`:

```
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_AGENT_URL=http://localhost:8000
VITE_GH_OAUTH_CLIENT_ID=<your-github-oauth-client-id>
```

Note: Vite requires the `VITE_` prefix for env vars to be accessible in browser code via `import.meta.env.VITE_*`.

---

## ✅ Quick Links

- **Development**: Local setup in `web/oversight-hub/README.md`
- **Architecture**: `docs/02-Architecture/System-Design.md`
- **Deployment**: `docs/05-Operations/Operations-Maintenance.md`
