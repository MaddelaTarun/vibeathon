# Kitchen-Pulse Testing Instructions

## 🚀 Quick Test (5 Minutes)

### Step 1: Start the System
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend (in new terminal)
npm run dev
```

Wait for both to start:
- Backend: `🚀 Kitchen-Pulse running on http://localhost:3001`
- Frontend: `Local: http://localhost:3000`

### Step 2: Test Login Flow
1. Open browser: `http://localhost:3000`
2. **Test Error Handling:**
   - Select "Customer" role
   - Leave table number empty
   - Click "Engage System"
   - ✅ **Expected:** Red error message appears
3. **Test Successful Login:**
   - Enter name: "Test User"
   - Select "Manager" role
   - Click "Engage System"
   - ✅ **Expected:** Redirected to Manager Dashboard

### Step 3: Verify Real-Time Updates
1. On Manager Dashboard, watch for:
   - ✅ Station stress levels changing
   - ✅ Tickets appearing and updating
   - ✅ Metrics updating every second
   - ✅ AI briefing text (if Groq API key configured)
2. Open browser console (F12)
   - ✅ **Expected:** "✓ WebSocket connected" message
   - ✅ No error messages

### Step 4: Test Stress System
```bash
# Terminal 3 (new terminal)
npm run stress-test:advanced 50 1
```
Watch the Manager Dashboard:
- ✅ Station stress levels spike
- ✅ Autonomous actions appear in Intelligence Feed
- ✅ Labor reallocations trigger
- ✅ Metrics update rapidly

---

## 🔍 Detailed Testing (15 Minutes)

### Test 1: All Three Roles

#### Customer Role
1. Logout from Manager view
2. Login as "Customer" with table "12"
3. ✅ Browse menu by cuisine tabs
4. ✅ Add items to cart
5. ✅ Select a chef
6. ✅ Place order
7. ✅ See order status update

#### Waiter Role
1. Logout and login as "Waiter"
2. ✅ Browse menu
3. ✅ Add multiple items to cart
4. ✅ Enter table code
5. ✅ Place order
6. ✅ See order transmitted

#### Manager Role
1. Logout and login as "Manager"
2. ✅ See all stations
3. ✅ Monitor real-time metrics
4. ✅ Watch autonomous actions
5. ✅ Read AI briefing

### Test 2: Responsive Design

#### Mobile (375px)
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" or set width to 375px
4. Navigate through all pages
5. ✅ No horizontal scroll
6. ✅ Text readable
7. ✅ Buttons accessible
8. ✅ Forms usable

#### Tablet (768px)
1. Set width to 768px
2. ✅ Grid layouts adjust
3. ✅ Spacing appropriate
4. ✅ Navigation works

#### Desktop (1920px)
1. Set width to 1920px
2. ✅ Content centered
3. ✅ Max-width respected
4. ✅ No excessive whitespace

### Test 3: Error Handling

#### Network Errors
1. Stop the backend server
2. Try to login
3. ✅ **Expected:** "Unable to connect to server" error
4. Restart server
5. Refresh page
6. ✅ Login works again

#### Validation Errors
1. Customer role without table number
   - ✅ Error message shown
2. Empty name field
   - ✅ Defaults to "Guest"
3. Invalid table code in waiter view
   - ✅ Order button disabled

### Test 4: WebSocket Reliability

#### Connection Test
1. Login as Manager
2. Open Network tab in DevTools
3. Filter by "WS"
4. ✅ See WebSocket connection
5. ✅ See messages flowing

#### Reconnection Test
1. Stop backend server
2. ✅ "Connected" indicator turns red/false
3. Restart backend server
4. Refresh page
5. ✅ Connection restored

### Test 5: Stress Testing

#### Basic Stress Test
```bash
npm run stress-test
```
- ✅ Progress bar shows
- ✅ Completes in ~60 seconds
- ✅ Dashboard shows activity

#### Advanced Stress Test
```bash
# Extreme load
npm run stress-test:advanced 100 2
```
Watch for:
- ✅ Multiple stations turn red (>85% stress)
- ✅ "Labor Reallocation" actions appear
- ✅ "Auto-86" margin protection triggers
- ✅ AI briefing updates with warnings
- ✅ Metrics show high autonomous action count

#### Sustained Load
```bash
# Longer duration
npm run stress-test:advanced 30 5
```
- ✅ System remains stable
- ✅ No memory leaks
- ✅ Consistent performance

---

## 🐛 Troubleshooting Tests

