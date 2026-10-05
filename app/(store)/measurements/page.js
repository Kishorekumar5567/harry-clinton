"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, currentUserId, unwrap } from "@/lib/api";
import "../account-pages.css";

const SHIRT = [
  ["shirt_body_length", "Body Length"], ["shirt_shoulder", "Shoulder"], ["shirt_sleeve_length", "Sleeve Length"],
  ["shirt_arm_loose", "Arm Loose"], ["shirt_chest", "Chest"], ["shirt_waist", "Waist"], ["shirt_hip", "Hip"], ["shirt_collar", "Collar"], ["shirt_cuff", "Cuff"],
];
const TROUSER = [
  ["trouser_full_length", "Full Length"], ["trouser_inseam", "Inseam"], ["trouser_fly", "Fly"], ["trouser_u_round", "U Round"],
  ["trouser_waist", "Waist"], ["trouser_hip", "Hip"], ["trouser_thigh", "Thigh"], ["trouser_knee", "Knee"], ["trouser_bottom", "Bottom"],
];
const EMPTY = { guest_name: "", product_name: "", unit: "inches", notes: "" };

export default function MeasurementsPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    const userId = currentUserId();
    if (!userId) { router.replace("/login"); return; }
    apiFetch(`/Measurements?user_id=${encodeURIComponent(userId)}`)
      .then(unwrap)
      .then((rows) => { if (Array.isArray(rows) && rows[0]) setForm((f) => ({ ...f, ...rows[0] })); })
      .catch(() => setMessage("Could not load measurements."))
      .finally(() => setLoading(false));
  }, [router]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try {
      await apiFetch("/Measurements", { method: "POST", body: { ...form, user_id: currentUserId(), rcu: "WEBSITE", luu: "WEBSITE" } });
      setMessage("Measurements saved successfully.");
    } catch (err) { setMessage(err.message || "Could not save measurements."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="account-page text-center py-16">Loading measurements...</div>;
  const group = (title, fields) => (
    <div className="measurement-group">
      <h3>{title}</h3>
      {fields.map(([key, label]) => <label className="field" key={key}><span>{label}</span><input value={form[key] || ""} onChange={set(key)} placeholder="—" /></label>)}
    </div>
  );
  return <main className="account-page">
    <h2>My Measurements</h2>
    <p className="text-sm text-neutral-500 mb-5">Keep your tailoring measurements saved for a faster, more personal fitting experience.</p>
    {message && <div className="account-alert account-alert-success">{message}</div>}
    <form onSubmit={save} className="account-card account-card-body">
      <div className="two-column"><label className="field"><span>Guest Name</span><input value={form.guest_name} onChange={set("guest_name")} /></label><label className="field"><span>Product / Occasion</span><input value={form.product_name} onChange={set("product_name")} /></label></div>
      <label className="field"><span>Measurement Unit</span><select value={form.unit} onChange={set("unit")}><option value="inches">Inches</option><option value="cm">Centimetres</option></select></label>
      <div className="measurement-grid">{group("Shirt", SHIRT)}{group("Trouser", TROUSER)}</div>
      <label className="field mt-5"><span>Notes</span><textarea value={form.notes || ""} onChange={set("notes")} rows={3} /></label>
      <button disabled={saving}>{saving ? "Saving..." : "Save Measurements"}</button>
    </form>
    <style jsx>{`.measurement-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:24px}.measurement-group{border:1px solid #d9d9d9}.measurement-group h3{margin:0;padding:10px 14px;background:#111;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.12em;font-size:14px}.measurement-group .field{display:grid;grid-template-columns:1fr 1fr;margin:0;border-bottom:1px solid #ddd}.measurement-group .field:last-child{border-bottom:0}.measurement-group .field span{margin:0;padding:10px;font-size:12px;text-transform:uppercase;color:#333;border-right:1px solid #ddd}.measurement-group .field input{border:0;border-radius:0;min-height:40px}.measurement-group .field input:focus{box-shadow:none}@media(max-width:767px){.measurement-grid{grid-template-columns:1fr;gap:16px}}`}</style>
  </main>;
}
