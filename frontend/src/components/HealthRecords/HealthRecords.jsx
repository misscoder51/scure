import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Calendar,
  User,
  Activity,
  Heart,
  ChevronDown,
  ChevronUp,
  Pill,
  Thermometer,
  Droplets,
  AlertCircle,
  Clock,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ─── Urgency badge config ─────────────────────────────────────────────── */
const urgencyConfig = {
  low: { color: "#fbcfe8", bg: "rgba(251,207,232,0.12)", border: "rgba(251,207,232,0.3)", label: "Low" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", label: "Medium" },
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", label: "High" },
  critical: { color: "#d8b4fe", bg: "rgba(216,180,254,0.12)", border: "rgba(216,180,254,0.3)", label: "Critical" },
};

/* ─── Vitals mini-card ─────────────────────────────────────────────────── */
function VitalCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div
      style={{
        background: "rgba(6,9,20,0.6)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: `${color}18`,
          border: `1px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#f8fafc" }}>
          {value ?? "—"}
          {value && unit && (
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginLeft: 3, fontWeight: 400 }}>{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Single Record Card ───────────────────────────────────────────────── */
function RecordCard({ record, index }) {
  const [expanded, setExpanded] = useState(false);

  const urgency = urgencyConfig[record.urgency?.toLowerCase()] ?? urgencyConfig.low;

  const formattedDate = record.date
    ? new Date(record.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown Date";

  const formattedTime = record.date
    ? new Date(record.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      {/* Timeline dot + connector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 40,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#f9a8d4",
            border: "2.5px solid rgba(249,168,212,0.4)",
            boxShadow: "0 0 10px rgba(249,168,212,0.6), 0 0 20px rgba(249,168,212,0.2)",
            marginTop: 22,
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
        />
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          marginLeft: 16,
          marginBottom: 24,
          background: "rgba(6,9,20,0.75)",
          border: expanded
            ? "1px solid rgba(249,168,212,0.3)"
            : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          backdropFilter: "blur(24px)",
          overflow: "hidden",
          transition: "border-color 0.3s ease",
        }}
      >
        {/* ── Collapsed header ── */}
        <div
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            padding: "18px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            userSelect: "none",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Date + time row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Calendar size={13} color="rgba(249,168,212,0.7)" />
              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", letterSpacing: "0.03em" }}>
                {formattedDate}
                {formattedTime && (
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>· {formattedTime}</span>
                )}
              </span>
            </div>

            {/* Diagnosis */}
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 8, lineHeight: 1.3 }}>
              {record.diagnosis || "No Diagnosis Recorded"}
            </div>

            {/* Doctor + urgency row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {record.doctorName && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <User size={12} color="rgba(148,163,184,0.5)" />
                  <span style={{ fontSize: 12, color: "rgba(148,163,184,0.7)" }}>
                    {record.doctorName}
                  </span>
                </div>
              )}
              {record.urgency && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: urgency.color,
                    background: urgency.bg,
                    border: `1px solid ${urgency.border}`,
                    borderRadius: 20,
                    padding: "2px 10px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {urgency.label}
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: expanded ? "rgba(249,168,212,0.12)" : "rgba(255,255,255,0.04)",
              border: expanded ? "1px solid rgba(249,168,212,0.3)" : "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s ease",
              marginTop: 2,
            }}
          >
            {expanded ? (
              <ChevronUp size={15} color="#f9a8d4" />
            ) : (
              <ChevronDown size={15} color="rgba(148,163,184,0.5)" />
            )}
          </div>
        </div>

        {/* ── Expanded content ── */}
        {expanded && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Symptoms */}
            {record.symptoms && record.symptoms.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <Activity size={13} color="#d8b4fe" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(148,163,184,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Symptoms
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {record.symptoms.map((symptom, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#d8b4fe",
                        background: "rgba(216,180,254,0.10)",
                        border: "1px solid rgba(216,180,254,0.25)",
                        borderRadius: 20,
                        padding: "4px 12px",
                      }}
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vitals 2x2 grid */}
            {record.vitals && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <Heart size={13} color="#ef4444" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(148,163,184,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Vitals
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <VitalCard
                    icon={Heart}
                    label="Heart Rate"
                    value={record.vitals.heartRate}
                    unit="bpm"
                    color="#ef4444"
                  />
                  <VitalCard
                    icon={Droplets}
                    label="Blood Pressure"
                    value={record.vitals.bloodPressure}
                    unit="mmHg"
                    color="#f9a8d4"
                  />
                  <VitalCard
                    icon={Thermometer}
                    label="Temperature"
                    value={record.vitals.temperature}
                    unit="°F"
                    color="#f59e0b"
                  />
                  <VitalCard
                    icon={Activity}
                    label="Weight"
                    value={record.vitals.weight}
                    unit="kg"
                    color="#fbcfe8"
                  />
                </div>
              </div>
            )}

            {/* Doctor Notes */}
            {record.notes && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <Stethoscope size={13} color="#f9a8d4" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(148,163,184,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Doctor's Notes
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(249,168,212,0.04)",
                    border: "1px solid rgba(249,168,212,0.12)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    fontSize: 13,
                    color: "#e2e8f0",
                    lineHeight: 1.65,
                    fontStyle: "italic",
                  }}
                >
                  "{record.notes}"
                </div>
              </div>
            )}

            {/* Linked Prescription */}
            {record.prescriptionId && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(251,207,232,0.06)",
                  border: "1px solid rgba(251,207,232,0.2)",
                  borderRadius: 12,
                  padding: "10px 14px",
                }}
              >
                <Pill size={15} color="#fbcfe8" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Linked Prescription
                  </div>
                  <div style={{ fontSize: 13, color: "#fbcfe8", fontWeight: 500, fontFamily: "monospace" }}>
                    #{record.prescriptionId}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ─────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: 0, marginBottom: 24 }}>
          <div style={{ width: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "rgba(249,168,212,0.2)",
                marginTop: 22,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              marginLeft: 16,
              height: 100,
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "rgba(249,168,212,0.08)",
          border: "1px solid rgba(249,168,212,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <FileText size={32} color="rgba(249,168,212,0.5)" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
        No Health Records Found
      </div>
      <div style={{ fontSize: 14, color: "rgba(148,163,184,0.6)", maxWidth: 320, lineHeight: 1.6 }}>
        Your health records will appear here once a doctor has added them to your profile.
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function HealthRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?._id) return;

    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `http://localhost:5001/health-records?studentId=${user._id}`
        );
        // Sort by date descending (most recent first)
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecords(sorted);
      } catch (err) {
        console.error("Failed to fetch health records:", err);
        setError("Unable to load health records. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user?._id]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgba(6,9,20,0.95)",
        padding: "32px 24px",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(249,168,212,0.25) 0%, rgba(59,130,246,0.25) 100%)",
              border: "1px solid rgba(249,168,212,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(249,168,212,0.15)",
              flexShrink: 0,
            }}
          >
            <FileText size={24} color="#f9a8d4" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Health Records
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "rgba(148,163,184,0.6)",
              }}
            >
              {loading
                ? "Loading your medical history…"
                : records.length > 0
                ? `${records.length} record${records.length !== 1 ? "s" : ""} found`
                : "Your complete medical timeline"}
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, rgba(249,168,212,0.4) 0%, rgba(249,168,212,0.05) 100%)",
            marginBottom: 36,
            borderRadius: 1,
          }}
        />

        {/* ── Error State ── */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 28,
            }}
          >
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ fontSize: 13, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : records.length === 0 ? (
          <EmptyState />
        ) : (
          /* ── Timeline ── */
          <div style={{ position: "relative" }}>
            {/* Vertical cyan line */}
            <div
              style={{
                position: "absolute",
                left: 19,
                top: 28,
                bottom: 28,
                width: 2,
                background:
                  "linear-gradient(180deg, rgba(249,168,212,0.7) 0%, rgba(249,168,212,0.05) 100%)",
                borderRadius: 2,
                zIndex: 0,
              }}
            />

            {/* Records */}
            <div style={{ position: "relative", zIndex: 1 }}>
              {records.map((record, index) => (
                <RecordCard key={record._id ?? index} record={record} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* ── Footer note ── */}
        {!loading && records.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 8,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <Clock size={11} color="rgba(148,163,184,0.35)" />
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.35)" }}>
              Records are sorted by most recent visit first
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
