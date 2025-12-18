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
  slug: string;
  description?: string;
  permissions: { id: number }[];
}
interface SeedPermission {
  id: number;
  slug: string;
  description?: string;
}

export const initialData: SeedData = {
  permissions: [
    {
      id: 1,
      slug: 'roles.create',
      description: 'Permission to create roles',
    },
    {
      id: 2,
      slug: 'roles.read',
      description: 'Permission to read role data',
    },
    {
      id: 3,
      slug: 'roles.update',
      description: 'Permission to update role data',
    },
    {
      id: 4,
      slug: 'roles.delete',
      description: 'Permission to delete role data',
    },
    {
      id: 5,
      slug: 'permissions.read',
      description: 'Permission to read permissions',
    },
    {
      id: 6,
      slug: 'permissions.sync',
      description: 'Permission to sync permissions',
    },
    {
      id: 7,
      slug: 'users.read',
      description: 'Permission to read user data',
    },
    {
      id: 8,
      slug: 'users.export',
      description: 'Permission to export user data',
    },
    {
      id: 9,
      slug: 'users.delete',
      description: 'Permission to delete user data',
    },
  ],
  roles: [
    {
      id: 1,
      slug: 'super-admin',
      description: 'Super Administrator with full system access',
      permissions: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
      ],
    },
    {
      id: 2,
      slug: 'admin',
      description: 'Regular user with limited access',
      permissions: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 5 },
        { id: 7 },
        { id: 8 },
      ],
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
