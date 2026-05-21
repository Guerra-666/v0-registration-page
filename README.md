# Congreso COMIIN - Sistema de Registro

Aplicación de registro para el Congreso Multidisciplinario de Investigación e Innovación, desarrollada con Next.js, Tailwind CSS y Turso Database.

## Características

- **Validación de Matrícula**: Búsqueda segura en la base de datos de alumnos activos
- **Selección de Eventos**: Interfaz intuitiva para seleccionar eventos por día
- **Requisito de 3 Eventos Mínimos**: Validación en tiempo real del número mínimo de eventos
- **Confirmación de Registro**: Resumen completo y descarga de comprobante
- **Diseño Responsivo**: Interfaz profesional y accesible
- **Notificaciones en Tiempo Real**: Toast notifications para feedback inmediato

## Tecnología

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Base de Datos**: Turso (LibSQL/SQLite)
- **Autenticación**: Server Actions con validación segura

## Configuración

### Variables de Entorno

```
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Estructura de Base de Datos

**Tabla: alumnos_activos**
- `matricula` (TEXT, PRIMARY KEY)
- `nombre` (TEXT)
- `paterno` (TEXT)
- `materno` (TEXT)
- `programa` (TEXT)
- `grupo` (TEXT)
- `turno` (TEXT)
- `gradoacademico` (TEXT)
- `email_institucional` (TEXT)

**Tabla: eventos_comiin**
- `id` (INTEGER, PRIMARY KEY)
- `dia` (TEXT) - Ej: "Jueves 28 de mayo"
- `hora` (TEXT) - Ej: "07:30"
- `actividad` (TEXT)
- `ponente` (TEXT)
- `sede` (TEXT)
- `duracion` (TEXT)
- `clasificacion` (TEXT)

**Tabla: inscripciones_eventos**
- `alumno_matricula` (TEXT, FOREIGN KEY)
- `evento_id` (INTEGER, FOREIGN KEY)
- `fecha_registro` (TEXT)
- PRIMARY KEY: (alumno_matricula, evento_id)

## Flujo de Uso

1. **Paso 1 - Validación**: El alumno ingresa su matrícula
2. **Paso 2 - Selección**: Sistema carga eventos disponibles
3. **Paso 3 - Confirmación**: Alumno selecciona mínimo 3 eventos y confirma
4. **Paso 4 - Resumen**: Se muestra confirmación y opción de descargar comprobante

## Componentes

- `MatriculaStep`: Validación inicial de matrícula
- `EventosStep`: Selección de eventos con tabs por día
- `ConfirmationStep`: Resumen y confirmación final
- `Toast`: Notificaciones del sistema

## Scripts

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build
pnpm build

# Producción
pnpm start
```

## Seguridad

- ✅ Validación segura con parámetros preparados
- ✅ Server Actions para operaciones sensibles
- ✅ Transacciones batch para inserción masiva
- ✅ Sanitización de entrada de usuario
- ✅ Manejo robusto de errores

## Diseño

La interfaz sigue la línea visual corporativa del congreso:
- Paleta de colores: Azul marino profesional (#0f3a5e)
- Tipografía: Geist (sans-serif)
- Componentes: shadcn/ui con tema personalizado
- Responsive: Optimizado para mobile y desktop

## Desarrollo

Los archivos principales están en:
- `/app` - Rutas y página principal
- `/components` - Componentes reutilizables
- `/lib` - Lógica de servidor y base de datos
- `/public` - Activos estáticos (logo)
