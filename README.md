# Página Web Profesional - Jugador de VALORANT

Una página web moderna y profesional diseñada específicamente para jugadores profesionales de VALORANT. Construida con React, TypeScript, Tailwind CSS y Framer Motion.

## 🚀 Características

- **Diseño Moderno**: Interfaz limpia y profesional con gradientes inspirados en VALORANT
- **Totalmente Responsive**: Optimizada para todos los dispositivos
- **Animaciones Suaves**: Transiciones elegantes con Framer Motion
- **Componentes Reutilizables**: Arquitectura modular y mantenible
- **Optimizada para SEO**: Meta tags y estructura semántica
- **Tema Oscuro/Claro**: Soporte completo para ambos temas

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **Framer Motion** - Biblioteca de animaciones
- **Lucide React** - Iconos modernos
- **shadcn/ui** - Componentes de UI de alta calidad

## 📦 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🎨 Personalización

### Datos del Jugador
Edita los siguientes elementos en `src/App.tsx`:

- **Nombre del jugador**: Reemplaza "PLAYERNAME" con tu nombre
- **Estadísticas**: Actualiza K/D, HS%, ACS, etc.
- **Agentes**: Modifica tu pool de agentes
- **Redes sociales**: Actualiza los enlaces a tus perfiles
- **Información personal**: Ciudad, equipo, logros

### Colores y Tema
Los colores principales se pueden modificar en:
- `tailwind.config.js` - Variables de color
- `src/index.css` - Variables CSS personalizadas

### Contenido Multimedia
- **Videos**: Reemplaza los URLs de YouTube en los componentes ClipCard
- **Imágenes**: Añade tus fotos en la sección de galería
- **Background**: Cambia la imagen de fondo del hero en App.tsx
- **Música de Fondo**: Configura la música ambiente desde el panel de administración

### 🎵 Música de Fondo
La aplicación incluye un sistema de música de fondo personalizable:

- **Control de Reproducción**: Botón flotante en la esquina inferior derecha con tooltip "Música de Fondo"
- **Funciones Disponibles**:
  - ▶️ Play/Pause: Inicia o pausa la reproducción
  - 🔊 Control de Volumen: Ajusta el nivel de audio (0-100%)
  - 🔇 Mute: Silencia temporalmente la música
  - 🔄 Loop: La música se reproduce en bucle automáticamente

- **Configuración desde Admin Panel**:
  1. Accede al panel de administración
  2. Ve a la pestaña "Música" 🎵
  3. Ingresa la URL de tu archivo de audio (MP3, WAV, etc.)
  4. Ajusta el volumen predeterminado
  5. Guarda los cambios

- **Formatos Soportados**: MP3, WAV, OGG, AAC
- **Recomendaciones**: Usa música instrumental o ambient para mejor experiencia de usuario

## 📱 Secciones Incluidas

1. **Hero Section** - Presentación principal con estadísticas clave
2. **Perfil** - Descripción del estilo de juego y fortalezas
3. **Estadísticas** - Métricas de rendimiento competitivo
4. **Agentes** - Pool de personajes especializados
5. **Clips** - Videos destacados y highlights
6. **Agenda** - Próximos partidos y eventos
7. **Galería** - Fotos y colaboraciones
8. **Contacto** - Formulario y redes sociales

## 🚀 Despliegue

Puedes desplegar esta aplicación en:

- **Vercel**: `npm run build` y sube la carpeta `dist`
- **Netlify**: Conecta tu repositorio de GitHub
- **GitHub Pages**: Usa GitHub Actions para despliegue automático

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo libremente para tu página personal.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras algún bug o tienes sugerencias de mejora, no dudes en abrir un issue.

---

**¡Buena suerte en tus partidas! 🎯**