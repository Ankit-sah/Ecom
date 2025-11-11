export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  priceCents: number;
  images: string[];
  tags: string[];
  details: Record<string, unknown> | null;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  } | null;
  artisan: {
    id: string;
    name: string;
    location?: string | null;
    photoUrl?: string | null;
  } | null;
  stock: number;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  lastUpdatedBy?: string | null;
};

