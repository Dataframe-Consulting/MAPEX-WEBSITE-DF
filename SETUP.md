# MAPEX Website — Guía de Configuración

## 1. Configurar Supabase

1. Ve a https://supabase.com y crea un proyecto nuevo
2. Una vez creado, ve a **Settings → API**
3. Copia la **Project URL** y la **anon/public key**
4. Crea el archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2. Ejecutar la migración de base de datos

1. Ve al dashboard de Supabase → **SQL Editor**
2. Copia y pega el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script. Esto creará todas las tablas, políticas RLS, e índices.

## 3. Hacer tu cuenta admin

1. Primero **regístrate** en el sitio en `/registro`
2. En Supabase Dashboard → **Table Editor → profiles**
3. Encuentra tu usuario y cambia el campo `role` de `customer` a `admin`
4. Ahora tendrás acceso al panel en `/admin`

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

El sitio estará en http://localhost:3000

## 5. Dónde agregar imágenes

Todas las imágenes están marcadas en el código con comentarios. Los contenedores vacíos son:

### Imágenes que debes agregar:

| Imagen | Dónde va | Tamaño recomendado |
|--------|----------|-------------------|
| **Hero principal** | `components/home/Hero.tsx` | 560 × 480 px |
| **Logo Sherwin Williams** | `components/home/BrandBanner.tsx` | 200 × 60 px |
| **Logo Boden** | `components/home/BrandBanner.tsx` | 200 × 60 px |
| **Foto equipo/sucursal** | `components/home/WhyMapex.tsx` | 560 × 360 px |
| **Portada catálogo SW** | `app/catalogos/page.tsx` | 280 × 360 px |
| **Portada catálogo Boden** | `app/catalogos/page.tsx` | 280 × 360 px |
| **Mapa Google Maps** | `components/home/ContactSection.tsx` | iframe embed |
| **Imágenes de productos** | Panel Admin → cada producto | 800 × 800 px |

Para agregar imágenes, coloca los archivos en `/public/images/` y actualiza el código correspondiente.

## 6. Cargar productos

Desde el panel de administración en `/admin/productos`:
1. Haz clic en **"Agregar producto"**
2. Llena la información del producto
3. Agrega variantes (1L, 4L, 19L, etc.) con precios y stock
4. Guarda

## 7. Actualizar información de contacto

En `components/layout/Navbar.tsx` y `components/home/ContactSection.tsx`:
- Teléfono: Reemplaza `(662) 123-4567` con el número real
- Email: Reemplaza `contacto@mapex.mx` con el email real
- WhatsApp: Reemplaza `+526621234567` con el número de WhatsApp real

## 8. Redes sociales

En `components/layout/Footer.tsx`:
- Actualiza los `href` de Facebook e Instagram con los links reales

## 9. Despliegue en producción

Para Vercel:
```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
vercel deploy --prod
```

Agrega las variables de entorno en Vercel Dashboard → Settings → Environment Variables.
