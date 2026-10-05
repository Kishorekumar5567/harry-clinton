"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, unwrap, API_BASE_URL, currentUserId, resolveUploadUrl } from "@/lib/api";
import "../account-pages.css";

// Profile: same structure/texts/flows as the previous UI —
// editable form with photo upload, save states, messages.
export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    fullname: "",
    emailid: "",
    mobile_number: "",
    gender: "",
    dateofbirth: "",
    profile_url: "",
    isactive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Mount hydration reads client-only localStorage + fetches — intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const uid = currentUserId();
    if (!uid) {
      router.replace("/login");
      return;
    }
    let storedUser = {};
    try {
      storedUser = JSON.parse(localStorage.getItem("hc_user") || "{}");
    } catch {
      storedUser = {};
    }
    const savedUser = {
      fullname: storedUser.fullname || storedUser.full_name || storedUser.name || "",
      emailid: storedUser.emailid || storedUser.email_id || storedUser.email || "",
      mobile_number: storedUser.mobile_number || storedUser.phone_number || storedUser.mobile || "",
    };
    setForm((current) => ({ ...current, ...savedUser }));
    setUserId(uid);
    let live = true;
    apiFetch("/Profiles")
      .then(unwrap)
      .then((list) => {
        if (!live) return;
        const arr = Array.isArray(list) ? list : [];
        // NEVER fall back to another row: a missing profile means a fresh
        // form for this user, not someone else's data.
        const p = arr.find((x) => x.user_id === uid) || null;
         if (p) {
           setProfileId(p.profile_id || null);
           setForm({
             fullname: p.fullname || p.full_name || savedUser.fullname,
             emailid: p.emailid || p.email_id || savedUser.emailid,
             mobile_number: p.mobile_number || p.phone_number || savedUser.mobile_number,
             gender: p.gender || "",
             dateofbirth: (p.dateofbirth || "").split("T")[0],
             profile_url: p.profile_url || p.profile_picture_url || "",
             isactive: p.isactive !== false && p.isactive !== 0,
           });
         } else {
           setForm((current) => ({ ...current, ...savedUser }));
         }
      })
      .catch(() => {
        if (live) setMessage({ text: "Failed to load profile", isError: true });
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, profile_url: preview }));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("hc_token");
      const res = await fetch(`${API_BASE_URL}/FileUpload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      const url = data?.data?.virtualPath || data?.virtualPath || data?.data?.url || data?.url || data?.fileUrl;
      if (url) {
        setForm((f) => ({ ...f, profile_url: url }));
        setMessage({ text: "Photo uploaded successfully", isError: false });
      } else {
        setMessage({ text: "Upload did not return a URL. Using local preview.", isError: true });
      }
    } catch {
      setMessage({ text: "Photo upload failed. You can enter a URL manually or try again.", isError: true });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", isError: false });
    try {
      const payload = {
        ...form,
        user_id: userId,
        isactive: form.isactive ? 1 : 0,
        rcu: "website",
      };
      if (profileId) {
        await apiFetch("/Profiles", {
          method: "PUT",
          body: { ...payload, profile_id: profileId, luu: "website" },
        });
      } else {
        const created = unwrap(
          await apiFetch("/Profiles", { method: "POST", body: payload })
        );
        const row = Array.isArray(created) ? created[0] : created;
        if (row?.profile_id) setProfileId(row.profile_id);
      }
      setMessage({ text: "Profile saved successfully", isError: false });
    } catch {
      setMessage({ text: "Failed to save profile", isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
        <SpinnerStyle />
      </div>
    );
  }

  const inputCls = "w-full border border-neutral-300 px-3 py-2 text-sm focus:border-gold focus:outline-none";

  return (
    <div className="account-page">
      <h2>My Profile</h2>
      {message.text && (
        <div className={`account-alert ${message.isError ? "account-alert-error" : "account-alert-success"}`}>
          {message.text}
        </div>
      )}
      <div className="account-card">
        <div className="account-card-body">
        <form onSubmit={submit} className="account-form">
          <div className="two-column">
          <label className="field">
            <span>Full Name</span>
            <input type="text" value={form.fullname} onChange={set("fullname")} required className={inputCls} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.emailid} onChange={set("emailid")} required className={inputCls} />
          </label>
          </div>
          <div className="two-column">
          <label className="field">
            <span>Mobile Number</span>
            <input type="tel" value={form.mobile_number} onChange={set("mobile_number")} required className={inputCls} />
          </label>
            <label className="field">
              <span>Gender</span>
              <select value={form.gender} onChange={set("gender")} className={inputCls}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <div className="two-column">
            <label className="field">
              <span>Date of Birth</span>
              <input type="date" value={form.dateofbirth} onChange={set("dateofbirth")} className={inputCls} />
            </label>
            <div className="field">
            <span>Profile Photo</span>
            <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} className="profile-file-input" />
            {uploading && <div className="mt-1 text-xs text-neutral-500">Uploading photo...</div>}
            {form.profile_url && (
              // eslint-disable-next-line @next/next/no-img-element
               <img
                 alt="Profile preview"
                 src={resolveUploadUrl(form.profile_url)}
                 style={{ width: 80, height: 80, objectFit: "cover", marginTop: 8 }}
                 onError={(e) => { e.currentTarget.style.display = "none"; }}
               />
            )}
          </div>
            </div>
          <label className="check-field">
            <input type="checkbox" id="profileIsActive" checked={form.isactive} onChange={set("isactive")} />
            <span>Active profile</span>
          </label>
          <button disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
        </div>
      </div>
      <SpinnerStyle />
    </div>
  );
}

function SpinnerStyle() {
  return (
    <style jsx>{`
      .spinner-border { width: 2rem; height: 2rem; border: 0.25em solid #ddd; border-top-color: #111; border-radius:0; animation: sd-spin 0.75s linear infinite; display: inline-block; }
      @keyframes sd-spin { to { transform: rotate(360deg); } }
      .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    `}</style>
  );
}
