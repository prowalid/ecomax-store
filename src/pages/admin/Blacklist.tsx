import { useState, useEffect } from "react";
import { UserX, Plus, Trash2, Search, Loader2, ShieldAlert, Phone, Globe, Info } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface BlacklistEntry {
  id: string;
  type: "phone" | "ip";
  value: string;
  reason: string;
  created_at: string;
}

const Blacklist = () => {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newEntry, setNewEntry] = useState<{ type: "phone" | "ip"; value: string; reason: string }>({
    type: "phone",
    value: "",
    reason: "",
  });

  const fetchBlacklist = async () => {
    try {
      const response = await api.get("/blacklist");
      setEntries(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error("فشل تحميل القائمة السوداء");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.value.trim()) return;

    setAdding(true);
    try {
      await api.post("/blacklist", newEntry);
      toast.success("تمت الإضافة للقائمة السوداء بنجاح");
      setNewEntry({ type: "phone", value: "", reason: "" });
      fetchBlacklist();
    } catch (error) {
      toast.error("فشل الإضافة للقائمة");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإدخال من القائمة السوداء؟")) return;

    try {
      await api.delete(`/blacklist/${id}`);
      toast.success("تم الحذف بنجاح");
      setEntries(entries.filter((e) => e.id !== id));
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.reason || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-sidebar-heading">القائمة السوداء (Blacklist)</h1>
          <p className="text-[13px] text-slate-500 mt-1 font-medium">حظر الزبائن المزعجين أو البوتات بناءً على الهاتف أو IP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 space-y-6 sticky top-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-[15px] font-bold text-sidebar-heading">إضافة محظور جديد</h2>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">نوع الحظر</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, type: "phone" })}
                    className={`h-11 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      newEntry.type === "phone" ? "bg-red-50 border-red-200 text-red-600 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <Phone className="w-4 h-4" /> رقم هاتف
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, type: "ip" })}
                    className={`h-11 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      newEntry.type === "ip" ? "bg-red-50 border-red-200 text-red-600 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <Globe className="w-4 h-4" /> عنوان IP
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">القيمة</label>
                <input
                  type="text"
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                  placeholder={newEntry.type === "phone" ? "مثال: 0550000000" : "مثال: 192.168.1.1"}
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">سبب الحظر (اختياري)</label>
                <textarea
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  placeholder="مثال: طلبات وهمية متكررة"
                  className="w-full h-24 px-4 py-3 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={adding || !newEntry.value.trim()}
                className="w-full h-11 rounded-xl bg-red-500 text-white text-[14px] font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                إضافة للقائمة
              </button>
            </form>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 mt-4">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-[12px] text-orange-700 leading-relaxed font-medium">
                سيتم منع أي طلب جديد يحتوي على رقم هاتفك أو يأتي من عنوان IP هذا بشكل آلي.
              </div>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserX className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-bold text-sidebar-heading">المحظورون حالياً</h3>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في القائمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-medium text-sidebar-heading focus:bg-white focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[13px] text-slate-500 font-medium">جاري تحميل القائمة...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-[14px] text-slate-400 font-medium">لا توجد سجلات محظورة حالياً</p>
                </div>
              ) : (
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[12px] font-bold text-slate-500">النوع</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-slate-500">القيمة المحظورة</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-slate-500">السبب</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-slate-500">تاريخ الحظر</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-slate-500 w-20">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                            entry.type === 'phone' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {entry.type === 'phone' ? <Phone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                            {entry.type === 'phone' ? 'هاتف' : 'IP'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-sidebar-heading" dir="ltr text-right">
                          {entry.value}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                          {entry.reason || <span className="text-slate-300">بدون سبب</span>}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-slate-400 font-medium">
                          {new Date(entry.created_at).toLocaleDateString('ar-DZ')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors mx-auto"
                            title="حذف من القائمة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blacklist;
