# 🚀 Plataforma HR Premium - Fundación Neuquén Oeste

Plataforma moderna, inteligente y automatizada para gestión de Recursos Humanos corporativos empresariales.

## ✨ Características Principales

### 🔐 Seguridad & Autenticación
- JWT (JSON Web Tokens) seguro
- Contraseñas encriptadas con Bcrypt
- Roles y permisos granulares (admin, employee, supervisor)
- Tokens con expiración configurable

### 👥 Gestión de Empleados
- Registro completo de datos personales
- Información laboral (posición, área, supervisor)
- Domicilio completo
- Fotos de perfil
- Organigrama visual circular

### 💰 Sistema de Recibos
- Upload de PDFs por mes/año
- Firma digital de recibos
- Historial completo
- Descarga inmediata
- Búsqueda por fecha

### 📋 Solicitudes RRHH
- Vacaciones (cálculo automático de saldo)
- Permisos especiales
- Licencias
- Certificados laborales
- Estados: pending, in_review, approved, rejected

### 💬 Chat Privado
- Conversaciones RRHH ↔ Empleado
- Envío de archivos
- Historial de mensajes
- Notificaciones

### 🤖 IA Integrada
- Asistente inteligente 24/7
- Responde consultas sobre vacaciones
- Búsqueda de documentos
- Información contextual
- Lenguaje natural amable

### 📊 Dashboard Inteligente
- Resumen personalizado
- Próximos eventos
- Cumpleaños
- Solicitudes pendientes
- Últimos recibos
- Indicadores visuales

### 📅 Calendario Institucional
- Cumpleaños
- Aniversarios laborales
- Eventos especiales
- Capacitaciones
- Recordatorios automáticos

### 📧 Emails Automáticos
- Bienvenida de usuario
- Recibos cargados
- Aprobación/rechazo de solicitudes
- Recordatorios de eventos
- Notificaciones especiales

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** 18+ con TypeScript
- **Express.js** para APIs REST
- **PostgreSQL** para base de datos
- **JWT** para autenticación
- **Bcrypt** para encriptación

### Frontend
- **React 18** con Next.js 14
- **TailwindCSS** para estilos
- **Framer Motion** para animaciones
- **Zustand** para state management
- **Axios** para HTTP requests

### Integraciones
- **OpenAI API** para IA
- **Resend** para emails
- **Socket.io** para tiempo real

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn
- Git

## 🚀 Inicio Rápido

### 1. Configurar Base de Datos

```bash
# Crear base de datos
createdb fundacion_db

# Cargar schema
psql -d fundacion_db -f database/schema.sql
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

**API disponible en**: `http://localhost:5000/api`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

**Frontend disponible en**: `http://localhost:3000`

## 📚 Documentación de APIs

### Autenticación

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "secure_password",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "secure_password"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "juan@example.com",
      "role": "employee",
      "first_name": "Juan",
      "last_name": "Pérez"
    }
  }
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Empleados

#### Get All
```bash
GET /api/employees
Authorization: Bearer <token>
```

#### Get Profile
```bash
GET /api/employees/:id
Authorization: Bearer <token>
```

#### Create
```bash
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "dni": "12345678",
  "position": "Gerente",
  "area": "IT",
  "hireDate": "2024-01-01",
  "phone": "+5494xxx",
  "birthdate": "1990-01-01"
}
```

#### Get Organigram
```bash
GET /api/employees/organigram/all
Authorization: Bearer <token>
```

### Recibos (Payroll)

#### Upload
```bash
POST /api/payroll/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "month": 5,
  "year": 2024,
  "grossAmount": 50000,
  "netAmount": 42000,
  "pdfUrl": "https://..."
}
```

#### Get by Employee
```bash
GET /api/payroll/employee/:id
Authorization: Bearer <token>
```

#### Sign Digital
```bash
POST /api/payroll/:id/sign
Authorization: Bearer <token>
Content-Type: application/json

{
  "signature": "base64_signature_data"
}
```

### Solicitudes

#### Create
```bash
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "type": "vacation",
  "title": "Vacaciones",
  "description": "Solicito mis vacaciones",
  "startDate": "2024-06-01",
  "endDate": "2024-06-14"
}
```

#### Get by Employee
```bash
GET /api/requests/employee/:id
Authorization: Bearer <token>
```

#### Update Status
```bash
PUT /api/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "comment": "Aprobada"
}
```

#### Get Vacation Balance
```bash
GET /api/requests/vacation/balance/:id
Authorization: Bearer <token>
```

## 📁 Estructura de Carpetas

```
fundacioncristiana/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── employees.ts
│   │   │   ├── payroll.ts
│   │   │   └── requests.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
└── README.md
```

## 🔑 Variables de Entorno

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fundacion_db
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# IA & Emails
OPENAI_API_KEY=sk-your-key
RESEND_API_KEY=re-your-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚦 Health Check

```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-05-20T12:00:00.000Z"
}
```

## 📚 Próximas Características

- [ ] Chat privado en tiempo real
- [ ] Asistente IA completo
- [ ] Encuestas internas
- [ ] App móvil (React Native)
- [ ] Firma digital avanzada
- [ ] Gestión documental
- [ ] Analytics dashboard
- [ ] Integración Slack
- [ ] Integración Google Calendar

## 🔒 Seguridad

- Todas las contraseñas se encriptan con Bcrypt
- JWT para autenticación stateless
- CORS configurado
- Rate limiting implementado
- Validación en backend
- SQL injection prevention
- XSS protection

## 📞 Soporte

Para reportar bugs o sugerencias, contactar a:
- Email: soporte@fundacionneq.ar
- Teléfono: +549xxx

## 📄 Licencia

Privada - Fundación Neuquén Oeste © 2024

---

**Desarrollado con ❤️ para Fundación Neuquén Oeste**
