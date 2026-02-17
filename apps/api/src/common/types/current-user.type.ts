export interface CurrentUserPayload {
  id: string;
  email: string;
  name: string;
  companyAddress?: string | null;
  companyLatitude?: number | null;
  companyLongitude?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}
