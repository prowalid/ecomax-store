import { Bell, MessageSquare, Mail } from "lucide-react";

const Notifications = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">الإشعارات</h1>
        <p className="text-sm text-muted-foreground mt-1">إعداد إشعارات الطلبات للزبائن والإدارة</p>
      </div>

      <div className="space-y-4">
        {/* SMS Notifications */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">إشعارات SMS</h2>
              <p className="text-xs text-muted-foreground">إرسال رسائل SMS تلقائية للزبائن عند تغيير حالة الطلب</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">عند تأكيد الطلب</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">عند شحن الطلب</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">عند التسليم</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px]"></div>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">مزود خدمة SMS</label>
            <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option>اختر المزود...</option>
              <option>Twilio</option>
              <option>Onesignal</option>
              <option>مخصص (API)</option>
            </select>
          </div>
        </div>

        {/* Admin Notifications */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">إشعارات الإدارة</h2>
              <p className="text-xs text-muted-foreground">إشعارات البريد الإلكتروني عند وصول طلبات جديدة</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">بريد الإدارة</label>
            <input
              type="email"
              placeholder="admin@mystore.com"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              dir="ltr"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">إشعار عند كل طلب جديد</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
