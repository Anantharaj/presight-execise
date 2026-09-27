export interface User {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface FacetItem {
  value: string;
  count: number;
}

export interface UserFacets {
  hobbies: FacetItem[];
  nationalities: FacetItem[];
}
