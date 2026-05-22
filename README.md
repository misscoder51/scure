<div align="center">
  <img src="https://i.imgur.com/kS9lY45.png" alt="S-Cure Logo" width="100"/>
  <h1>S-Cure Health Network</h1>
  <p><strong>The Campus Clinic, Uncaged.</strong></p>
  <p>A premium, cinematic healthcare platform designed for modern university campuses.</p>
</div>

<br />

## 🌟 Overview

**S-Cure** is a comprehensive, AI-powered healthcare network built specifically to digitize and streamline campus clinics. It moves away from the sterile, corporate look of legacy medical software, instead offering a handcrafted, ultra-premium UI ("Nordic Ice" aesthetic) that feels like a Silicon Valley Series-A product.

Built on the robust **MERN Stack** (MongoDB, Express, React, Node.js), S-Cure provides military-grade encrypted health records, real-time WebRTC teleconsultations, and role-based dashboards tailored for every user on campus.

## 🚀 Key Features

- **Role-Based Workspaces:** Dedicated, highly customized dashboards for Students, Doctors, Pharmacists, and Administrators.
- **Teleconsultations (WebRTC):** Secure, peer-to-peer video calls directly within the browser for remote doctor visits.
- **Symptom Checker:** An intelligent symptom diagnostic tool designed to triage students before they book an appointment.
- **Live Notifications:** Real-time Socket.io integration alerts users when an appointment is confirmed, or a prescription is ready.
- **Encrypted Records:** Medical history is treated with the utmost privacy, utilizing advanced backend encryption.
- **Bespoke UI/UX:** A custom-built, glassmorphic UI featuring ambient glow gradients, micro-animations, and a fully responsive grid system.

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router DOM v6
- Lucide React (Icons)
- CSS3 (Custom Glassmorphism & Animations)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Authentication
- Socket.io for Real-Time WebSockets
- Simple-Peer (WebRTC) for Video Calling
- Stripe API for Payments

## ⚙️ Local Development Setup

To run S-Cure locally on your machine, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas Cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/misscoder51/scure.git
cd scure
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder and add your variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scure
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_mock_key
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the development server:
```bash
npm start
```
The application will be running at `http://localhost:3000`.

## 🔒 Security & Privacy
S-Cure was built with data privacy in mind. Medical data is highly sensitive, so the platform enforces strict JWT validation on all API routes, ensures passwords are encrypted via bcrypt, and isolates patient data so that only authorized doctors and pharmacists can access relevant scopes.

---
*Designed & Developed for the future of student healthcare.*
