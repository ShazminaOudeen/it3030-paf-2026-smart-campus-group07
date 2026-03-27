# 🏢 Assetra – Smart Campus Asset & Facility Management System

[![Spring Boot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Security](https://img.shields.io/badge/SpringSecurity-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white)](https://hibernate.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![REST API](https://img.shields.io/badge/API-REST-ff6f00?style=for-the-badge)]()
[![OAuth2](https://img.shields.io/badge/Auth-OAuth2-3C8DBC?style=for-the-badge)]()
[![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge&logo=jsonwebtokens)]()
[![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHubActions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://www.postman.com/)
[![VS Code](https://img.shields.io/badge/VSCode-0078d7?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)

---

## 📌 Description

**Assetra** is a full-stack Smart Campus Operations Hub designed to streamline **facility booking, asset management, and maintenance workflows** within a university environment.

The system connects **students, staff, technicians, and administrators** through a secure, role-based platform that improves efficiency, transparency, and operational control.

Assetra follows a **modern layered architecture** with a Spring Boot REST API and a React-based frontend, ensuring scalability and maintainability.

---

## 🛠 Tech Stack

- **Backend :** Java, Spring Boot (REST API), Spring Security (OAuth 2.0), Hibernate / JPA
- **Frontend :** React.js, JavaScript, Tailwind CSS, Vite
- **Database :** PostgreSQL
- **Tools :**  Git & GitHub, GitHub Actions (CI/CD), Postman / Thunder Client, VS Code 

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
- Git
- VS Code / IntelliJ

### 🗄 Database Setup (PostgreSQL - Neon)

- Create a free account at https://neon.tech
- Create a new PostgreSQL database
- Copy your connection string

---

## 🔽 1️⃣ Clone the Repository

```bash
git clone https://github.com/ShazminaOudeen/it3030-paf-2026-smart-campus-group07.git
cd it3030-paf-2026-smart-campus-group07
```

---

## ⚙️ 2️⃣ Backend Setup (Spring Boot)

```bash
cd assetra-backend
```

### 📦 Install Dependencies (Maven)

```bash
mvn clean install
```

### 🔐 Configure `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://<your-neon-host>/<dbname>?sslmode=require
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8082
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
cd assetra-frontend
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
- Unit & Integration testing using JUnit (Spring Boot)  
- Frontend testing using Playwright  
- GitHub Actions for build & test automation  

---

### Run Tests:

```bash
mvn test
```

---


## 🎓 Project Details

**Module**: IT3030 – Programming Applications & Frameworks
**Academic Year**: 3rd Year – 1st Semester
**Assignment Type**: Group Coursework
**System**: Smart Campus Operations Hub
**Team Contributions**:
- Facilities & Asset Management 
- Booking System 
- Maintenance & Tickets 
- Notifications & Security 

---

