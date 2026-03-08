import StatCard from "@/components/admin/StatCard";

const Analytics = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">التحليلات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">تحليلات أداء المتجر</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="الزيارات اليوم" value="1,240" change="↑ 15%" changeType="positive" subtitle="مقارنة بالأمس" />
        <StatCard title="معدل التحويل" value="3.2%" change="↑ 0.4%" changeType="positive" subtitle="هذا الأسبوع" />
        <StatCard title="معدل الارتداد" value="42%" change="↓ 2%" changeType="positive" subtitle="تحسن" />
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border p-8 text-center animate-slide-in">
        <div className="text-muted-foreground space-y-2">
          <p className="text-4xl">📈</p>
          <p className="text-sm font-medium">الرسوم البيانية المتقدمة</p>
          <p className="text-xs">سيتم إضافتها عند ربط قاعدة البيانات</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
