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
    <section className="measurement-group">
      <h3>{title}</h3>
      <table><tbody>{fields.map(([key, label]) => <tr key={key}><th scope="row">{label}</th><td><input type="number" min="0" max="100" step="0.25" list="measurement-values" value={form[key] || ""} onChange={set(key)} placeholder="Enter value" aria-label={label} /></td></tr>)}</tbody></table>
    </section>
  );
  return <main className="account-page">
    <h2>My Measurements</h2>
    <p className="text-sm text-neutral-500 mb-5">Keep your tailoring measurements saved for a faster, more personal fitting experience.</p>
    {message && <div className="account-alert account-alert-success">{message}</div>}
    <form onSubmit={save} className="account-card account-card-body account-form">
      <div className="two-column"><label className="field"><span>Guest Name</span><input value={form.guest_name} onChange={set("guest_name")} /></label><label className="field"><span>Product / Occasion</span><input value={form.product_name} onChange={set("product_name")} /></label></div>
      <label className="field"><span>Measurement Unit</span><select value={form.unit} onChange={set("unit")}><option value="inches">Inches</option><option value="cm">Centimetres</option></select></label>
      <datalist id="measurement-values">{Array.from({ length: 81 }, (_, i) => <option key={i} value={i + 20} />)}</datalist>
      <div className="measurement-grid">{group("Shirt", SHIRT)}{group("Trouser", TROUSER)}</div>
      <label className="field mt-5"><span>Notes</span><textarea value={form.notes || ""} onChange={set("notes")} rows={3} /></label>
      <button disabled={saving}>{saving ? "Saving..." : "Save Measurements"}</button>
    </form>
    <style jsx>{`.measurement-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:24px}.measurement-group{overflow:hidden;border:1px solid #cfcfcf;background:#fff}.measurement-group h3{margin:0;padding:12px 14px;background:#111;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.14em;font-size:14px}.measurement-group table{width:100%;border-collapse:collapse;table-layout:fixed}.measurement-group tr{border-top:1px solid #d8d8d8}.measurement-group th{width:52%;padding:10px 12px;background:#fafafa;color:#333;font-size:12px;font-weight:600;letter-spacing:.04em;text-align:left;text-transform:uppercase}.measurement-group td{padding:5px;border-left:1px solid #d8d8d8}.measurement-group td input{display:block;width:100%;min-height:36px;padding:6px 9px;border:1px solid #cfcfcf!important;border-radius:0;background:#fffdf5;color:#111;font-size:15px;outline:0}.measurement-group td input:hover{border-color:#b28a4a!important;background:#fffaf0}.measurement-group td input:focus{border-color:#b28a4a!important;background:#fff8e8;box-shadow:0 0 0 2px rgba(178,138,74,.2)}@media(max-width:767px){.measurement-grid{grid-template-columns:1fr;gap:16px}}`}</style>
  </main>;
}
