# Flow - AI-Powered Blog Generation System

## Setup

### 1. Database Setup

Update your PostgreSQL connection in `.env.local`:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_database
```

Push schema to database:
```bash
npm run db:push
```

### 2. Python Backend Setup

Install Python dependencies:
```bash
cd fastapi
pip install -r requirements.txt
```

Start FastAPI server:
```bash
python main.py
```

### 3. Next.js Frontend

Start the development server:
```bash
npm run dev
```

## Usage

### Create Blog via CLI

Run the Python CLI tool:
```bash
python fastapi/cli.py
```

Select option 1 (Create Blog) and enter your blog topic.

### Customize Data Flow

1. Go to http://localhost:3000/dashboard/data-flow
2. Right-click to add nodes
3. Click on a node to configure:
   - Prompt: AI instructions
   - Temperature: 0-2 (creativity level)
4. Connect nodes by dragging from handles
5. Press Delete to remove nodes/edges

### View Blogs

- Dashboard: http://localhost:3000/dashboard/blogs
- Public view: http://localhost:3000/blog/[uuid]

## Features

- ✅ OAuth authentication with BlazeNeuro
- ✅ Visual flow editor with ReactFlow
- ✅ Custom nodes with shadcn UI
- ✅ Animated gradient connections
- ✅ Node configuration (prompt, temperature)
- ✅ LocalStorage persistence
- ✅ Python CLI for blog creation
- ✅ FastAPI backend
- ✅ PostgreSQL + Drizzle ORM
- ✅ AI model integration (Modal)

## API Endpoints

### FastAPI (Port 8000)

- `POST /api/blogs/create` - Create new blog
- `GET /api/blogs/{id}` - Get blog by ID
- `GET /api/blogs` - List all blogs

## Environment Variables

```env
# Auth
BLAZENEURO_CLIENT_ID=
BLAZENEURO_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# AI Model
MODAL_ENDPOINT_URL=
AI_MODEL_URL_V2=
AI_API_SECRET=

# Backend
FASTAPI_URL=http://localhost:8000
```
