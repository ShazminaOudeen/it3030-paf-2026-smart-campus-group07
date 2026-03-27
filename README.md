# 🏢 Assetra – Smart Campus Asset & Facility Management System

![Spring Boot](https://img.shields.io/badge/SpringBoot-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![GitHub Actions](https://img.shields.io/badge/CI-CD-GitHubActions-black)


Spring Boot • React • REST API • MySQL • Tailwind CSS • OAuth 2.0

---

## 📌 Description

**Assetra** is a full-stack Smart Campus Operations Hub designed to streamline **facility booking, asset management, and maintenance workflows** within a university environment.

The system connects **students, staff, technicians, and administrators** through a secure, role-based platform that improves efficiency, transparency, and operational control.

Assetra follows a **modern layered architecture** with a Spring Boot REST API and a React-based frontend, ensuring scalability and maintainability.

---

## 🛠 Tech Stack

### 🔹 Backend
- Java
- Spring Boot (REST API)
- Spring Security (OAuth 2.0)
- Hibernate / JPA

### 🔹 Frontend
- React.js
- JavaScript
- Tailwind CSS
- Vite

### 🔹 Database
- PostgreSQL

### 🔹 Tools
- Git & GitHub
- GitHub Actions (CI/CD)
- Postman / Thunder Client
- VS Code 

---

## ✨ Features (Functional Overview)

### 🏢 Module A – Facilities & Assets Catalogue
- Manage resources (lecture halls, labs, equipment)
- Add metadata (capacity, location, availability, status)
- Search and filter resources

---

### 📅 Module B – Booking Management
- Request bookings (date, time, purpose)
- Booking workflow:
  - **PENDING → APPROVED / REJECTED → CANCELLED**
- Prevent scheduling conflicts
- Admin approval system

---

### 🛠 Module C – Maintenance & Incident Management
- Create incident tickets
- Upload image evidence (up to 3 files)
- Ticket workflow:
  - **OPEN → IN_PROGRESS → RESOLVED → CLOSED**
- Technician assignment & updates
- Comment system

---

### 🔔 Module D – Notifications
- Booking status updates
- Ticket status alerts
- Comment notifications
- In-app notification panel

---

### 🔐 Module E – Authentication & Authorization
- OAuth 2.0 Login (Google Sign-In)
- Role-based access:
  - USER
  - ADMIN
  - TECHNICIAN
- Secure API endpoints

---

## 🚀 Installation & Setup Guide

### 📌 Prerequisites

Make sure you have installed:

- Java JDK 17+
- Node.js (v18 or above)
- MySQL Server
- Git
- VS Code 

---

## 🔽 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/assetra.git
cd assetra
```

---

## ⚙️ 2️⃣ Backend Setup (Spring Boot)

```bash
cd backend
```

### 📦 Install Dependencies (Maven)

```bash
mvn clean install
```

### 🔐 Configure `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/assetra_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

### ▶ Run Backend

```bash
mvn spring-boot:run
```

Backend runs on:
http://localhost:8082

---

## 💻 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
http://localhost:5173

---

## 🔗 API Integration

- Base URL: http://localhost:8082/api
- Use Axios / Fetch to connect frontend with backend

---

## 🧪 Testing

- Postman / Thunder Client for API testing
- Unit & Integration testing (Spring Boot)
- Frontend testing (Playwright)
- GitHub Actions for build & test automation

---


## 🎓 Project Details

- **Module**: IT3030 – Programming Applications & Frameworks
- **Academic Year**: 3rd Year – 1st Semester
- **Assignment Type**: Group Coursework
- **System**: Smart Campus Operations Hub
- **Team Contributions**:


| Member 1 | Facilities & Asset Management |
| Member 2 | Booking System |
| Member 3 | Maintenance & Tickets |
| Member 4 | Notifications & Security |

---

