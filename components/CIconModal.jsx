"use client";

import { useEffect, useState } from "react";
import { apiCached, apiFetch, currentUserId } from "@/lib/api";

const initialFormData = {
  name: "",
  city: "",
  deliveryDate: "",
  occasion: "",
  dateSlotId: "",
  timeSlotId: "",
};

export default function CIconModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlots, setDateSlots] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let live = true;
    const fetchSlots = async () => {
      try {
        const [dateRes, timeRes] = await Promise.all([
          apiCached("/Appointment-Date-Slots", { ttl: 60000 }),
          apiCached("/Appointment-Time-Slots", { ttl: 60000 }),
        ]);
        if (!live) return;
        const dates = Array.isArray(dateRes) ? dateRes : dateRes?.data || [];
        const times = Array.isArray(timeRes) ? timeRes : timeRes?.data || [];
        setDateSlots(dates.filter((d) => d.isavailable !== false && d.isactive !== false));
        setTimeSlots(times.filter((t) => t.isavailable !== false && t.isactive !== false));
      } catch (err) {
        if (live) setError(err.message || "Failed to load appointment slots.");
      }
    };
    fetchSlots();
    return () => {
      live = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!showSuccess) return undefined;
    const timer = window.setTimeout(() => setShowSuccess(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const handleChange = (e) => {
    setFormData((currentData) => ({
      ...currentData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await apiFetch("/Custom-Appointments", {
        method: "POST",
        body: {
          user_id: currentUserId(),
          appointment_date_slot_id: formData.dateSlotId || null,
          appointment_time_slot_id: formData.timeSlotId || null,
          name: formData.name,
          city: formData.city,
          preferred_delivery_date: formData.deliveryDate,
          occasion: formData.occasion,
          appointment_status: "Pending",
          appointment_notes: `Requested date slot ${formData.dateSlotId}, time slot ${formData.timeSlotId}`,
          rcu: "customer",
        },
      });
      setFormData(initialFormData);
      handleClose();
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to send your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="appointment-modal-backdrop"
          role="presentation"
          onMouseDown={() => !isSubmitting && handleClose()}
        >
          <div
            className="appointmentForm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <span className="appointment-modal-eyebrow">
                    Harry Clinton
                  </span>
                  <h5 className="modal-title" id="appointment-modal-title">
                    Your Custom Design Appointment
                  </h5>
                  <p className="appointment-modal-subtitle">
                    Share your occasion and preferred schedule with our design team.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <form id="appointmentForm" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Your city"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="deliveryDate" className="form-label">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="deliveryDate"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="occasion" className="form-label">
                      Occasion
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="occasion"
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleChange}
                      placeholder="Wedding, reception..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateSlotId" className="form-label">
                      Appointment Date
                    </label>
                    <select
                      className="form-control"
                      id="dateSlotId"
                      name="dateSlotId"
                      value={formData.dateSlotId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a date</option>
                      {dateSlots.map((slot) => (
                        <option key={slot.appointment_date_slot_id} value={slot.appointment_date_slot_id}>
                          {slot.slot_date
                            ? new Date(slot.slot_date).toLocaleDateString("en-IN", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : slot.appointment_date_slot_id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeSlotId" className="form-label">
                      Appointment Time
                    </label>
                    <select
                      className="form-control"
                      id="timeSlotId"
                      name="timeSlotId"
                      value={formData.timeSlotId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.appointment_time_slot_id} value={slot.appointment_time_slot_id}>
                          {slot.slot_start_time || ""} - {slot.slot_end_time || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="appointment-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="appointment-success-toast" role="status" aria-live="polite">
          <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
          <span>
            Your details have been sent to the team. Our designer will contact you soon.
          </span>
        </div>
      )}

      <style jsx>{`
        .appointment-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1055;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow-y: auto;
          background: rgba(8, 7, 7, 0.86);
          perspective: 1200px;
          animation: appointment-backdrop-in 180ms ease-out;
        }

        .appointmentForm {
          width: min(100%, 680px);
          margin: auto;
        }

        .appointmentForm .modal-content {
          position: relative;
          overflow: visible;
          color: #171411;
          background: #f6f1e8;
          border: 1px solid #171411;
          border-radius: 2px;
          box-shadow:
            14px 14px 0 #171411,
            28px 30px 70px rgba(0, 0, 0, 0.48);
          transform: rotateX(1.5deg) rotateY(-1deg);
          transform-origin: center;
          animation: appointment-card-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .appointmentForm .modal-content::before {
          content: "";
          position: absolute;
          inset: 7px;
          z-index: 0;
          border: 1px solid rgba(23, 20, 17, 0.2);
          pointer-events: none;
        }

        .appointmentForm .modal-header,
        .appointmentForm .modal-body {
          position: relative;
          z-index: 1;
        }

        .appointmentForm .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem 2.25rem 1.4rem;
          background: #f6f1e8;
          border-bottom: 1px solid rgba(23, 20, 17, 0.22);
        }

        .appointment-modal-eyebrow {
          display: block;
          margin-bottom: 0.55rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #a8823f;
        }

        .appointmentForm .modal-title {
          max-width: 520px;
          margin: 0;
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.65rem, 4vw, 2.25rem);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.025em;
          color: #171411;
        }

        .appointment-modal-subtitle {
          max-width: 500px;
          margin: 0.75rem 0 0;
          color: #625c55;
          font-size: 0.86rem;
          line-height: 1.6;
        }

        .appointmentForm .btn-close {
          flex: 0 0 auto;
          margin: 0 0 0 1rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid #171411;
          border-radius: 50%;
          opacity: 1;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          color: #171411;
          transition: color 160ms ease, background 160ms ease, transform 160ms ease;
        }

        .appointmentForm .btn-close:hover {
          background-color: #171411;
          color: #f6f1e8;
          transform: rotate(90deg);
        }

        .appointmentForm .modal-body {
          max-height: calc(100vh - 12rem);
          padding: 1.75rem 2.25rem 2.15rem;
          overflow-y: auto;
          background: #f6f1e8;
        }

        .appointmentForm form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.15rem 1.25rem;
        }

        .appointmentForm .form-group {
          margin: 0;
        }

        .appointmentForm .form-label {
          display: block;
          margin-bottom: 0.45rem;
          color: #39342f;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .appointmentForm .form-control {
          width: 100%;
          min-height: 46px;
          padding: 0.65rem 0.8rem;
          color: #171411;
          background: #fffdf9;
          border: 1px solid #bdb4a7;
          border-radius: 0;
          box-shadow: inset 3px 3px 0 rgba(23, 20, 17, 0.035);
          font-size: 0.9rem;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .appointmentForm .form-control::placeholder {
          color: #999087;
        }

        .appointmentForm .form-control:focus {
          outline: none;
          color: #171411;
          background: #fff;
          border-color: #171411;
          box-shadow: 4px 4px 0 rgba(23, 20, 17, 0.12);
        }

        .alert-danger {
          grid-column: 1 / -1;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          background: #fdf2f2;
          border: 1px solid #f8b4b4;
          color: #9b1c1c;
          font-size: 0.85rem;
        }

        .appointment-submit {
          grid-column: 1 / -1;
          min-height: 50px;
          margin-top: 0.25rem;
          color: #f6f1e8;
          background: #171411;
          border: 1px solid #171411;
          border-radius: 0;
          box-shadow: 6px 6px 0 #b8a98f;
          font-size: 0.76rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: box-shadow 160ms ease, transform 160ms ease;
        }

        .appointment-submit:hover:not(:disabled) {
          box-shadow: 2px 2px 0 #b8a98f;
          transform: translate(4px, 4px);
        }

        .appointment-submit:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .appointment-success-toast {
          position: fixed;
          right: 1.5rem;
          bottom: 1.5rem;
          z-index: 1200;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: min(420px, calc(100% - 2rem));
          padding: 1rem 1.25rem;
          color: #f6f1e8;
          background: #171411;
          border: 1px solid #b8a98f;
          border-radius: 0;
          box-shadow:
            6px 6px 0 #b8a98f,
            0 0.75rem 2rem rgba(0, 0, 0, 0.25);
        }

        .appointment-success-toast :global(.bi) {
          flex: 0 0 auto;
          font-size: 1.25rem;
          color: #d4c3a5;
        }

        @keyframes appointment-backdrop-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes appointment-card-in {
          from {
            opacity: 0;
            transform: translateY(22px) rotateX(8deg) rotateY(-3deg) scale(0.97);
          }
          to {
            opacity: 1;
            transform: rotateX(1.5deg) rotateY(-1deg) scale(1);
          }
        }

        @media (max-width: 700px) {
          .appointment-modal-backdrop {
            align-items: flex-start;
            padding: 1rem;
          }

          .appointmentForm {
            margin: 0 auto 1rem;
          }

          .appointmentForm .modal-content {
            box-shadow:
              7px 7px 0 #171411,
              16px 20px 45px rgba(0, 0, 0, 0.42);
            transform: none;
          }

          .appointmentForm .modal-header {
            padding: 1.5rem 1.35rem 1.2rem;
          }

          .appointmentForm .modal-body {
            max-height: none;
            padding: 1.35rem 1.35rem 1.7rem;
          }

          .appointmentForm form {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .appointment-submit {
            grid-column: auto;
          }

          .appointment-success-toast {
            right: 1rem;
            bottom: 1rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .appointment-modal-backdrop,
          .appointmentForm .modal-content {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
