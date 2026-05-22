import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowRight,
  Activity,
  X,
  RotateCcw,
  Loader2,
  Thermometer,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SYMPTOMS = [
  "fever",
  "headache",
  "cough",
  "sore throat",
  "body ache",
  "fatigue",
  "nausea",
  "vomiting",
  "diarrhea",
  "stomach pain",
  "chest pain",
  "shortness of breath",
  "rash",
  "dizziness",
  "anxiety",
  "insomnia",
  "joint pain",
  "back pain",
  "weakness",
  "runny nose",
];

const URGENCY_CONFIG = {
  critical: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.4)",
    glow: "0 0 20px rgba(239,68,68,0.4)",
    label: "CRITICAL",
    icon: AlertTriangle,
    description: "Seek emergency care immediately",
  },
  high: {
    color: "#d8b4fe",
    bg: "rgba(216,180,254,0.15)",
    border: "rgba(216,180,254,0.4)",
    glow: "0 0 20px rgba(216,180,254,0.4)",
    label: "HIGH",
    icon: AlertTriangle,
    description: "See a doctor as soon as possible",
  },
  medium: {
    color: "#fbcfe8",
    bg: "rgba(251,207,232,0.15)",
    border: "rgba(251,207,232,0.4)",
    glow: "0 0 20px rgba(251,207,232,0.35)",
    label: "MEDIUM",
    icon: Activity,
    description: "Schedule a medical appointment soon",
  },
  low: {
    color: "#fbcfe8",
    bg: "rgba(251,207,232,0.15)",
    border: "rgba(251,207,232,0.4)",
    glow: "0 0 20px rgba(251,207,232,0.35)",
    label: "LOW",
    icon: CheckCircle,
    description: "Monitor symptoms and rest",
  },
};

