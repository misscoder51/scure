# S-Cure Health Network

## Technologies Used

**Frontend:**
- React 18
- React Router DOM v6
- CSS3 (Custom Glassmorphism)
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Authentication
- Socket.io for Real-Time WebSockets
- Simple-Peer (WebRTC) for Video Calling

## How It Works

S-Cure is a comprehensive healthcare network designed for modern university campuses. The system operates through distinct, role-based workflows:

1. **Students** can log in, run their symptoms through an AI-powered diagnostic checker, and seamlessly book appointments with campus doctors.
2. **Doctors** manage their schedules through a dedicated dashboard and can initiate secure, peer-to-peer WebRTC video consultations with patients directly in the browser.
3. **Pharmacists** receive instant real-time notifications via Socket.io when a doctor issues a prescription, allowing them to track and dispense medication efficiently.
4. **Administrators** have oversight of the entire clinic's operations and user management.

## How to Deploy

To deploy S-Cure into a live production environment, the MERN stack is split into specialized hosting platforms for optimal performance and security:

### 1. Database (MongoDB Atlas)
- Host the database on **MongoDB Atlas** (Free Tier).
- Ensure your cluster's Network Access is configured to allow connections from your backend.
- Retrieve the connection string (MONGO_URI) to use in your backend environment variables.

### 2. Backend (Render.com)
- Deploy the `backend` folder as a **Web Service** on **Render.com**.
- Set the build command to `npm install` and the start command to `node server.js`.
- Add your environment variables: `MONGO_URI`, `JWT_SECRET`, and `PORT`.
- Render automatically provides a secure HTTPS URL for your live API.

### 3. Frontend (Vercel)
- Deploy the `frontend` folder to **Vercel** as a **Create React App**.
- Before deploying, ensure the frontend API calls are pointed to your new Render backend URL instead of `localhost`.
- Vercel handles the edge-caching and provides a lightning-fast, production-ready React application.
