import type { Product } from "@/hooks/useProducts";
import type { Wilaya } from "@/data/algeriaWilayas";
import type { ProductOptionGroup, SelectedProductOptions } from "@/lib/productOptions";

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
  selectedWilaya?: SelectedWilayaPricing;
  availableCommunes: string[];
  wilayasWithPrices: SelectedWilayaPricing[];
  shippingCost: number;
  total: number;
  inCart: boolean;
  productOptions: ProductOptionGroup[];
  selectedOptions: SelectedProductOptions;
  isAdding: boolean;
  isSubmitting: boolean;
  onImageSelect: (image: string) => void;
  onQtyChange: (qty: number) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onWilayaChange: (value: string) => void;
  onCommuneChange: (value: string) => void;
  onDeliveryTypeChange: (value: "home" | "desk") => void;
  onSelectedOptionsChange: (name: string, value: string) => void;
  onAddToCart: () => void;
  securitySettings?: { turnstile_enabled: boolean; site_key: string; honeypot_enabled: boolean };
  onHoneypotChange?: (value: string) => void;
  onTurnstileSuccess?: (token: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}