### Issue: "Cannot connect to server"
**Test:**
1. Check if backend is running: `curl http://localhost:3001/api/menu`
2. ✅ Should return JSON menu data
3. If not, restart: `npm run server`

### Issue: "WebSocket disconnected"
**Test:**
1. Check browser console for errors
2. Verify backend is running
3. Check firewall settings
4. Try different browser

### Issue: "Groq AI not working"
**Test:**
1. Check `.env` file exists
2. Verify API key format: `GROQ_API_KEY=gsk_...`
3. Test API key:
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```
4. ✅ Should return list of models
5. Restart server after adding key

### Issue: "Stress test not working"
**Test:**
1. Verify Node.js version: `node --version` (should be 18+)
2. Check dependencies: `npm list chalk`
3. ✅ Should show chalk@5.6.2
4. If missing: `npm install`

---

## ✅ Acceptance Criteria

### Functionality
- [x] All three roles accessible
- [x] Login with validation
- [x] Error messages display
- [x] Real-time updates work
- [x] WebSocket connects
- [x] Stress test runs
- [x] AI briefing updates (with API key)

### User Experience
- [x] Responsive on mobile
- [x] Responsive on tablet
- [x] Responsive on desktop
- [x] Loading states show
- [x] Error states show
- [x] Success feedback shows

### Code Quality
- [x] TypeScript compiles
- [x] No console errors
- [x] No unused variables
- [x] Proper error handling
- [x] Clean code structure

### Documentation
- [x] Quick start guide
- [x] Troubleshooting guide
- [x] API documentation
- [x] Testing instructions

---

## 📊 Performance Benchmarks

### Expected Performance
- **Page Load:** < 2 seconds
- **Login:** < 500ms
- **WebSocket Connection:** < 100ms
- **Real-time Update Latency:** < 50ms
- **Stress Test (50 tickets/min):** Stable operation

### Monitoring Points
1. **Browser DevTools > Performance**
   - Record during stress test
   - ✅ No memory leaks
   - ✅ Smooth animations (60fps)

2. **Network Tab**
   - ✅ API calls < 200ms
   - ✅ WebSocket messages < 10KB

3. **Console**
   - ✅ No errors
   - ✅ No warnings

---

## 🎯 Demo Script (For Presentations)

### 1. Introduction (30 seconds)
"Kitchen-Pulse is an autonomous kitchen management system that uses AI agents to optimize restaurant operations in real-time."

### 2. Show the Problem (30 seconds)
1. Login as Manager
2. Point out station stress levels
3. "During rush hour, kitchens face chaos - orders pile up, staff get overwhelmed, profits leak."

### 3. Trigger the Chaos (30 seconds)
```bash
npm run stress-test:advanced 100 2
```
"Let's simulate Friday night rush - 100 orders per minute."

### 4. Show the Solution (60 seconds)
Point out on dashboard:
1. **Station Monitor:** "Watch stress levels spike"
2. **Intelligence Feed:** "AI detects bottlenecks automatically"
3. **Labor Reallocation:** "System moves qualified staff to critical stations"
4. **Auto-86:** "Low-margin orders cancelled to protect profit"
5. **AI Briefing:** "Strategic advice from Groq AI"

### 5. Show the Results (30 seconds)
Point to metrics:
- "X autonomous actions taken"
- "Y labor reallocations"
- "Z margin protected"
- "All without human intervention"

### 6. Close (30 seconds)
"This is B2B infrastructure - the brain that makes decisions, not just another menu app."

**Total Time:** 3.5 minutes

---

## 📝 Test Report Template

```markdown
# Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [OS, Browser, Node version]

## Test Results

### Functionality Tests
- [ ] Login flow: PASS / FAIL
- [ ] Error handling: PASS / FAIL
- [ ] Real-time updates: PASS / FAIL
- [ ] Stress test: PASS / FAIL

### Responsive Tests
- [ ] Mobile (375px): PASS / FAIL
- [ ] Tablet (768px): PASS / FAIL
- [ ] Desktop (1920px): PASS / FAIL

### Performance Tests
- [ ] Page load < 2s: PASS / FAIL
- [ ] No memory leaks: PASS / FAIL
- [ ] Smooth animations: PASS / FAIL

## Issues Found
1. [Description]
   - Severity: CRITICAL / HIGH / MEDIUM / LOW
   - Steps to reproduce:
   - Expected:
   - Actual:

## Overall Assessment
PASS / FAIL

## Notes
[Additional observations]
```

---

**Happy Testing! 🎉**

For issues or questions, check:
- `QUICKSTART.md` - Setup guide
- `FIXES-APPLIED.md` - What was fixed
- `README.md` - Full documentation
