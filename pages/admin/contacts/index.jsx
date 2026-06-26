import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { Mail, MailOpen, Trash2, Reply, X, Plus, CheckSquare, Square } from "lucide-react";

export default function AdminContacts() {
  const [tab, setTab] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [addToFaq, setAddToFaq] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqSuccess, setFaqSuccess] = useState("");

  const fetchMessages = () => {
    setLoading(true);
    fetch(`/api/admin/contact?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setMessages(d.messages || []); setTotal(d.total || 0); setLoading(false); });
  };

  const fetchFaqs = () => {
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs || []));
  };

  useEffect(() => { fetchMessages(); }, [page]);
  useEffect(() => { fetchFaqs(); }, []);

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyText("");
    setAddToFaq(false);
    setReplySuccess(false);
    if (!msg.is_read) {
      await fetch(`/api/admin/contact/${msg.id}`, { method: "PATCH" });
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: 1 } : m));
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/admin/contact/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText, add_to_faq: addToFaq }),
      });
      if (res.ok) {
        setReplySuccess(true);
        if (addToFaq) fetchFaqs();
      }
    } finally {
      setReplyLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("حذف هذه الرسالة؟")) return;
    await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const addFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) return;
    setFaqLoading(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqForm),
      });
      if (res.ok) {
        setFaqForm({ question: "", answer: "" });
        setFaqSuccess("تمت الإضافة بنجاح!");
        fetchFaqs();
        setTimeout(() => setFaqSuccess(""), 3000);
      }
    } finally {
      setFaqLoading(false);
    }
  };

  const deleteFaq = async (id) => {
    if (!confirm("حذف هذا السؤال؟")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <AdminLayout title="الرسائل والأسئلة الشائعة">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-6">
        <button onClick={() => setTab("messages")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${tab === "messages" ? "bg-white text-ink-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Mail className="w-4 h-4" />
          الرسائل
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
          )}
        </button>
        <button onClick={() => setTab("faqs")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${tab === "faqs" ? "bg-white text-ink-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <CheckSquare className="w-4 h-4" />
          الأسئلة الشائعة
        </button>
      </div>

      {tab === "messages" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{total} رسالة</p>
              <span className="text-xs text-gray-400">{unreadCount} غير مقروءة</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>لا توجد رسائل</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? "bg-ink-50" : ""}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.is_read ? "bg-gray-100 text-gray-400" : "bg-ink-100 text-ink-600"}`}>
                      {msg.is_read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${msg.is_read ? "text-gray-600" : "font-bold text-gray-900"}`}>{msg.name}</p>
                        <p className="text-xs text-gray-400 shrink-0">{new Date(msg.created_at).toLocaleDateString("ar-MA")}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message detail + reply */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
                <Mail className="w-12 h-12 mb-3 opacity-30" />
                <p>اختر رسالة لعرضها</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{selected.subject}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{selected.name} — <span dir="ltr">{selected.email}</span></p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1">
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-6">
                    {selected.message}
                  </div>

                  {replySuccess ? (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 font-medium text-center">
                      ✓ تم إرسال الرد بنجاح!
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Reply className="w-4 h-4 text-ink-600" />الرد
                      </h4>
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4}
                        placeholder="اكتب ردك هنا..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none mb-3" />

                      <label className="flex items-center gap-2 mb-4 cursor-pointer group">
                        <div onClick={() => setAddToFaq(!addToFaq)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${addToFaq ? "bg-ink-600 border-ink-600" : "border-gray-300 group-hover:border-ink-400"}`}>
                          {addToFaq && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">إضافة السؤال والرد إلى الأسئلة الشائعة</span>
                      </label>

                      <button onClick={sendReply} disabled={!replyText.trim() || replyLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-ink-600 hover:bg-ink-700 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-60">
                        <Reply className="w-4 h-4" />
                        {replyLoading ? "جارٍ الإرسال..." : "إرسال الرد"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "faqs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add FAQ form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-ink-600" />
              إضافة سؤال جديد
            </h3>
            {faqSuccess && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 font-medium">{faqSuccess}</div>
            )}
            <form onSubmit={addFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السؤال <span className="text-red-500">*</span></label>
                <input type="text" value={faqForm.question} onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="اكتب السؤال هنا..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الجواب <span className="text-red-500">*</span></label>
                <textarea value={faqForm.answer} onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))} rows={4}
                  placeholder="اكتب الجواب هنا..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none" />
              </div>
              <button type="submit" disabled={faqLoading || !faqForm.question || !faqForm.answer}
                className="flex items-center gap-2 px-5 py-2.5 bg-ink-600 hover:bg-ink-700 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-60">
                <Plus className="w-4 h-4" />
                {faqLoading ? "جارٍ الإضافة..." : "إضافة السؤال"}
              </button>
            </form>
          </div>

          {/* FAQs list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">{faqs.length} سؤال</p>
            </div>
            {faqs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>لا توجد أسئلة شائعة بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{faq.question}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{faq.answer}</p>
                      </div>
                      <button onClick={() => deleteFaq(faq.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
