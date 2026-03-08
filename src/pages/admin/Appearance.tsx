import { Palette, Type, Image, Globe } from "lucide-react";

const Appearance = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">المظهر</h1>
        <p className="text-sm text-muted-foreground mt-1">تخصيص شكل متجرك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الشعار</h2>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">اسحب الشعار هنا أو اضغط للرفع</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">اسم المتجر</label>
            <input
              type="text"
              defaultValue="متجري"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الألوان</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">اللون الرئيسي</label>
              <input type="color" defaultValue="#0d6847" className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">لون الأزرار</label>
              <input type="color" defaultValue="#0d6847" className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">لون الخلفية</label>
              <input type="color" defaultValue="#f4f5f7" className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الخطوط</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">خط العناوين</label>
              <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>IBM Plex Sans Arabic</option>
                <option>Noto Sans Arabic</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">خط النصوص</label>
              <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>IBM Plex Sans Arabic</option>
                <option>Noto Sans Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Domain */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">النطاق</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">النطاق المخصص</label>
            <input
              type="text"
              placeholder="www.mystore.com"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              dir="ltr"
            />
          </div>
          <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity">
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
