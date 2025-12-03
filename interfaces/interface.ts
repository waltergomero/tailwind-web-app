export  interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  isadmin: boolean;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IStatus {
  id: string;
  status_name: string;
  typeid: number;
  description: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  id: string;
  category_name: string;
  parent_category_id: string;
  parent_category_name: string;
  description: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IParentCategory {
  parent_category_id: string;
  parent_category_name: string;
}