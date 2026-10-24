import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  Wrench,
  CarFront,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Calendar,
  IndianRupee,
  ShieldCheck,
  User,
  ArrowRight,
  Phone,
  Printer,
  Sparkles,
  RefreshCw,
  X,
  Lock,
  ChevronRight,
  FileText,
  Mail,
  KeyRound,
  LogOut,
  Info
} from "lucide-react";

function UserDashboard() {
  // Navigation & Auth Tabs: "plate" or "email"
  const [authMode, setAuthMode] = useState("plate");

  // Inputs
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Verification Barrier State
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingVehicle, setPendingVehicle] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [requiresManualEmail, setRequiresManualEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Authenticated State & Data
  const [isVerified, setIsVerified] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  // Check existing session token on mount
  useEffect(() => {
    try {
      const savedSearches = JSON.parse(
        localStorage.getItem("recent_vehicle_searches") || "[]"
      );
      setRecentSearches(savedSearches);

      const token = localStorage.getItem("autoflow_user_token");
      if (token) {
        verifyExistingSession();
      }
    } catch {
      // ignore
    }
  }, []);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Verify stored session token
  const verifyExistingSession = async () => {
    try {
      const token = localStorage.getItem("autoflow_user_token");
      if (!token) return;

      const response = await API.get("/user-auth/my-data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setIsVerified(true);
        setAuthenticatedUser(response.data.customer);
        setUserVehicles(response.data.vehicles || []);
        if (response.data.vehicles?.length > 0) {
          setSelectedVehicleIndex(0);
        }
      }
    } catch (err) {
      // Invalid/expired token
      localStorage.removeItem("autoflow_user_token");
      setIsVerified(false);
      setAuthenticatedUser(null);
      setUserVehicles([]);
    }
  };

  // Logout / Lock Portal
  const handleLogout = () => {
    localStorage.removeItem("autoflow_user_token");
    setIsVerified(false);
    setAuthenticatedUser(null);
    setUserVehicles([]);
    setVerificationPending(false);
    setPendingVehicle(null);
    setOtpInput("");
    setError("");
    setSuccessMsg("");
  };

  // Step 1: Request OTP by Vehicle Plate
  const handlePlateSearch = async (plateToSearch) => {
    const query = (plateToSearch || vehicleNumber).trim().toUpperCase();
    if (!query) {
      setError("Please enter a vehicle license plate number.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("autoflow_user_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // First check track route
      const trackRes = await API.get(`/services/track/${query}`, { headers });
      const trackData = trackRes.data;

      // If already verified or authenticated
      if (!trackData.requiresVerification && trackData.isVerified) {
        setIsVerified(true);
        setUserVehicles([
          {
            vehicleNumber: trackData.vehicleNumber,
            model: trackData.vehicle?.model || "Vehicle",
            vehicleType: trackData.vehicle?.vehicleType || "Vehicle",
            customerName: trackData.vehicle?.customerName || "Customer",
            registrationYear: trackData.vehicle?.registrationYear || "N/A",
            latestStatus: trackData.latestStatus,
            services: trackData.services || [],
          },
        ]);
        setSelectedVehicleIndex(0);
        setVerificationPending(false);

        // Save recent search
        saveRecentSearch(query);
        return;
      }

      // If verification is required, trigger OTP send
      setPendingVehicle({
        vehicleNumber: query,
        model: trackData.model,
        vehicleType: trackData.vehicleType,
        maskedEmail: trackData.maskedEmail,
        hasRegisteredEmail: trackData.hasRegisteredEmail,
        targetEmail: trackData.targetEmail,
      });

      if (trackData.hasRegisteredEmail && trackData.targetEmail) {
        // Send OTP directly to registered email
        await sendOtpRequest({
          vehicleNumber: query,
          email: trackData.targetEmail,
        });
      } else {
        // Prompt user to enter their email
        setRequiresManualEmail(true);
        setVerificationPending(true);
        setMaskedEmail("your registered email");
      }

      saveRecentSearch(query);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No vehicle record found for "${query}". Please check the plate number or contact our garage desk.`
      );
      setVerificationPending(false);
    } finally {
      setLoading(false);
    }
  };

  // Step 1B: Request OTP by Direct Email
  const handleEmailAuth = async (e) => {
    if (e) e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await sendOtpRequest({ email });
    } finally {
      setLoading(false);
    }
  };

  // Send OTP API call using Resend
  const sendOtpRequest = async (payload) => {
    try {
      setError("");
      const res = await API.post("/user-auth/send-otp", payload);
      if (res.data.success) {
        setVerificationPending(true);
        setMaskedEmail(res.data.maskedEmail);
        setTargetEmail(res.data.email);
        setResendCooldown(60);
        setSuccessMsg(res.data.message || "Verification code sent to your email!");
      }
    } catch (err) {
      if (err.response?.data?.requiresManualEmail) {
        setRequiresManualEmail(true);
        setVerificationPending(true);
      }
      setError(
        err.response?.data?.message ||
          "Failed to send verification code. Please verify the email and try again."
      );
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otpInput.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setVerifying(true);

    try {
      const emailToVerify = targetEmail || emailInput.trim();
      const res = await API.post("/user-auth/verify-otp", {
        email: emailToVerify,
        otp: cleanOtp,
        vehicleNumber: pendingVehicle?.vehicleNumber || vehicleNumber,
      });

      if (res.data.success) {
        // Store session token in localStorage
        localStorage.setItem("autoflow_user_token", res.data.token);

        setIsVerified(true);
        setAuthenticatedUser(res.data.customer);
        setUserVehicles(res.data.vehicles || []);
        setSelectedVehicleIndex(0);
        setVerificationPending(false);
        setOtpInput("");
        setSuccessMsg("Email verified successfully! Full access granted to your service records.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired verification code. Please check your inbox or resend code."
      );
    } finally {
      setVerifying(false);
    }
  };

  const saveRecentSearch = (plate) => {
    const updated = [plate, ...recentSearches.filter((p) => p !== plate)].slice(0, 4);
    setRecentSearches(updated);
    localStorage.setItem("recent_vehicle_searches", JSON.stringify(updated));
  };

  const handlePrint = () => {
    window.print();
  };

  // Currently active vehicle from the verified vehicle list
  const activeVehicle = userVehicles[selectedVehicleIndex] || userVehicles[0] || null;

  // Determine stage number for progress stepper
  const getStageNumber = () => {
    if (!activeVehicle) return 1;
    if (activeVehicle.latestStatus === "Completed") return 3;
    if (activeVehicle.latestStatus === "In Progress") return 2;
    return 1;
  };

  const stage = getStageNumber();

  return (
    <div className="user-portal-page">
      {/* Top Header Navbar */}
      <header className="user-portal-navbar">
        <div className="portal-nav-brand">
          <div className="logo-icon-badge">
            <Wrench size={20} />
          </div>
          <div className="portal-brand-text">
            <span className="brand-title">
              Auto<span>Flow</span>
            </span>
            <span className="brand-tag">Customer Care & Repair Hub</span>
          </div>
        </div>

        <div className="portal-nav-actions">
          {/* User Session Pill */}
          {isVerified ? (
            <div className="portal-auth-nav-pill verified">
              <ShieldCheck size={16} />
              <span>
                Verified: <strong>{authenticatedUser?.email || "Customer"}</strong>
              </span>
              <button
                type="button"
                className="auth-logout-btn"
                onClick={handleLogout}
                title="Log out session"
              >
                <LogOut size={13} style={{ verticalAlign: "middle" }} /> Exit
              </button>
            </div>
          ) : (
            <div className="portal-auth-nav-pill">
              <Lock size={14} />
              <span>Customer Portal Protected</span>
            </div>
          )}

          <div className="system-pill">
            <span className="system-status-dot"></span>
            <span className="system-status-text">Workshop Live</span>
          </div>

          <Link to="/login" className="admin-login-link">
            <Lock size={14} />
            <span>Admin Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Portal Container */}
      <main className="user-portal-container">
        {/* If user is ALREADY VERIFIED: Show Welcome Header */}
        {isVerified && authenticatedUser && (
          <div className="user-verified-welcome-bar">
            <div className="welcome-user-info">
              <ShieldCheck size={28} />
              <div>
                <h3>Welcome, {authenticatedUser.name || "Valued Customer"}!</h3>
                <p>
                  Authenticated Account • {authenticatedUser.email}
                  {authenticatedUser.phone && ` • 📞 ${authenticatedUser.phone}`}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={verifyExistingSession}
                className="plate-chip-btn"
                style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.4)" }}
                title="Refresh vehicle status"
              >
                <RefreshCw size={13} />
                <span>Refresh Status</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="auth-logout-btn"
                style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", padding: "6px 12px" }}
              >
                Lock & Sign Out
              </button>
            </div>
          </div>
        )}

        {/* If NOT Verified and NOT in middle of OTP: Show Hero & Access Tabs */}
        {!isVerified && !verificationPending && (
          <section className="portal-hero">
            <div className="hero-pill-badge">
              <Sparkles size={13} className="text-amber-400" />
              <span>Secure Vehicle Service Portal</span>
            </div>

            <h1 className="portal-hero-title">
              Track Your Vehicle Repair Progress
            </h1>
            <p className="portal-hero-subtitle">
              Verify your registered email to access live mechanic diagnostic logs, repair status stages, and invoice receipts.
            </p>

            {/* Auth Mode Switcher */}
            <div className="auth-switch-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${authMode === "plate" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("plate");
                  setError("");
                  setSuccessMsg("");
                }}
              >
                <CarFront size={16} />
                <span>Track by License Plate</span>
              </button>

              <button
                type="button"
                className={`auth-tab-btn ${authMode === "email" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("email");
                  setError("");
                  setSuccessMsg("");
                }}
              >
                <Mail size={16} />
                <span>Sign In with Email (Resend OTP)</span>
              </button>
            </div>

            {/* Tab 1: Track by Plate */}
            {authMode === "plate" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePlateSearch();
                }}
                className="vehicle-search-card"
              >
                <div className="search-bar-inner">
                  <CarFront size={22} className="search-plate-icon" />
                  <input
                    type="text"
                    placeholder="Enter Plate Number (e.g. MH20AB1234)"
                    value={vehicleNumber}
                    onChange={(e) => {
                      setVehicleNumber(e.target.value.toUpperCase());
                      setError("");
                    }}
                    maxLength="12"
                    className="search-plate-input"
                    autoFocus
                  />
                  {vehicleNumber && (
                    <button
                      type="button"
                      onClick={() => setVehicleNumber("")}
                      className="search-clear-btn"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="search-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Search size={17} />
                      <span>Track Status</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab 2: Sign In with Email */}
            {authMode === "email" && (
              <form onSubmit={handleEmailAuth} className="vehicle-search-card">
                <div className="search-bar-inner">
                  <Mail size={22} className="search-plate-icon" />
                  <input
                    type="email"
                    placeholder="Enter your registered email (e.g. ashok@example.com)"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setError("");
                    }}
                    className="search-plate-input"
                    autoFocus
                  />
                  {emailInput && (
                    <button
                      type="button"
                      onClick={() => setEmailInput("")}
                      className="search-clear-btn"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="search-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={17} />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && authMode === "plate" && (
              <div className="recent-chips-row">
                <span className="recent-chips-label">Recent Searches:</span>
                {recentSearches.map((plate) => (
                  <button
                    key={plate}
                    type="button"
                    onClick={() => {
                      setVehicleNumber(plate);
                      handlePlateSearch(plate);
                    }}
                    className="plate-chip-btn"
                  >
                    <CarFront size={12} />
                    <span>{plate}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="portal-error-banner" style={{ marginTop: "20px" }}>
                <AlertCircle size={18} className="flex-shrink-0" />
                <div>
                  <strong>Attention</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            EMAIL AUTHENTICATION & VERIFICATION REQUIRED BARRIER
            (Shown when user searches a vehicle or enters email to verify before granting data access)
           ========================================================================= */}
        {!isVerified && verificationPending && (
          <div className="verification-barrier-card">
            <div className="barrier-header">
              <div className="barrier-icon-badge">
                <Lock size={26} />
              </div>
              <div>
                <h2 className="barrier-title">Email Verification Required</h2>
                <p className="barrier-subtitle">
                  Authenticate your identity to view protected repair diagnostics & billing invoices
                </p>
              </div>
            </div>

            <div className="barrier-body">
              {/* Vehicle Preview (if tracking by plate) */}
              {pendingVehicle && (
                <div className="barrier-vehicle-preview">
                  <div className="preview-plate-badge">
                    <CarFront size={18} />
                    <span>{pendingVehicle.vehicleNumber}</span>
                  </div>
                  <div className="preview-model-text">
                    {pendingVehicle.model} ({pendingVehicle.vehicleType})
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="security-notice-box">
                <ShieldCheck size={22} style={{ color: "#2563eb", flexShrink: 0 }} />
                <div className="security-notice-text">
                  A 6-digit one-time verification code has been dispatched via <strong>Resend</strong> to:{" "}
                  <strong>{maskedEmail}</strong>.
                  <br />
                  Please check your inbox or spam folder and enter the code below to access your vehicle records.
                </div>
              </div>

              {/* If Vehicle has no email on file, let user specify their email */}
              {requiresManualEmail && (
                <div style={{ marginBottom: "20px" }}>
                  <label className="input-label" style={{ marginBottom: "6px", display: "block" }}>
                    <Mail size={13} style={{ verticalAlign: "middle" }} /> Enter Your Registered Email Address:
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="email"
                      placeholder="e.g. ashok@example.com"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="pro-select-dropdown"
                    />
                    <button
                      type="button"
                      className="primary-action-btn"
                      onClick={() =>
                        sendOtpRequest({
                          vehicleNumber: pendingVehicle?.vehicleNumber,
                          email: targetEmail,
                        })
                      }
                      disabled={loading || !targetEmail}
                    >
                      Send Code
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: "center" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Enter 6-Digit Code
                  </label>

                  <div className="otp-input-row">
                    <input
                      type="text"
                      maxLength="6"
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtpInput(val);
                        setError("");
                      }}
                      placeholder="••••••"
                      autoFocus
                      className="otp-box-input"
                      style={{ width: "240px", letterSpacing: "12px", fontSize: "28px" }}
                    />
                  </div>
                </div>

                {error && (
                  <p className="form-error" style={{ textAlign: "center", marginBottom: "16px" }}>
                    <AlertCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                    {error}
                  </p>
                )}

                {successMsg && (
                  <div className="dev-hint-banner" style={{ background: "#f0fdf4", borderColor: "#86efac", color: "#166534", marginBottom: "16px" }}>
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="otp-verify-action-btn"
                  disabled={verifying || otpInput.length < 6}
                >
                  {verifying ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verify Email & Access Data</span>
                    </>
                  )}
                </button>

                {/* Resend Row & Back */}
                <div className="otp-resend-row">
                  <div>
                    {resendCooldown > 0 ? (
                      <span>Resend code in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          sendOtpRequest({
                            email: targetEmail || emailInput,
                            vehicleNumber: pendingVehicle?.vehicleNumber,
                          })
                        }
                        className="resend-link-btn"
                      >
                        Resend Verification Email
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setVerificationPending(false);
                      setOtpInput("");
                      setError("");
                    }}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px" }}
                  >
                    ← Back to search
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            VERIFIED USER SECTION: FULL ACCESS TO VEHICLE REPAIR & INVOICE DATA
            (Strictly displayed ONLY when email is verified!)
           ========================================================================= */}
        {isVerified && activeVehicle && (
          <section className="repair-status-result-section">
            {/* Multi-Vehicle Picker if customer owns more than 1 vehicle */}
            {userVehicles.length > 1 && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "10px", color: "#334155" }}>
                  Your Registered Vehicles ({userVehicles.length}):
                </h3>
                <div className="user-vehicles-grid">
                  {userVehicles.map((veh, idx) => (
                    <div
                      key={veh.vehicleNumber}
                      className={`user-vehicle-card ${
                        idx === selectedVehicleIndex ? "active" : ""
                      }`}
                      onClick={() => setSelectedVehicleIndex(idx)}
                    >
                      <div className="vehicle-card-plate">
                        <CarFront size={16} />
                        <span>{veh.vehicleNumber}</span>
                      </div>
                      <div className="vehicle-card-model">{veh.model}</div>
                      <span
                        className={`vehicle-card-status-badge ${
                          veh.latestStatus === "Completed"
                            ? "Completed"
                            : veh.latestStatus === "In Progress"
                            ? "InProgress"
                            : "Pending"
                        }`}
                      >
                        {veh.latestStatus || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Status Banner */}
            <div
              className={`repair-status-banner ${
                activeVehicle.latestStatus === "Completed"
                  ? "status-banner-completed"
                  : activeVehicle.latestStatus === "In Progress"
                  ? "status-banner-inprogress"
                  : "status-banner-pending"
              }`}
            >
              <div className="banner-left-info">
                <div className="banner-icon-bubble">
                  {activeVehicle.latestStatus === "Completed" ? (
                    <CheckCircle2 size={32} />
                  ) : activeVehicle.latestStatus === "In Progress" ? (
                    <Wrench size={32} />
                  ) : (
                    <Clock3 size={32} />
                  )}
                </div>
                <div>
                  <div className="banner-badge">
                    {activeVehicle.latestStatus === "Completed"
                      ? "READY FOR PICKUP"
                      : activeVehicle.latestStatus === "In Progress"
                      ? "ACTIVE WORK IN PROGRESS"
                      : "SERVICE QUEUED"}
                  </div>
                  <h2 className="banner-main-title">
                    {activeVehicle.latestStatus === "Completed"
                      ? "Your vehicle repair is Completed!"
                      : activeVehicle.latestStatus === "In Progress"
                      ? "Your vehicle repair is In Progress"
                      : "Your vehicle is Awaiting Service"}
                  </h2>
                  <p className="banner-desc">
                    {activeVehicle.latestStatus === "Completed"
                      ? "All diagnostic checks, component installations, and road safety tests have concluded. Your vehicle is ready for pickup at our workshop bay."
                      : activeVehicle.latestStatus === "In Progress"
                      ? "Our mechanics are currently servicing your vehicle on the lift. All work orders are proceeding on schedule."
                      : "Your vehicle ticket has been received and entered into our queue. A service technician will begin work shortly."}
                  </p>
                </div>
              </div>

              <div className="banner-right-plate">
                <span className="plate-label">AUTHENTICATED VEHICLE</span>
                <span className="plate-number-display">
                  <CarFront size={16} />
                  {activeVehicle.vehicleNumber}
                </span>
              </div>
            </div>

            {/* Repair Progress Stepper */}
            <div className="repair-stepper-card">
              <h3 className="stepper-title">Live Repair Workflow Progress</h3>
              <div className="stepper-track">
                {/* Step 1 */}
                <div className={`stepper-step ${stage >= 1 ? "completed" : ""}`}>
                  <div className="step-circle">
                    {stage > 1 ? <CheckCircle2 size={16} /> : "1"}
                  </div>
                  <div className="step-label-group">
                    <span className="step-name">Job Received</span>
                    <span className="step-sub">Logged in garage bay</span>
                  </div>
                </div>

                <div className={`stepper-line ${stage >= 2 ? "active" : ""}`}></div>

                {/* Step 2 */}
                <div
                  className={`stepper-step ${
                    stage > 2 ? "completed" : stage === 2 ? "active" : ""
                  }`}
                >
                  <div className="step-circle">
                    {stage > 2 ? (
                      <CheckCircle2 size={16} />
                    ) : stage === 2 ? (
                      <Wrench size={16} className="spin-slow" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <div className="step-label-group">
                    <span className="step-name">Repair In Progress</span>
                    <span className="step-sub">Active servicing</span>
                  </div>
                </div>

                <div className={`stepper-line ${stage >= 3 ? "active" : ""}`}></div>

                {/* Step 3 */}
                <div className={`stepper-step ${stage === 3 ? "completed" : ""}`}>
                  <div className="step-circle">
                    {stage === 3 ? <CheckCircle2 size={16} /> : "3"}
                  </div>
                  <div className="step-label-group">
                    <span className="step-name">Ready for Pickup</span>
                    <span className="step-sub">Quality verified & tested</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Customer Specifications Grid */}
            <div className="vehicle-info-grid">
              <div className="info-box">
                <span className="info-box-label">
                  <CarFront size={14} /> Registered Model
                </span>
                <strong className="info-box-value">
                  {activeVehicle.model || "Standard Variant"}
                </strong>
                <span className="info-box-sub">
                  Category: {activeVehicle.vehicleType || "Vehicle"}
                </span>
              </div>

              <div className="info-box">
                <span className="info-box-label">
                  <User size={14} /> Owner Name
                </span>
                <strong className="info-box-value">
                  {activeVehicle.customerName || authenticatedUser?.name || "Customer"}
                </strong>
                <span className="info-box-sub">Verified Owner</span>
              </div>

              <div className="info-box">
                <span className="info-box-label">
                  <Calendar size={14} /> Registration Year
                </span>
                <strong className="info-box-value">
                  {activeVehicle.registrationYear || "N/A"}
                </strong>
                <span className="info-box-sub">Manufacturing Record</span>
              </div>

              <div className="info-box">
                <span className="info-box-label">
                  <Wrench size={14} /> Total Services Logged
                </span>
                <strong className="info-box-value">
                  {activeVehicle.services?.length || 0}
                </strong>
                <span className="info-box-sub">Recorded Invoices</span>
              </div>
            </div>

            {/* Detailed Services Table (Unlocked via Email Verification) */}
            <div className="portal-service-history-card">
              <div className="portal-card-header">
                <div className="card-header-left">
                  <Wrench size={18} className="text-primary-600" />
                  <div>
                    <h3>Service Orders & Repair Log</h3>
                    <p>Itemized maintenance checks, technician notes, and billed costs</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="print-receipt-btn"
                  title="Print official work voucher"
                >
                  <Printer size={15} />
                  <span>Print Service Voucher</span>
                </button>
              </div>

              {(!activeVehicle.services || activeVehicle.services.length === 0) ? (
                <div className="empty-state">
                  <Wrench size={32} />
                  <p>No active service items logged for this vehicle.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Service Performed</th>
                        <th>Serviced Date</th>
                        <th>Technician Notes & Diagnostics</th>
                        <th>Amount</th>
                        <th>Repair Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVehicle.services.map((service, index) => (
                        <tr key={service._id || index}>
                          <td className="index-cell">{index + 1}</td>
                          <td>
                            <strong className="service-title-text">
                              {service.serviceName}
                            </strong>
                          </td>
                          <td className="date-cell">
                            {new Date(service.serviceDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="service-notes-cell">
                            {service.description || "Routine maintenance and inspection completed."}
                          </td>
                          <td className="amount-cell">
                            ₹{Number(service.serviceCost).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${service.serviceStatus
                                ?.toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              <span className="status-dot-sm"></span>
                              {service.serviceStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Support Contact Help Banner */}
            <div className="portal-support-banner">
              <div className="support-banner-content">
                <Phone size={20} className="support-phone-icon" />
                <div>
                  <h4>Need assistance or have questions regarding your vehicle?</h4>
                  <p>Our workshop advisors are available 9:00 AM – 7:00 PM to help you.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="search-again-btn"
              >
                <span>Back to Top</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* Informational Guidance (When no search performed yet and not verified) */}
        {!isVerified && !verificationPending && (
          <section className="portal-guide-section">
            <h2 className="guide-title">How Email Verification Protects Your Data</h2>
            <div className="guide-grid">
              <div className="guide-card">
                <div className="guide-num">01</div>
                <div className="guide-icon-wrap">
                  <Mail size={24} />
                </div>
                <h3>Secure Resend OTP</h3>
                <p>
                  Enter your registered vehicle plate or customer email to receive a secure 6-digit one-time password in your inbox.
                </p>
              </div>

              <div className="guide-card">
                <div className="guide-num">02</div>
                <div className="guide-icon-wrap">
                  <ShieldCheck size={24} />
                </div>
                <h3>Verify Identity</h3>
                <p>
                  Confirm the code to unlock your confidential vehicle service invoices, technician diagnostic logs, and billing history.
                </p>
              </div>

              <div className="guide-card">
                <div className="guide-num">03</div>
                <div className="guide-icon-wrap">
                  <Wrench size={24} />
                </div>
                <h3>Live Status & Invoices</h3>
                <p>
                  Follow your repair stages from Inspection to Pickup and instantly print official service vouchers with a single click.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <p>© 2026 AutoFlow Vehicle Service Management • Powered by Resend Email Authentication.</p>
      </footer>
    </div>
  );
}

export default UserDashboard;
