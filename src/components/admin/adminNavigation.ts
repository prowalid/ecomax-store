import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

export const adminNavSections: AdminNavSection[] = [
  {
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "الرئيسية", exact: true },
    ],
  },
  {
    title: "المبيعات",
    items: [
      { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
      { to: "/admin/products", icon: Package, label: "المنتجات" },
      { to: "/admin/categories", icon: FolderOpen, label: "التصنيفات" },
      { to: "/admin/customers", icon: Users, label: "الزبائن" },
      { to: "/admin/discounts", icon: Tag, label: "الخصومات" },
    ],
  },
  {
    title: "التشغيل",
    items: [
      { to: "/admin/shipping", icon: Truck, label: "الشحن" },
      { to: "/admin/marketing", icon: Megaphone, label: "التسويق" },
      { to: "/admin/analytics", icon: BarChart3, label: "التحليلات" },
      { to: "/admin/notifications", icon: Bell, label: "الإشعارات" },
    ],
  },
  {
    title: "الإعدادات",
    items: [
      { to: "/admin/pages", icon: FileText, label: "الصفحات" },
      { to: "/admin/appearance", icon: Palette, label: "المظهر" },
      { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
    ],
  },
];

type AdminPageMeta = {
  title: string;
  subtitle: string;
};

export function getAdminPageMeta(pathname: string): AdminPageMeta {
  if (pathname === "/admin") {
    return {
      title: "الرئيسية",
      subtitle: "ملخص سريع لأداء المتجر وآخر النشاطات المهمة.",
    };
  }

  if (pathname.startsWith("/admin/orders")) {
    return {
      title: "الطلبات",
      subtitle: "متابعة الطلبات، حالاتها، وتدفقات التنفيذ اليومية.",
    };
  }

  if (pathname.startsWith("/admin/products")) {
    return {
      title: "المنتجات",
      subtitle: "إدارة الكتالوج، المخزون، والصور من مكان واحد.",
    };
  }

  if (pathname.startsWith("/admin/categories")) {
    return {
      title: "التصنيفات",
      subtitle: "تنظيم الواجهة التجارية بتصنيفات واضحة وسهلة الصيانة.",
    };
  }

  if (pathname.startsWith("/admin/customers")) {
    return {
      title: "الزبائن",
      subtitle: "عرض قاعدة الزبائن والبحث السريع في بياناتهم الأساسية.",
    };
  }

  if (pathname.startsWith("/admin/discounts")) {
    return {
      title: "الخصومات",
      subtitle: "إدارة الكوبونات وقواعد التخفيض دون تعارضات منطقية.",
    };
  }

  if (pathname.startsWith("/admin/shipping")) {
    return {
      title: "الشحن",
      subtitle: "ضبط خيارات التوصيل والمناطق بطريقة مناسبة للسوق الجزائري.",
    };
  }

  if (pathname.startsWith("/admin/marketing")) {
    return {
      title: "التسويق",
      subtitle: "ربط Pixel وCAPI وWebhook مع تدفق الطلبات الفعلي.",
    };
  }

  if (pathname.startsWith("/admin/analytics")) {
    return {
      title: "التحليلات",
      subtitle: "مؤشرات تشغيلية دقيقة مبنية على بيانات الخادم مباشرة.",
    };
  }

  if (pathname.startsWith("/admin/notifications")) {
    return {
      title: "الإشعارات",
      subtitle: "إدارة إشعارات واتساب وتجارب الإرسال من داخل اللوحة.",
    };
  }

  if (pathname.startsWith("/admin/pages")) {
    return {
      title: "الصفحات",
      subtitle: "صفحات المحتوى المرتبطة مباشرة بقوائم الهيدر والفوتر.",
    };
  }

  if (pathname.startsWith("/admin/appearance")) {
    return {
      title: "المظهر",
      subtitle: "تخصيص هوية المتجر والصور والألوان بما يحافظ على الاتساق.",
    };
  }

  if (pathname.startsWith("/admin/settings")) {
    return {
      title: "الإعدادات",
      subtitle: "إعدادات المتجر العامة والدومين والخيارات الأساسية.",
    };
  }

  return {
    title: "لوحة التحكم",
    subtitle: "إدارة المتجر من واجهة موحدة ومبسطة.",
  };
}
