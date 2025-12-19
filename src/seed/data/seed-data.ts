import * as bcrypt from 'bcrypt';

interface SeedUser {
  email: string;
  username: string;
  password: string;
  roles: { id: number }[];
}
interface SeedCategory {
  name: string;
}

interface SeedData {
  users: SeedUser[];
  categories: SeedCategory[];
  products: SeedProduct[];
  roles: SeedRole[];
}
interface SeedProduct {
  name: string;
  description: string;
  tags?: string[];
  category: { id: number };
  images?: { id: number; url: string }[];
}
interface SeedRole {
  slug: string;
  description?: string;
}
export const initialData: SeedData = {
  roles: [
    {
      slug: 'super-admin',
      description:
        'Acceso total al sistema (recibirá todos los permisos vía auto-asignación)',
    },
    {
      slug: 'admin',
      description:
        'Administrador con permisos de lectura, creación y actualización',
    },
    {
      slug: 'editor',
      description: 'Editor con permisos de lectura y actualización',
    },
    {
      slug: 'viewer',
      description: 'Visualizador con permisos de solo lectura',
    },
  ],
  users: [
    {
      email: 'admin@baubyte.com.ar',
      username: 'admin',
      password: bcrypt.hashSync('Bauyte-Super', 10),
      roles: [{ id: 1 }],
    },
  ],

  categories: [
    { name: 'ACCESORIOS DE PROTECCIÓN' },
    { name: 'GUANTES' },
    { name: 'LIMPIEZA' },
    { name: 'ROPA DE TRABAJO' },
    { name: 'ROPA DESCARTABLE' },
    { name: 'UNIFORMES' },
  ],

  products: [
    {
      name: 'Carcasa Casco 3M H-700 CON REFLECTIVOS',
      description: 'Casco de seguridad 3M H-700... (resumido)',
      category: { id: 1 },
    },
  ],
};
