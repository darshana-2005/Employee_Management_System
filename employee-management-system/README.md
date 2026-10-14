# Employee Management System

Spring Boot 2.7 REST API and React/Vite dashboard for managing employees and departments. The backend targets Java 8 and uses a local H2 file database.

## Requirements

- Java 8 or newer
- Node.js 20.19+ (or 22.12+)

The Maven wrapper downloads Maven on first use; a global Maven installation is not required.

## Run locally

Start the API from the project root:

```powershell
./mvnw.cmd spring-boot:run
```

In a second terminal, start the UI:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The UI calls the API at http://localhost:8080/api. Set `VITE_API_URL` in a frontend `.env` file to use a different API URL.

The administrator demo account is `admin` / `ChangeMe123!`. Employee demo accounts are `avery` and `jordan`, each using `Welcome123!`; they open the employee self-service panel and can only read their own profile. Set `EMS_ADMIN_USERNAME`, `EMS_ADMIN_PASSWORD`, and `EMS_EMPLOYEE_PASSWORD` before the first API launch to change the seeded credentials. Passwords are stored as BCrypt hashes. These defaults and the development JWT key are for local development only; set a strong base64-encoded `JWT_SECRET` in any deployed environment.

The H2 console is available at http://localhost:8080/h2-console while the API is running. Connect using JDBC URL `jdbc:h2:file:./data/ems`, username `sa`, and an empty password.

## API

- `POST /api/auth/login` accepts `{ "username": "...", "password": "..." }` and returns a bearer token.
- `GET`, `POST`, `PUT /{id}`, and `DELETE /{id}` are available under `/api/employees` and `/api/departments`.
- All employee and department endpoints require `Authorization: Bearer <token>`.
- Employee accounts can read their own profile at `GET /api/me`, and their recent attendance at `GET /api/me/attendance`.
- Employee attendance uses `POST /api/me/attendance/check-in` and `POST /api/me/attendance/check-out`; the API allows one attendance record per employee per server-local day.

Employee fields: `firstName`, `lastName`, `email`, `position`, `phone`, `hireDate` (`YYYY-MM-DD`), `salary`, `employmentStatus`, and `departmentId`.