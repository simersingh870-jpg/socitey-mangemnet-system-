# 🏛️ Society Management System

Dark Blue Theme | HTML + CSS + JS + Node.js + MongoDB

---

## 📁 Project Structure

```
society-management/
├── index.html           ← Login / Register Page
├── user-dashboard.html  ← Resident Dashboard
├── admin-dashboard.html ← Admin Dashboard
├── server.js            ← Node.js + Express Backend
├── package.json
└── README.md
```

---

## 🚀 Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your machine:
```bash
mongod
```

### 3. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Open in Browser
```
http://localhost:3000
```

---

## 👤 Default Credentials

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@society.com   | admin123  |
| User  | Register via form   | your choice |

---

## ✅ Features

### User Dashboard
- 🔐 Register with: Name, Email, Password, Phone, Flat No, Member ID
- 🔧 Submit Maintenance Requests (Type, Priority, Description)
- 📢 File Complaints (Category, Subject, Details)
- 📋 View Admin Notices
- 🚗 Add Vehicle Details (Type, Make, Model, Reg No, Color, Parking Slot)
- 🚨 Emergency Contact Button (Police, Fire, Ambulance, Society)
- 👤 Profile Management

### Admin Dashboard
- 👥 View all registered residents with their details
- 🔧 View & update status of all maintenance requests
- 📢 View & resolve all complaints
- 🚗 View all vehicle registrations
- 📋 Post notices (Urgent / General / Info)
- 🚨 Manage emergency contacts
- 📊 Overview statistics dashboard

---

## 🔌 API Endpoints

| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Register user      |
| POST   | /api/auth/login       | Login              |
| GET    | /api/users            | All users (admin)  |
| POST   | /api/maintenance      | Create request     |
| GET    | /api/maintenance      | Get requests       |
| PUT    | /api/maintenance/:id  | Update status      |
| POST   | /api/complaints       | File complaint     |
| GET    | /api/complaints       | Get complaints     |
| PUT    | /api/complaints/:id   | Update status      |
| POST   | /api/vehicles         | Add vehicle        |
| GET    | /api/vehicles         | Get vehicles       |
| POST   | /api/notices          | Post notice (admin)|
| GET    | /api/notices          | Get all notices    |
| GET    | /api/emergency        | Get emergency list |
| POST   | /api/emergency        | Add contact (admin)|
