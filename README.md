# CoachBoard

Aplicación web moderna para gestión táctica y entrenamiento de equipos de fútbol.

## Stack

- **React 19** — UI
- **Vite 6** — bundler y dev server
- **Tailwind CSS 4** — estilos
- **React Router 7** — navegación
- **Lucide React** — iconos

## Inicio rápido

```bash
npm install
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en el navegador.

## Scripts

| Comando         | Descripción              |
|-----------------|--------------------------|
| `npm run dev`   | Servidor de desarrollo   |
| `npm run build` | Build de producción      |
| `npm run preview` | Preview del build      |
| `npm run lint`  | ESLint                   |

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/     # Sidebar, Logo, AppLayout
│   └── ui/         # Card, Badge, PageHeader
├── data/           # Datos mock (reemplazar por API)
├── pages/          # Dashboard, Plantel, Pizarra, Ejercicios
├── utils/          # Utilidades
├── App.jsx         # Rutas
├── main.jsx        # Entry point
└── index.css       # Tailwind + tema
```

## Pantallas

- **Dashboard** — resumen del equipo, accesos rápidos
- **Plantel** — listado de jugadores con estado
- **Pizarra Táctica** — formaciones 4-3-3 / 4-4-2
- **Ejercicios** — biblioteca de entrenamientos

## Próximos pasos sugeridos

- Conectar backend / API REST
- Autenticación de usuarios
- Drag & drop en pizarra táctica
- CRUD completo de jugadores y ejercicios
- Persistencia local con localStorage o base de datos
