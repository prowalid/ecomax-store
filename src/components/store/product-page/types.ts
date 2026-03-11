import type { Product } from "@/hooks/useProducts";
import type { Wilaya } from "@/data/algeriaWilayas";

export interface SelectedWilayaPricing extends Wilaya {
  homePrice: number;
  deskPrice: number;
}

export interface ProductHeroProps {
  product: Product;
  productImages: string[];
  activeImage: string | null;
  hasDiscount: boolean;
  discountPercent: number;
  qty: number;
  timeLeftLabel: string;
  submitted: boolean;
  submittedOrderNumber?: number | null;
  formName: string;
  formPhone: string;
  formWilaya: string;
  formCommune: string;
  deliveryType: "home" | "desk";
  couponCode: string;
  selectedWilaya?: SelectedWilayaPricing;
  availableCommunes: string[];
  wilayasWithPrices: SelectedWilayaPricing[];
  shippingCost: number;
  discountAmount: number;
  total: number;
  inCart: boolean;
  isAdding: boolean;
  isValidating: boolean;
  isSubmitting: boolean;
  discount?: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null;
  onImageSelect: (image: string) => void;
  onQtyChange: (qty: number) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onWilayaChange: (value: string) => void;
  onCommuneChange: (value: string) => void;
  onDeliveryTypeChange: (value: "home" | "desk") => void;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  onClearCoupon: () => void;
  onAddToCart: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
