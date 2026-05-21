# Plan de evolución a Portal RRHH Premium — Fundación Neuquén Oeste

El pedido es enorme (IA 24/7, firma digital, emails automáticos, encuestas, capacitaciones, auditoría, organigrama circular, app móvil React Native, analytics, backups, etc.). Construir todo de una sola vez genera código frágil y difícil de revisar. Propongo dividirlo en **6 fases incrementales**, cada una entregable y útil por sí sola, manteniendo la base actual (TanStack Start + Lovable Cloud + paleta Ocean Deep + tipografía Sora/Manrope).

## Aclaraciones importantes antes de empezar

1. **App móvil nativa (React Native / Expo) no es posible en este proyecto.** Lovable construye web apps con TanStack Start. Lo haremos **PWA mobile-first instalable** (se instala en Android/iPhone como app, con íconos, splash y push web). Si más adelante querés una app nativa real, hay que crear otro proyecto fuera de Lovable.
2. **Backend Node.js/Express + PostgreSQL separado tampoco aplica:** ya tenemos Lovable Cloud (Postgres + Auth + Storage + RLS) y server functions de TanStack. Es la opción correcta y escalable para este stack.
3. **IA:** usaremos **Lovable AI Gateway** (Gemini / GPT-5) sin que tengas que pagar API key aparte de OpenAI.
4. **Emails:** usaremos **Lovable Emails** (sistema nativo) en lugar de Resend/SendGrid externos, con tu dominio.
5. **Modo claro/oscuro, animaciones, diseño Apple/Linear/Notion:** se aplica de forma transversal en cada fase.

## Fase 1 — Fundamentos premium (UI/UX + perfil completo + notificaciones)
- Topbar con campana de **notificaciones** en tiempo real (tabla `notifications` ya existe, le agregamos realtime + UI).
- **Modo claro/oscuro** con toggle, persistente.
- **Onboarding obligatorio:** al primer login el empleado completa perfil extendido (DNI, CUIL, dirección desglosada calle/número/piso/depto/barrio/ciudad/provincia/CP, foto de perfil con upload a bucket `avatars`, contacto de emergencia, fecha de nacimiento).
- Migración: añadir columnas faltantes a `employees` (cuil, calle, numero, piso, depto, barrio, ciudad, provincia, codigo_postal, perfil_completo boolean).
- Dashboard rediseñado con bienvenida personalizada, próximos cumpleaños, eventos, accesos rápidos, indicadores.
- Animaciones suaves (Framer Motion).

## Fase 2 — Comunicación y comunidad
- **Chat privado RRHH ↔ Empleado** (tipo DM, sin chat entre empleados): tablas `conversations` + `messages`, realtime, adjuntos, leído/no leído.
- **Centro institucional**: novedades destacadas, comunicados, reconocimientos, cumpleaños del mes, aniversarios.
- **Organigrama circular interactivo** (SVG + zoom, foto, cargo, supervisor).
- **Calendario institucional** mejorado con cumpleaños y aniversarios auto-calculados.

## Fase 3 — IA institucional 24/7
- Asistente IA flotante en toda la app, usando Lovable AI Gateway (Gemini 2.5 Flash por defecto).
- **Contexto:** datos del usuario autenticado (vacaciones, recibos, solicitudes, eventos), misión/visión/valores cristianos editables por admin.
- Tono cálido, empático, cristiano.
- Tool-calling: crear solicitudes, consultar saldo vacaciones, buscar documentos, listar próximos eventos.
- Vista admin extra: resumen de tickets, sugerencias de respuesta, detección de urgencia.

## Fase 4 — Automatización legal y documental
- **Cálculo automático de vacaciones** según ley argentina (LCT art. 150: 14/21/28/35 días según antigüedad), proporcional al ingreso, saldo en vivo.
- **Firma digital** de recibos y documentos (canvas + hash + tabla `signatures` con timestamp + IP).
- **Certificados automáticos** (laboral, antigüedad, sueldo) generados en PDF (jsPDF) con sello institucional + envío por email.
- **Repositorio documental** institucional (contratos, reglamentos, manuales) indexable por la IA.

## Fase 5 — Emails automáticos + encuestas + capacitaciones
- **Lovable Emails** con dominio propio + plantillas modernas para: bienvenida, recibo cargado, solicitud aprobada/rechazada, nueva novedad, recordatorios, certificados, recuperación de contraseña.
- **Encuestas internas** (clima, satisfacción, votaciones) con resultados anónimos visibles solo a admin.
- **Portal de capacitaciones**: cursos (videos URL + PDFs), progreso por empleado, certificado de finalización auto-generado.

## Fase 6 — Analytics, auditoría, PWA y producción
- Dashboard admin con **gráficos** (Recharts): ausentismo, solicitudes por estado, vacaciones tomadas, actividad por sector.
- **Auditoría**: tabla `audit_log` + middleware que registra acciones críticas (descargas, login, ediciones).
- **PWA**: manifest, service worker, instalable en móvil, ícono, splash, push notifications web.
- **Backups**: documentar el backup automático ya gestionado por Lovable Cloud y agregar export manual (CSV/JSON) para admin.
- Login con Google (opcional).
- Recuperación de contraseña.

## Stack final (sin cambios estructurales)
- Frontend: TanStack Start + React + Tailwind v4 + shadcn/ui + Framer Motion + Recharts.
- Backend: server functions de TanStack + Lovable Cloud (Postgres + Auth + Storage + Realtime + RLS).
- IA: Lovable AI Gateway.
- Emails: Lovable Emails.
- Mobile: PWA instalable.

## Cómo seguimos
Si aprobás el plan, **arranco directamente con la Fase 1** (fundamentos premium + onboarding + notificaciones + modo oscuro). Cada fase la entrego completa y te pido OK antes de pasar a la siguiente — así no acumulamos deuda técnica y podés revisar/usar el sistema en cada paso.

¿Querés que arranque con la Fase 1, o preferís reordenar prioridades (por ejemplo poner IA antes que chat)?
