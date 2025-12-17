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
  permissions: SeedPermission[];
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
  id: number;
  name: string;
  permissions: { id: number }[];
}
interface SeedPermission {
  id: number;
  slug: string;
  description: string;
}

export const initialData: SeedData = {
  permissions: [
    {
      id: 1,
      slug: 'manage_system',
      description: 'Permission to manage the entire system',
    },
    {
      id: 2,
      slug: 'dashboard_access',
      description: 'Permission to access the dashboard',
    },
  ],
  roles: [
    {
      id: 1,
      name: 'Super Admin',
      permissions: [{ id: 1 }],
    },
    {
      id: 2,
      name: 'User',
      permissions: [{ id: 2 }],
    },
  ],
  users: [
    {
      email: 'admin@baubyte.com.ar',
      username: 'Admin',
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
