# BlazeNeuro Admin - Python Desktop Application

A desktop admin panel for BlazeNeuro built with Python and CustomTkinter, featuring a shadcn-inspired UI.

## Features

- 🔐 Secure login with email/password
- 👥 User management
- 📝 Blog management
- 🔐 OAuth applications management
- 📊 Dashboard with statistics
- 📈 Analytics (coming soon)
- ⚙️ Settings panel

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Run the application:
```bash
python main.py
```

## Configuration

Edit `.env` file:
- `API_URL`: Your BlazeNeuro API URL (default: http://localhost:3000)
- `AUTH_URL`: Your authentication URL (default: http://localhost:3000)

## Default Admin Credentials

Use the admin credentials from your BlazeNeuro web application:
- Email: admin@blazeneuro.com or ankityadav7420@gmail.com
- Password: Your admin password

## UI Theme

The application uses a dark theme inspired by shadcn/ui with the following color scheme:
- Background: #09090b
- Card: #18181b
- Muted: #27272a
- Border: #3f3f46
- Text: #fafafa
- Muted Text: #a1a1aa

## Requirements

- Python 3.8+
- customtkinter
- requests
- python-dotenv
- Pillow
