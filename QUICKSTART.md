# Kitchen-Pulse Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Groq API (Optional but Recommended)
1. Get your free API key from [Groq Console](https://console.groq.com/keys)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your API key to `.env`:
   ```
   GROQ_API_KEY=your_actual_api_key_here
   ```

### Step 3: Start the Application

**Terminal 1 - Start Backend Server:**
```bash
npm run server
```
Wait for: `🚀 Kitchen-Pulse running on http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Wait for: `Local: http://localhost:3000`

**Open Browser:**
Navigate to `http://localhost:3000`

---

## 🎭 User Roles

### 1. **Customer** (Diner Experience)
- Browse menu by cuisine
- Select personal chef
- Place orders
- Track order status in real-time
- Rate chef performance

### 2. **Waiter** (Service Staff)
- View all table orders
- Monitor order status
- Serve completed orders
- Manage multiple tables

### 3. **Manager** (Command Center) ⭐
- **Real-time Station Monitoring**: See kitchen stress levels
- **AI Situation Briefing**: Get strategic insights from Groq AI
- **Autonomous Actions Log**: Watch AI make decisions
- **Margin Protection**: Track profit at risk
- **Labor Reallocation**: See staff moved automatically
- **Auto-86 Triggers**: View cancelled low-margin orders

---

## 🔥 Stress Testing

### Basic Stress Test
```bash
npm run stress-test
```
Simulates 50 tickets in 60 seconds

### Advanced Stress Test
```bash
npm run stress-test:advanced [tickets-per-minute] [duration-minutes]
```

**Examples:**
```bash
# 50 tickets/min for 1 minute (default)
npm run stress-test:advanced

# 100 tickets/min for 2 minutes (extreme)
npm run stress-test:advanced 100 2

# 30 tickets/min for 5 minutes (sustained load)
npm run stress-test:advanced 30 5
```

**What to Watch:**
- Station stress levels spike above 85%
- Autonomous labor reallocations kick in
- Auto-86 margin protection activates
- AI briefing updates with strategic advice

---

## 🎯 What Makes This Special?

### Agentic AI Architecture
Kitchen-Pulse uses **3 autonomous agents** working together:

1. **Analyst Agent**: Monitors station stress, ticket delays, profit at risk
2. **Planner Agent**: Decides when to reallocate labor or cancel orders
3. **Architect Agent**: Executes skill-based staff reallocation

### Key Features
- ✅ **Skill-Based Labor Reallocation**: Staff moved based on qualifications
- ✅ **Margin Protection**: Auto-86 low-profit orders during overload
- ✅ **Real-time Telemetry**: Live kitchen stress monitoring
- ✅ **AI Strategic Briefing**: Groq-powered situation analysis
- ✅ **Zero Manual Intervention**: Fully autonomous decision-making

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure backend is running: `npm run server`
- Check port 3001 is not in use
- Verify no firewall blocking localhost

### "WebSocket disconnected"
- Backend must be running first
- Check browser console for errors
- Try refreshing the page

### "Groq AI not working"
- Verify `.env` file exists with valid API key
- Check API key at [Groq Console](https://console.groq.com/keys)
- Restart server after adding API key

### Stress test not working
- Ensure server is running first
- Check you're using Node.js 18+
- Verify chalk dependency is installed

---

## 📊 Monitoring the System

### Manager Dashboard Metrics

**Station Capacity Monitor**
- Green (0-60%): Optimal
- Yellow (60-85%): Elevated
- Red (85-100%): Critical

**Vitals Panel**
- Total Tickets: All orders processed
- Completed: Successfully finished
- Autonomous Actions: AI decisions made
- Labor Reallocations: Staff moves
- Auto-86 Count: Cancelled orders
- Profit at Risk: Money in delayed orders

**Intelligence Feed**
- Real-time log of all AI decisions
- Color-coded by severity
- Shows reasoning and impact

---

## 🎨 Design Philosophy

**Minimal. Calm. Professional.**

- Dark theme reduces eye strain during long shifts
- Gold accents highlight critical information
- Subtle animations provide feedback without distraction
- Typography hierarchy guides attention
- Progressive disclosure keeps interface clean

---

## 🔧 Development

### Project Structure
```
smart-kitchen/
├── server/           # Backend (Express + WebSocket)
│   ├── index.js      # Main server
│   ├── expeditor.js  # Agentic decision engine
│   ├── telemetry.js  # Kitchen simulation
│   └── *.js          # Manager modules
├── src/              # Frontend (React + TypeScript)
│   ├── pages/        # Role-based views
│   ├── components/   # Reusable UI components
│   └── context/      # State management
└── scripts/          # Stress testing tools
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, WebSocket
- **AI**: Groq (Llama 3 70B)
- **Real-time**: WebSocket for live updates

---

## 📚 Learn More

- [Full Documentation](./README.md)
- [UI & Scenario Guide](./README-UI-SCENARIO.md)
- [Setup Details](./SETUP.md)

---

## 🎓 For Hackathon Judges

**What We Built:**
A B2B kitchen operations platform that uses **agentic AI** to autonomously manage restaurant chaos.

**Key Innovation:**
Unlike menu apps, we built the "brain" that **makes decisions** - reallocating staff, protecting margins, and optimizing throughput without human intervention.

**Technical Highlights:**
- Multi-agent decision engine (Analyst → Planner → Architect)
- Skill-based labor routing (not just random assignment)
- Real-time margin protection (Auto-86 low-profit orders)
- Live AI strategic briefing (Groq integration)
- Professional kitchen simulation (realistic stress patterns)

**Try This:**
1. Login as Manager
2. Run: `npm run stress-test:advanced 100 2`
3. Watch the AI handle 100 tickets/min for 2 minutes
4. See autonomous labor reallocations in action
5. Check the AI briefing for strategic insights

---

**Built with ❤️ using oh-my-claudecode agent patterns**
