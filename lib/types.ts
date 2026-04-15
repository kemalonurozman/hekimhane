// ================================================================
// HEKİMHANE — TypeScript Tipleri
// ================================================================

export type Database = {
  public: {
    Tables: {
      klinikler: { Row: Klinik; Insert: Partial<Klinik>; Update: Partial<Klinik> };
      hastaneler: { Row: Hastane; Insert: Partial<Hastane>; Update: Partial<Hastane> };
      doktorlar:  { Row: Doktor; Insert: Partial<Doktor>; Update: Partial<Doktor> };
      eczaneler:  { Row: Eczane; Insert: Partial<Eczane>; Update: Partial<Eczane> };
      yorumlar:   { Row: Yorum; Insert: Partial<Yorum>; Update: Partial<Yorum> };
      blog_posts: { Row: BlogPost; Insert: Partial<BlogPost>; Update: Partial<BlogPost> };
    };
  };
};

export interface Klinik {
  id: string;
  name: string;
  type: string | null;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  lat: number;
  lng: number;
  tel: string | null;
  website: string | null;
  maps_url: string | null;
  specs: string[] | null;
  rat: number;
  rev: number;
  online: boolean;
  acil: boolean;
  claimed: boolean;
  slug: string | null;
  logo: string | null;
  cover: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hastane {
  id: string;
  name: string;
  type: string | null;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  lat: number;
  lng: number;
  tel: string | null;
  website: string | null;
  maps_url: string | null;
  specs: string[] | null;
  rat: number;
  rev: number;
  docs: number;
  beds: number;
  founded: number | null;
  claimed: boolean;
  slug: string | null;
  logo: string | null;
  cover: string | null;
  created_at: string;
  updated_at: string;
}

export interface Doktor {
  id: string;
  ad: string;
  soyad: string;
  spec: string | null;
  il: string | null;
  ilce: string | null;
  clinic_name: string | null;
  rat: number;
  rev: number;
  fee: number;
  premium: boolean;
  online: boolean;
  verified: boolean;
  tel: string | null;
  tags: string[] | null;
  exp: number;
  lat: number;
  lng: number;
  slug: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Eczane {
  id: string;
  name: string;
  pharmacist: string | null;
  il: string | null;
  ilce: string | null;
  address: string | null;
  tel: string | null;
  nobetci: boolean;
  chamber: string | null;
  slug: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface Yorum {
  id: string;
  entity_type: string;
  entity_id: string;
  author: string;
  rating: number;
  text: string | null;
  date: string | null;
  helpful: number;
  verified: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  tags: string[] | null;
  author: string;
  cover_image: string | null;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

// ================================================================
// Filter tipleri
// ================================================================
export interface KlinikFilters {
  il?: string;
  ilce?: string;
  uzmanlik?: string;
  tip?: string;
  minRat?: number;
  q?: string;
  page?: number;
  limit?: number;
}

export interface HastaneFilters {
  il?: string;
  ilce?: string;
  tip?: string;
  minRat?: number;
  q?: string;
  page?: number;
  limit?: number;
}
