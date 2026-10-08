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
      <div className="measurement-rows">{fields.map(([key, label]) => <div className="measurement-row" key={key} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(150px, 44%)", alignItems: "center", gap: "18px", minHeight: "72px", padding: "12px 18px" }}><span style={{ display: "block", margin: 0 }}>{label}</span><input type="number" min="0" max="100" step="0.25" list="measurement-values" value={form[key] || ""} onChange={set(key)} placeholder="Enter value" aria-label={label} /></div>)}</div>
    </section>
  );
  return <main className="account-page">
    <h2>My Measurements</h2>
    <p className="text-sm text-neutral-500 mb-5">Keep your tailoring measurements saved for a faster, more personal fitting experience.</p>
    {message && <div className="account-alert account-alert-success">{message}</div>}
    <form onSubmit={save} className="account-card account-card-body account-form">
      <div className="measurement-toolbar"><label className="field"><span>Measurement Unit</span><span className="measurement-select-wrap"><select className="measurement-select" value={form.unit} onChange={set("unit")}><option value="inches">Inches</option><option value="cm">Centimetres</option></select></span></label><p>Enter your measurements carefully. Decimals such as 38.5 are supported.</p></div>
      <datalist id="measurement-values">{Array.from({ length: 81 }, (_, i) => <option key={i} value={i + 20} />)}</datalist>
      <div className="measurement-grid">{group("Shirt", SHIRT)}{group("Trouser", TROUSER)}</div>
      <label className="field mt-5"><span>Notes</span><textarea className="measurement-form-notes" value={form.notes || ""} onChange={set("notes")} rows={3} /></label>
      <button disabled={saving}>{saving ? "Saving..." : "Save Measurements"}</button>
    </form>
    <style jsx>{`.measurement-toolbar{display:flex;align-items:end;justify-content:space-between;gap:28px;margin-bottom:28px;padding:18px 20px;border:1px solid #e1ddd3;background:#faf9f6}.measurement-toolbar .field{width:240px;margin:0}.measurement-toolbar p{margin:0 0 9px;color:#777;font-size:13px}.measurement-select-wrap{position:relative;display:block}.measurement-select-wrap:after{position:absolute;right:14px;top:50%;width:8px;height:8px;border-right:2px solid #8b6b37;border-bottom:2px solid #8b6b37;content:"";pointer-events:none;transform:translateY(-70%) rotate(45deg)}.measurement-select{width:100%;height:46px;padding:9px 40px 9px 12px;border:1px solid #bfa879!important;border-radius:0;background:#fffdf5;color:#222;font-size:15px;appearance:none}.measurement-select:focus{border-color:#a27a35!important;outline:0;box-shadow:0 0 0 3px rgba(178,138,74,.18)}.measurement-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;margin-top:8px}.measurement-group{overflow:hidden;border:1px solid #c7c3ba;background:#fff;box-shadow:0 5px 18px rgba(0,0,0,.04)}.measurement-group h3{margin:0;padding:16px 18px;background:#111;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.18em;font-size:15px}.measurement-rows{padding:8px 0}.measurement-row{border-bottom:1px solid #e2dfd8}.measurement-row:last-child{border-bottom:0}.measurement-row>span{color:#333;font-size:13px;font-weight:600;letter-spacing:.05em;text-transform:uppercase}.measurement-row input{display:block;width:100%;height:46px;padding:9px 12px;border:1px solid #cfc9bd!important;border-radius:0;background:#fffdf5;color:#111;font-size:16px;outline:0}.measurement-row input:hover{border-color:#b28a4a!important;background:#fffaf0}.measurement-row input:focus{border-color:#b28a4a!important;background:#fff8e8;box-shadow:0 0 0 3px rgba(178,138,74,.18)}.measurement-form-notes{min-height:110px!important;padding:12px!important}@media(max-width:767px){.measurement-toolbar{display:block}.measurement-toolbar .field{width:100%}.measurement-toolbar p{margin-top:12px}.measurement-grid{grid-template-columns:1fr;gap:20px}.measurement-row{grid-template-columns:minmax(0,1fr) minmax(120px,42%)!important;gap:12px!important;min-height:68px!important;padding:10px 12px!important}.measurement-row>span{font-size:11px}.measurement-row input{height:42px}}`}</style>
  </main>;
}
