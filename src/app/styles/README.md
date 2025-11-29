# 🎨 Guía de Variables de Color - Capturador de Inventario

## Resumen de Cambios

Se ha creado un **sistema centralizado de variables de color SCSS** para que puedas cambiar los colores de toda la aplicación desde un único lugar.

## 📁 Localización

El archivo principal con todas las variables está en:
```
src/app/styles/_color-variables.scss
```

## 🚀 Cómo Usar

### 1. **Importar las variables en tu archivo SCSS**

Al principio de cualquier archivo `.component.scss`, agrega:

```scss
@import '../../styles/color-variables';
```

(Ajusta la ruta relativa según la ubicación del archivo)

### 2. **Usar las variables en tu código**

```scss
.mi-clase {
  background-color: $color-primary;      // Azul principal
  color: $color-text-dark;                // Texto oscuro
  border: 1px solid $color-border-light; // Borde claro
  box-shadow: 0 4px 16px $color-shadow-medium; // Sombra media
}
```

## 🎯 Variables Disponibles

### Colores Primarios
- `$color-primary: #1976d2` - Azul principal (botones, links)
- `$color-primary-light: #90caf9` - Azul claro (hover)
- `$color-primary-dark: #1565c0` - Azul oscuro (active)
- `$color-primary-light-bg: #e3f2fd` - Azul muy claro (fondos)

### Colores Secundarios
- `$color-secondary: #0092B8` - Azul secundario
- `$color-secondary-dark: #017895` - Azul secundario oscuro

### Colores de Estado
- `$color-success: #1abc9c` - Verde (éxito, activo)
- `$color-error: #d32f2f` - Rojo (error)
- `$color-danger: #e74c3c` - Rojo peligro (eliminar)
- `$color-critical: #be0000` - Rojo crítico

### Colores Neutros
- `$color-white: #ffffff` - Blanco
- `$color-black: #000000` - Negro
- `$color-text-dark: #222222` - Texto principal
- `$color-text-light: #666666` - Texto secundario

### Fondos
- `$color-bg-page: #f4f7fa` - Fondo de página
- `$color-bg-light: #f7f9fa` - Fondo claro
- `$color-bg-light-2: #f5f5f5` - Fondo claro alternativo
- `$color-bg-light-3: #fafafa` - Fondo muy claro

### Bordes
- `$color-border-light: #e0e0e0` - Borde claro
- `$color-border-medium: #bdbdbd` - Borde medio
- `$color-border-dark: #ccc` - Borde oscuro

### Sombras
- `$color-shadow-light: rgba(44, 62, 80, 0.08)` - Sombra tenue
- `$color-shadow-medium: rgba(44, 62, 80, 0.12)` - Sombra media
- `$color-shadow-dark: rgba(0, 0, 0, 0.06)` - Sombra oscura

### Sidebar/Navegación
- `$color-sidebar-bg: #2c3e50` - Fondo sidebar
- `$color-sidebar-text: #ecf0f1` - Texto sidebar
- `$color-sidebar-hover: #34495e` - Hover sidebar

### Gradientes (Combinaciones pre-hechas)
- `$gradient-green: linear-gradient(135deg, $color-green-light 0%, $color-green-light-accent 100%)` - Verde
- `$gradient-blue: linear-gradient(135deg, $color-primary-light-bg 0%, $color-white 100%)` - Azul

## 💡 Ejemplo de Cambio Rápido

Si quieres cambiar el azul principal de toda la aplicación:

1. Abre `src/app/styles/_color-variables.scss`
2. Busca: `$color-primary: #1976d2;`
3. Cámbialo a tu nuevo color, ej: `$color-primary: #007bff;`
4. **¡Listo!** Todos los componentes que usen `$color-primary` se actualizarán automáticamente

## 📋 Archivos Ya Actualizados

Los siguientes archivos ya han sido actualizados para usar variables:

- ✅ `login-screen.component.scss`
- ✅ `dashboard-layout.component.scss`
- ✅ `auth-layout.component.scss`

## 🔄 Cómo Actualizar Otros Archivos

Si tienes archivos SCSS que aún usan colores hardcodeados, sigue estos pasos:

1. Agrega el import al principio:
   ```scss
   @import '../../styles/color-variables';
   ```

2. Reemplaza colores hexadecimales con variables:
   ```scss
   // ❌ Antes
   color: #1976d2;
   background: #fff;
   
   // ✅ Después
   color: $color-primary;
   background: $color-white;
   ```

## 🎨 Tips de Diseño

- **Mantén consistencia**: usa las variables predefinidas en lugar de crear nuevas
- **Agrega nuevas variables si las necesitas**: simplemente agrégalas a `_color-variables.scss`
- **Documenta cambios grandes**: comenta por qué agregaste una nueva variable
- **Prueba en el navegador**: los cambios son inmediatos gracias a los watchers de Angular

## 📞 Soporte

Si necesitas agregar nuevos colores o tienes dudas sobre las variables, actualiza el archivo `_color-variables.scss` siguiendo el mismo patrón y comenta tu código.

---

**Última actualización**: Noviembre 2025
