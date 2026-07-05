export const gatewayBaseUrl = process.env.API_GATEWAY_URL ?? "http://localhost:8989";

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
}

export interface PagedResult<T> {
  data: T[];
  totalElements: number;
  pageNumber: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface OrderItem {
  code: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  customer: Customer;
  deliveryAddress: Address;
}

export interface OrderSummary {
  orderNumber: string;
  status: string;
}

export interface OrderDTO {
  orderNumber: string;
  user?: string;
  items: OrderItem[];
  customer: Customer;
  deliveryAddress: Address;
  status: string;
  comments?: string;
  createdAt?: string;
  totalAmount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