const ConfidenceBar = ({ value, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div
      style={{
        width: "100%",
        height: "6px",
        background: "rgba(255,255,255,0.07)",
        borderRadius: "99px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          borderRadius: "99px",
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 8px ${color}88`,
          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
};

export default function SymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [additionalText, setAdditionalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const spinRef = useRef(null);

  useEffect(() => {
    if (loading) {
      spinRef.current = setInterval(() => {
        setSpinAngle((prev) => prev + 6);
      }, 16);
    } else {
      clearInterval(spinRef.current);
    }
    return () => clearInterval(spinRef.current);
  }, [loading]);

  const toggleSymptom = (symptom) => {
    setSelected((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    const allSymptoms = [
      ...selected,
      ...additionalText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ];

    if (allSymptoms.length === 0) {
      setError("Please select at least one symptom or enter additional symptoms.");
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(false);

    try {
      const response = await axios.post(
        "http://localhost:5001/symptoms/analyze",
        {
          symptoms: allSymptoms,
          additionalInfo: additionalText,
        },
        {
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : {},
        }
      );

      setResults(response.data);
      setTimeout(() => setShowResults(true), 50);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to analyze symptoms. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelected([]);
    setAdditionalText("");
    setResults(null);
    setShowResults(false);
    setError(null);
  };

  const urgency = results?.urgency?.toLowerCase() || "low";
  const urgencyConfig = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.low;
  const UrgencyIcon = urgencyConfig.icon;

  const topPrediction = results?.predictions?.[0];
  const otherPredictions = results?.predictions?.slice(1) || [];

  const predictionColors = ["#f9a8d4", "#d8b4fe", "#fbcfe8", "#d8b4fe", "#fbcfe8"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 50%, rgba(249,168,212,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(216,180,254,0.04) 0%, transparent 60%), rgb(6,9,20)",
        padding: "40px 24px 80px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,168,212,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "20%",
          right: "5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(216,180,254,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(249,168,212,0.2) 0%, rgba(216,180,254,0.2) 100%)",
              border: "1px solid rgba(249,168,212,0.3)",
              boxShadow: "0 0 30px rgba(249,168,212,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              marginBottom: "20px",
            }}
          >
            <Brain size={36} color="#f9a8d4" />
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 700,
              background: "linear-gradient(135deg, #f8fafc 0%, #f9a8d4 50%, #d8b4fe 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}
          >
            AI Symptom Checker
          </h1>
          <p
            style={{
              color: "rgba(148,163,184,0.7)",
              fontSize: "15px",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Select your symptoms below and let our AI analyze potential conditions.
            <br />
            <span style={{ color: "rgba(148,163,184,0.5)", fontSize: "13px" }}>
              This tool is for informational purposes only — always consult a healthcare professional.
            </span>
          </p>
        </div>

        {/* ── SYMPTOM SELECTION CARD ── */}
        <div
          style={{
            background: "rgba(6,9,20,0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(249,168,212,0.15)",
            borderRadius: "24px",
            padding: "28px",
            marginBottom: "20px",
            boxShadow: "0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Thermometer size={18} color="#f9a8d4" />
              <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px" }}>
                Select Symptoms
              </span>
            </div>
            {selected.length > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(249,168,212,0.15) 0%, rgba(216,180,254,0.15) 100%)",
                  border: "1px solid rgba(249,168,212,0.3)",
                  borderRadius: "99px",
                  padding: "4px 12px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#f9a8d4",
                    boxShadow: "0 0 6px #f9a8d4",
                  }}
                />
                <span style={{ color: "#f9a8d4", fontSize: "13px", fontWeight: 600 }}>
                  {selected.length} selected
                </span>
              </div>
            )}
          </div>

          {/* Chips grid */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            {SYMPTOMS.map((symptom) => {
              const isActive = selected.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "99px",
                    border: isActive
                      ? "1px solid rgba(249,168,212,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(249,168,212,0.25) 0%, rgba(216,180,254,0.15) 100%)"
                      : "rgba(255,255,255,0.04)",
                    color: isActive ? "#f9a8d4" : "rgba(148,163,184,0.8)",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 0 12px rgba(249,168,212,0.2)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    textTransform: "capitalize",
                    outline: "none",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "rgba(249,168,212,0.3)";
                      e.currentTarget.style.color = "#e2e8f0";
                      e.currentTarget.style.background = "rgba(249,168,212,0.07)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "rgba(148,163,184,0.8)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                >
                  {isActive && (
                    <CheckCircle size={13} color="#f9a8d4" strokeWidth={2.5} />
                  )}
                  {symptom}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(249,168,212,0.2), transparent)",
              marginBottom: "20px",
            }}
          />

          {/* Additional input */}
          <div>
            <label
              style={{
                display: "block",
                color: "rgba(148,163,184,0.8)",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "8px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Additional Symptoms (comma-separated)
            </label>
            <input
              type="text"
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              placeholder="e.g. blurred vision, ear pain, swollen lymph nodes..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 16px",
                color: "#e2e8f0",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(249,168,212,0.4)";
                e.target.style.boxShadow = "0 0 0 3px rgba(249,168,212,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle size={16} color="#ef4444" />
            <span style={{ color: "#ef4444", fontSize: "14px" }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(239,68,68,0.7)",
                padding: "2px",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px 24px",
              borderRadius: "12px",
              border: "1px solid rgba(249,168,212,0.4)",
              background: loading
                ? "rgba(249,168,212,0.1)"
                : "linear-gradient(135deg, rgba(249,168,212,0.2) 0%, rgba(216,180,254,0.15) 100%)",
              color: loading ? "rgba(249,168,212,0.5)" : "#f9a8d4",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: loading ? "none" : "0 0 20px rgba(249,168,212,0.15)",
              outline: "none",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(249,168,212,0.3)";
                e.currentTarget.style.borderColor = "rgba(249,168,212,0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(249,168,212,0.15)";
                e.currentTarget.style.borderColor = "rgba(249,168,212,0.4)";
              }
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  color="#f9a8d4"
                  style={{
                    transform: `rotate(${spinAngle}deg)`,
                    transition: "transform 0.016s linear",
                  }}
                />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={18} />
                Analyze Symptoms
              </>
            )}
          </button>

          {(selected.length > 0 || additionalText || results) && (
            <button
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(148,163,184,0.7)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "none",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(148,163,184,0.7)";
              }}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          )}
        </div>

        {/* ── RESULTS ── */}
        {results && (
          <div
            style={{
              opacity: showResults ? 1 : 0,
              transform: showResults ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            {/* Top prediction */}
            {topPrediction && (
              <div
                style={{
                  background: "rgba(6,9,20,0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(249,168,212,0.2)",
                  borderRadius: "24px",
                  padding: "28px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 40px rgba(0,0,0,0.4), 0 0 40px rgba(249,168,212,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle glow overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(249,168,212,0.5), rgba(216,180,254,0.5), transparent)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(249,168,212,0.2), rgba(216,180,254,0.2))",
                      border: "1px solid rgba(249,168,212,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Activity size={16} color="#f9a8d4" />
                  </div>
                  <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "16px" }}>
                    Top Prediction
                  </span>
                  <div
                    style={{
                      marginLeft: "auto",
                      background: "rgba(249,168,212,0.12)",
                      border: "1px solid rgba(249,168,212,0.25)",
                      borderRadius: "99px",
                      padding: "3px 10px",
                      fontSize: "12px",
                      color: "#f9a8d4",
                      fontWeight: 600,
                    }}
                  >
                    AI Diagnosis
                  </div>
                </div>

                <h2
                  style={{
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 700,
                    color: "#f8fafc",
                    margin: "0 0 6px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {topPrediction.disease || topPrediction.condition || topPrediction.name}
                </h2>
                <p
                  style={{
                    color: "rgba(148,163,184,0.7)",
                    fontSize: "14px",
                    margin: "0 0 16px",
                  }}
                >
                  Confidence:{" "}
                  <span style={{ color: "#f9a8d4", fontWeight: 600 }}>
                    {Math.round(
                      (topPrediction.confidence || topPrediction.probability || 0) * 100
                    ) ||
                      topPrediction.confidence_percent ||
                      topPrediction.confidence ||
                      0}
                    %
                  </span>
                </p>
                <ConfidenceBar
                  value={
                    Math.round(
                      (topPrediction.confidence || topPrediction.probability || 0) * 100
                    ) ||
                    topPrediction.confidence_percent ||
                    topPrediction.confidence ||
                    0
                  }
                  color="#f9a8d4"
                  delay={200}
                />
              </div>
            )}

            {/* Urgency Badge */}
            {results.urgency && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  background: urgencyConfig.bg,
                  border: `1px solid ${urgencyConfig.border}`,
                  borderRadius: "16px",
                  padding: "16px 20px",
                  marginBottom: "16px",
                  boxShadow: urgencyConfig.glow,
                }}
              >
                <UrgencyIcon size={22} color={urgencyConfig.color} />
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        background: urgencyConfig.bg,
                        border: `1px solid ${urgencyConfig.border}`,
                        borderRadius: "99px",
                        padding: "3px 12px",
                        color: urgencyConfig.color,
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {urgencyConfig.label}
                    </span>
                    <span
                      style={{
                        color: "#f8fafc",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      Urgency Level
                    </span>
                  </div>
                  <p
                    style={{
                      color: urgencyConfig.color,
                      fontSize: "13px",
                      margin: 0,
                      opacity: 0.85,
                    }}
                  >
                    {results.urgencyLabel || urgencyConfig.description}
                  </p>
                </div>
              </div>
            )}

            {/* All predictions */}
            {otherPredictions.length > 0 && (
              <div
                style={{
                  background: "rgba(6,9,20,0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px",
                  padding: "24px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <h3
                  style={{
                    color: "#f8fafc",
                    fontWeight: 600,
                    fontSize: "14px",
                    margin: "0 0 16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Other Possible Conditions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {otherPredictions.map((pred, i) => {
                    const confVal =
                      Math.round(
                        (pred.confidence || pred.probability || 0) * 100
                      ) ||
                      pred.confidence_percent ||
                      pred.confidence ||
                      0;
                    const col = predictionColors[(i + 1) % predictionColors.length];
                    return (
                      <div key={i}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              color: "#e2e8f0",
                              fontSize: "14px",
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          >
                            {pred.disease || pred.condition || pred.name}
                          </span>
                          <span
                            style={{
                              background: `${col}18`,
                              border: `1px solid ${col}44`,
                              borderRadius: "99px",
                              padding: "2px 10px",
                              color: col,
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {confVal}%
                          </span>
                        </div>
                        <ConfidenceBar value={confVal} color={col} delay={300 + i * 100} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Precautions */}
            {results.precautions?.length > 0 && (
              <div
                style={{
                  background: "rgba(6,9,20,0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(251,207,232,0.15)",
                  borderRadius: "20px",
                  padding: "24px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <Shield size={16} color="#fbcfe8" />
                  <h3
                    style={{
                      color: "#f8fafc",
                      fontWeight: 600,
                      fontSize: "14px",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Recommended Precautions
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {results.precautions.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        background: "rgba(251,207,232,0.06)",
                        border: "1px solid rgba(251,207,232,0.12)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                      }}
                    >
                      <CheckCircle
                        size={15}
                        color="#fbcfe8"
                        style={{ marginTop: "1px", flexShrink: 0 }}
                      />
                      <span style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: 1.5 }}>
                        {p}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {results.recommendation && (
              <div
                style={{
                  background: "rgba(6,9,20,0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(216,180,254,0.15)",
                  borderRadius: "20px",
                  padding: "24px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <Zap size={15} color="#d8b4fe" />
                  <h3
                    style={{
                      color: "#f8fafc",
                      fontWeight: 600,
                      fontSize: "14px",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Recommendation
                  </h3>
                </div>
                <p style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                  {results.recommendation}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <p
              style={{
                color: "rgba(148,163,184,0.45)",
                fontSize: "12px",
                lineHeight: 1.6,
                textAlign: "center",
                marginBottom: "24px",
                padding: "0 16px",
              }}
            >
              ⚠️ This AI analysis is for informational purposes only and does not constitute medical
              advice. Always consult a qualified healthcare professional for diagnosis and treatment.
              In case of emergency, call emergency services immediately.
            </p>

            {/* Book appointment CTA */}
            <button
              onClick={() => navigate("/appointment-scheduler")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "16px 24px",
                borderRadius: "14px",
                border: "1px solid rgba(216,180,254,0.4)",
                background: "linear-gradient(135deg, rgba(216,180,254,0.18) 0%, rgba(249,168,212,0.12) 100%)",
                color: "#d8b4fe",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 0 20px rgba(216,180,254,0.12)",
                outline: "none",
                fontFamily: "inherit",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 35px rgba(216,180,254,0.28)";
                e.currentTarget.style.borderColor = "rgba(216,180,254,0.6)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(216,180,254,0.25) 0%, rgba(249,168,212,0.18) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(216,180,254,0.12)";
                e.currentTarget.style.borderColor = "rgba(216,180,254,0.4)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(216,180,254,0.18) 0%, rgba(249,168,212,0.12) 100%)";
              }}
            >
              <Brain size={18} />
              Book an Appointment
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(148, 163, 184, 0.35);
        }
      `}</style>
    </div>
  );
}
