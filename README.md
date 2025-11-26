🏥 Smart Drug Inventory & Supply Chain Management System
Real-Time MERN-Based Medical Inventory Tracking
📌 Team Details

Team Name: Warriors
Team Members:

Vikas K

Varun T B

Mahesh N

🚨 Problem Statement

Hospitals struggle to track drug availability, expiry, and movement accurately. Manual systems lead to:

❌ Stockouts (life-saving medicines unavailable)

❌ Wastage due to expired drugs

❌ Delayed supply between warehouse & pharmacies

❌ Poor visibility of where medicines are and in what condition

A smarter real-time system is needed to ensure the right medicines reach the right place at the right time.


fa479b27-17d2-4d29-9df4-9609b0e…

💡 Our Solution

We built a Smart Real-Time Drug Inventory and Supply Chain Management System using the MERN stack.

✔️ What it does

Tracks drug stock, expiry, temperature, and movement

Updates inventory instantly whenever drugs are added, used, or transferred

Sends email alerts for:

Low stock

Expiring medicines

Wrong storage temperature

Delayed supply

Manages warehouse → pharmacy transfer, updating stock at both ends

Prevents shortages and improves transparency


fa479b27-17d2-4d29-9df4-9609b0e…

📝 Abstract

Managing medical inventory has become increasingly complex in hospitals. Manual systems often fail due to inaccurate tracking, expiry mismanagement, and inefficiencies in drug movement.

To solve this, we developed a real-time MERN-based Drug Inventory & Supply Chain Management Platform. It ensures the “Right Quantity of the Right Product at the Right Place at the Right Time.”

The system provides:

🔄 Instant stock and expiry updates

🚚 Warehouse-to-pharmacy movement tracking

✉️ Automated email alerts

🧊 Condition monitoring (e.g., temperature)

📉 Reduced wastage

📊 Faster decision making


fa479b27-17d2-4d29-9df4-9609b0e…

🏗️ Tech Stack & System Architecture
MERN Stack
Component	Purpose
MongoDB	Stores drug data, stock, expiry, movement logs
Express.js	Backend API handling all inventory operations
React.js	Interactive dashboard for all stakeholders
Node.js	Server handling real-time communication
Additional Core Technologies

Socket.io – Real-time stock and alert updates

Nodemailer / Email API – Sends critical alerts

Cloud Storage – For storing logs / future image data


fa479b27-17d2-4d29-9df4-9609b0e…

Why MERN for This Project?

Single language (JavaScript) across frontend & backend

Real-time data capability

Highly scalable (thousands of drug entries, multiple warehouses)

Ideal for fast-changing medical inventory data

📡 System Features
1️⃣ Real-Time Inventory Tracking

Auto-updates for every add / remove / update

Status visible across all devices instantly

2️⃣ Expiry & Condition Monitoring

Alerts before expiry

Track storage temperature and raise alerts

3️⃣ Warehouse → Pharmacy Transfer Flow

One-click drug transfer

Auto-stock update on both sides

4️⃣ Email Alert System

Low stock

Wrong storage conditions

Shipment delays

5️⃣ User Roles

Warehouse Admin

Pharmacist

System Admin

6️⃣ Transparent Report Generation

Daily / weekly stock flow

Expiry logs

Transfer logs

📂 Project Flow (Architecture Overview)
Warehouse Admin
     |
     |  Adds / Updates drugs
     v
Backend API (Express.js)
     |
     |  Stores & Updates
     v
MongoDB Database <----> Node.js Server <----> Socket.io (Real-Time)
     |
     v
React Dashboard (Pharmacist / Admin)
     |
     v
Email Alert System (Nodemailer)


Flow Summary:
Every update → reflected in DB → instantly pushed to all dashboards → alerts sent automatically


fa479b27-17d2-4d29-9df4-9609b0e…

🎯 Results

✔️ Reduced delays in drug movement

✔️ Eliminated manual errors

✔️ Ensured continuous medicine availability

✔️ Achieved complete transparency in supply chain

✔️ Improved patient care

🔗 Project Links

GitHub Repository: MaheshN1821/hackathon

Project Demo Video: https://drive.google.com/file/d/17suSVmYxs6VhG19ObMfZE5KbJ55meEXa/view?usp=sharing

📌 How to Run the Project
1. Clone the Repository
git clone https://github.com/MaheshN1821/hackathon
cd hackathon

2. Install Dependencies
Backend:
cd backend
npm install

Frontend:
cd frontend
npm install

3. Start the Project
Backend:
npm start

Frontend:
npm run dev

4. Create .env File

Include details like:

MONGO_URI=
EMAIL_USER=
EMAIL_PASS=
JWT_SECRET=

📘 Future Enhancements

📦 Barcode/QR-based medicine scanning

❄️ IoT-based temperature tracking sensors

🤖 AI-based demand prediction for hospitals

📲 Mobile App version (React Native)

🔐 Role-based advanced authentication (OAuth / Clerk)

👍 Conclusion

Our smart medical inventory system replaces slow, error-prone manual processes with a modern, automated, real-time solution that improves drug availability, reduces wastage, and supports better hospital functioning.
