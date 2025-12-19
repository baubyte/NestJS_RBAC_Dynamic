import * as bcrypt from 'bcrypt';

interface SeedUser {
  email: string;
  username: string;
  password: string;
  roles: { id: number }[];
}
interface SeedCategory {
  id: number;
  name: string;
}

interface SeedData {
  users: SeedUser[];
  categories: SeedCategory[];
  products: SeedProduct[];
  roles: SeedRole[];
}
interface SeedProduct {
  id: number;
  name: string;
  description: string;
  tags?: string[];
  category: { id: number };
  images?: { id: number; url: string }[];
}
interface SeedRole {
  slug: string;
  description?: string;
  //permissions: { id: number }[];
}
export const initialData: SeedData = {
  roles: [
    { slug: 'super-admin', description: 'Acceso total' },
    { slug: 'admin', description: 'Administrador' },
    { slug: 'editor', description: 'Editor' },
    { slug: 'viewer', description: 'Visualizador' },
  ],
  users: [
    {
      email: 'admin@baubyte.com.ar',
      username: 'admin',
      password: bcrypt.hashSync('Bauyte-super', 10),
      roles: [{ id: 1 }],
    },
  ],

  categories: [
    { id: 1, name: 'ACCESORIOS DE PROTECCIÓN' },
    { id: 2, name: 'GUANTES' },
    { id: 3, name: 'LIMPIEZA' },
    { id: 4, name: 'ROPA DE TRABAJO' },
    { id: 5, name: 'ROPA DESCARTABLE' },
    { id: 6, name: 'UNIFORMES' },
  ],

  products: [
    {
      id: 1,
      name: 'Carcasa Casco 3M H-700 CON REFLECTIVOS',
      description: 'Casco de seguridad 3M H-700... (resumido)',
      category: { id: 1 },
    },
  ],
};
