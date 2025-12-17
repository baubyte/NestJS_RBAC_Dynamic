import * as bcrypt from 'bcrypt';

interface SeedUser {
    email: string;
    username: string;
    password: string;
    roles: string[];
}

interface SeedData {
    users: SeedUser[];
    brands: any[];
    types_of_use: any[];
    categories: any[];
    subcategories: any[];
    parts_of_body: any[];
    materials: any[];
    colors: any[];
    waists: any[];
    products: any[];
    variants: any[];
}

export const initialData: SeedData = {

    users: [
        {
            email: 'admin@admin.com',
            username: 'Admin',
            password: bcrypt.hashSync('Taxos-super', 10),
            roles: ['admin']
        }
    ],

    brands: [
        { id: 1, name: "3M" }
    ],

    types_of_use: [
        { id: 1, type: "Industrial" }
    ],

    categories: [
        { id: 1, name: "ACCESORIOS DE PROTECCIÓN" },
        {id: 2, name: "GUANTES" },
        {id:3, name: "LIMPIEZA" },
        {id:4, name: "ROPA DE TRABAJO" },
        {id:5, name: "ROPA DESCARTABLE" },
        {id:6, name: "UNIFORMES" },
    ],

    subcategories: [
        { id: 1, name: "PROTECCIÓN CRANEANA Y AUDITIVA", category: { id: 1 } },
        { id: 2, name: "PROTECCIÓN FACIAL Y MÁSCARA", category: { id: 1 } },
        { id: 3, name: "PROTECCIÓN OCULAR", category: { id: 1 } },
        { id: 4, name: "PROTECCIÓN RESPIRATORIA", category: { id: 1 } },
        { id: 5, name: "DESCARTABLES", category: { id: 2 } },
        { id: 6, name: "SEGURIDAD", category: { id: 2 } },
        { id: 7, name: "PAÑOS", category: { id: 3 } },
        { id: 8, name: "PAPEL", category: { id: 3 } },
        { id: 9, name: "INDUMENTARIA", category: { id: 4 } },
        { id: 10, name: "ROPA DE TRABAJO", category: { id: 4 } },
        { id: 11, name: "DESCARTABLES", category: { id: 5 } },
        { id: 12, name: "CALZADO", category: { id: 6 } },
        { id: 13, name: "INDUMENTARIA EN TELA", category: { id: 6 } },
    ],

    parts_of_body: [
        { id: 1, name: "Cabeza", applies: true }
    ],

    materials: [
        { id: 1, name: "Polietileno" }
    ],

    colors: [
        { id: 1, name: "Blanco" }
    ],

    waists: [
        { id: 1, description: "Única" }
    ],

    products: [
        {
            id: 1,
            internal_code: "3M-H700-RF",
            SKU: "3M-H700-RF",
            name: "Carcasa Casco 3M H-700 CON REFLECTIVOS",
            description: "Casco de seguridad 3M H-700... (resumido)",
            technical_sheet: "Norma ANSI/ISEA Z89.1-2014 Tipo I...",
            featured_product: true,
            weight: "390 g",
            measures: "27 cm x 22 cm x 15 cm",
            presentation: "Caja individual con manual de uso y garantía 3M.",


            subcategory: { id: 1 },
            partofbody: { id: 1 },
            brand: { id: 1 }
        }
    ],

    variants: [
        {
            id: 1,
            stock: 50,
            price: 19990.00,


            color: { id: 1 },
            material: { id: 1 },
            product: { id: 1 },
            waist: { id: 1 }
        }
    ]

};
