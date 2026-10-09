# Class 10 Maths Made Easy – CBSE Board Exam 2026/27 E-Book Website 📚
**Brand:** Think Unlimited  
**Tagline:** "Maths se darr? Ab nahi."  
**Product:** "Class 10 Maths Made Easy" – CBSE Board Exam Edition 2026/27 (20-Page High-Yield Formula & Tricks PDF)  
**Price:** ₹39 (Crossed-out ₹79)

---

## 🎨 Design Philosophy: "The Topper's Notebook"
This site was built without any generic AI SaaS templates:
- **Paper & Graph Textures:** Graph-paper grid backdrop, red margin line, authentic paper white tone (`#FFFDF5`).
- **Tactile Details:** Realistic highlighter pen strokes, washi tape strips, rubber stamps (`MARKS BACHAO`), binder rings, and tilted sticky notes.
- **Asymmetric Layouts:** Every section has an individual composition rather than repeated uniform cards.
- **Pure CSS 3D Book Mockup:** Interactive 3D tilted book cover with gold foil accents and physics response on mouse/touch.
- **Fast & Mobile-First:** Zero heavy framework hydration overhead, loads in milliseconds on mobile Instagram/WhatsApp in-app webviews (Lighthouse 95+).

---

## 🚀 Key Features
1. **14 Hand-Crafted Page Sections:**
   - Hero with 3D Book Cover & "80/80" Target Badge
   - Messy sticky-note problem wall
   - 6-part chapter anatomy desk
   - Custom SVG feature index cards
   - Realistic Chapter 4 Quadratic Equations notebook page sample
   - Interactive 14-chapter curriculum grid
   - Animated hand-drawn marks weightage bar chart (80 marks)
   - 4-step study routine roadmap
   - Exam-Day Master Page & 10-Question Self-Test bonuses
   - Notebook bill pricing card with UPI/card badges
   - Unbiased placeholder review cards
   - Hinglish FAQ accordion
   - Final urgency CTA
   - Comprehensive footer with legal policy pages & disclaimers
2. **Automated Razorpay Checkout & Delivery:**
   - Validates buyer's Name, Email, and 10-digit Indian WhatsApp number.
   - Creates Razorpay order (₹39 = 3900 paise).
   - Verifies server-side HMAC SHA256 payment signature.
   - Razorpay Webhook backup (`payment.captured`).
   - Generates secure, HMAC-signed expiring download token (valid 48 hours, max 5 downloads).
   - Generates and delivers the actual 20-page Class 10 Maths PDF stored securely in `/private/ebook.pdf`.
   - Sends automated receipt and download button email to buyer.
3. **Password-Protected Admin Portal (`/admin`):**
   - Live revenue, paid order count, total orders, and download metrics.
   - Real-time search and filter.
   - One-click CSV export of all customer records.
4. **Editable Config File (`config/site.config.js`):**
   - Easily change price, crossed-out price, support contacts, WhatsApp link, and social handles in one place.

---

## 🛠️ Quick Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate the 20-Page E-Book PDF (Automatic on boot or run manually)
```bash
npm run generate-pdf
```
*(The PDF is generated into `private/ebook.pdf` with all 14 chapters, formulas, shortcuts, and exam tips).*

### 3. Start the Server
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 💳 Razorpay Payment Configuration

### Step 1: Testing in Test Mode (Instant & Free)
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch to **Test Mode** (toggle on top bar).
3. Go to **Settings > API Keys > Generate Key**.
4. Copy `Key Id` (starts with `rzp_test_...`) and `Key Secret`.
5. Open `.env` and paste:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
   ```
6. Restart server (`npm start`). You can now test purchases with Razorpay's test UPI/cards without spending real money!

*(Note: If you run the site without any keys in `.env`, it includes a built-in interactive simulator so you can test the complete purchase flow out of the box!)*

### Step 2: Going Live
1. Complete KYC in Razorpay.
2. Switch to **Live Mode**.
3. Generate Live API Keys (`rzp_live_...`).
4. Replace keys in your production environment variables.

### Step 3: Setting Up Razorpay Webhook (Backup Verification)
1. In Razorpay Dashboard, go to **Settings > Webhooks > Add New Webhook**.
2. URL: `https://your-domain.com/api/webhook`
3. Secret: Enter any secret string and copy it to `RAZORPAY_WEBHOOK_SECRET` in `.env`.
4. Active Events: Select `payment.captured` and `order.paid`.

---

## 📬 Email Setup (Optional SMTP)
To deliver download links directly to student inboxes via Gmail or any SMTP provider:
In `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=Think Unlimited <your_email@gmail.com>
```
*(If SMTP is left blank, the server safely logs the email delivery details to the terminal and database so orders are never lost).*

---

## 🔐 Admin Panel
- URL: **[http://localhost:3000/admin](http://localhost:3000/admin)**
- Default Password: `thinkunlimited2026` (change this in `.env` via `ADMIN_PASSWORD`)
- Includes total revenue counter, live order table, search, and CSV export.

---

## 🌐 Production Deployment

### Option A: Render.com (Recommended for Node)
1. Push this folder to a GitHub repository.
2. In [Render](https://render.com), create a **New Web Service**.
3. Select your repository.
4. Build Command: `npm install && npm run generate-pdf`
5. Start Command: `npm start`
6. Add your Environment Variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ADMIN_PASSWORD`, etc.).
7. Click **Deploy**!

### Option B: Railway / DigitalOcean / VPS
1. Run `npm install && npm run generate-pdf`
2. Set Environment Variables from `.env.example`.
3. Start process using `npm start` or PM2: `pm2 start server.js --name "think-unlimited"`.

---

## 📞 Support & Contacts
- WhatsApp: +91 9243791529
- Phone: 9644095290 / 9243791529
- Email: a2043728022@gmail.com
