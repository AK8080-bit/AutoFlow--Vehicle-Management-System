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
  Mail,
  RotateCcw,
  FileText,
  Ticket,
  QrCode,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Helper: Convert numbers to Indian currency words
function numberToWords(num) {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
  };

  let str = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  const rem = num % 100;

  if (crore) str += inWords(crore) + " Crore ";
  if (lakh) str += inWords(lakh) + " Lakh ";
  if (thousand) str += inWords(thousand) + " Thousand ";
  if (hundred) str += inWords(hundred) + " Hundred ";
  if (rem) str += (str ? "and " : "") + inWords(rem) + " ";

  return str.trim() + " Rupees Only";
}

function UserDashboard() {
  const { theme, toggleTheme } = useTheme();

  // Search Mode: "plate" or "email"
  const [searchMode, setSearchMode] = useState("plate");

  // Inputs
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search Results
  const [hasSearched, setHasSearched] = useState(false);
  const [userVehicles, setUserVehicles] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  // Print Mode & Modal State ("bill" | "token") - Only ONE unified modal
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [activePrintFormat, setActivePrintFormat] = useState("bill");

  // Load recent searches on mount
  useEffect(() => {
    try {
      const savedSearches = JSON.parse(
        localStorage.getItem("recent_vehicle_searches") || "[]"
      );
      setRecentSearches(savedSearches);
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter((p) => p !== query)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("recent_vehicle_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Track by Vehicle License Plate
  const handlePlateSearch = async (plateToSearch) => {
    const query = (plateToSearch || vehicleNumber).trim().toUpperCase();
    if (!query) {
      setError("Please enter a vehicle license plate number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const trackRes = await API.get(`/services/track/${query}`);
      const trackData = trackRes.data;

      const vehicleObj = {
        vehicleNumber: trackData.vehicleNumber,
        model: trackData.vehicle?.model || "Registered Model",
        vehicleType: trackData.vehicle?.vehicleType || "Vehicle",
        customerName: trackData.vehicle?.customerName || "Customer",
        customerEmail: trackData.vehicle?.customerEmail || "",
        registrationYear: trackData.vehicle?.registrationYear || "N/A",
        latestStatus: trackData.latestStatus || "Pending",
        services: trackData.services || [],
        latestService: trackData.latestService || null,
      };

      setUserVehicles([vehicleObj]);
      setSelectedVehicleIndex(0);
      setCustomerInfo({
        name: vehicleObj.customerName,
        email: vehicleObj.customerEmail,
      });
      setHasSearched(true);
      saveRecentSearch(query);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No vehicle record found for "${query}". Please verify the plate number or contact our garage desk.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Find Vehicles by Registered Email
  const handleEmailSearch = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid registered customer email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await API.get(`/user-auth/by-email/${cleanEmail}`);
      if (res.data.success && res.data.vehicles && res.data.vehicles.length > 0) {
        setUserVehicles(res.data.vehicles);
        setSelectedVehicleIndex(0);
        setCustomerInfo(res.data.customer);
        setHasSearched(true);
        saveRecentSearch(cleanEmail);
      } else {
        setError(`No vehicles registered under "${cleanEmail}".`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No vehicle records found for "${cleanEmail}". Please check your email or track by vehicle license plate.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset Search
  const handleClearSearch = () => {
    setHasSearched(false);
    setUserVehicles([]);
    setCustomerInfo(null);
    setSelectedVehicleIndex(0);
    setError("");
  };

  // Trigger Print Directly
  const triggerPrint = (format = "bill") => {
    setActivePrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Currently active vehicle
  const activeVehicle = userVehicles[selectedVehicleIndex] || userVehicles[0] || null;

  // Determine stage number for progress stepper
  const getStageNumber = () => {
    if (!activeVehicle) return 1;
    if (activeVehicle.latestStatus === "Completed") return 3;
    if (activeVehicle.latestStatus === "In Progress") return 2;
    return 1;
  };

  const stage = getStageNumber();

  // Financial calculations for bill
  const servicesList = activeVehicle?.services || [];
  const rawSubtotal = servicesList.reduce((acc, s) => acc + (Number(s.serviceCost) || 0), 0);
  const baseSubtotal = rawSubtotal > 0 ? rawSubtotal : 1200;
  const cgst = Math.round(baseSubtotal * 0.09);
  const sgst = Math.round(baseSubtotal * 0.09);
  const totalTax = cgst + sgst;
  const grandTotal = baseSubtotal + totalTax;
  const amountInWords = numberToWords(grandTotal);

  // Invoice & Token numbers
  const cleanPlateForCode = (activeVehicle?.vehicleNumber || "MH0000").replace(/[^a-zA-Z0-9]/g, "");
  const invoiceNumber = `INV-AF-2026-${cleanPlateForCode.slice(-4) || "8901"}`;
  const tokenNumber = `AF-${cleanPlateForCode.slice(-4) || "104"}`;
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const issueTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
            <span className="brand-tag hide-on-mobile">Customer Care & Repair Hub</span>
          </div>
        </div>

        <div className="portal-nav-actions">
          {hasSearched && (
            <button
              type="button"
              className="plate-chip-btn hide-on-mobile"
              onClick={handleClearSearch}
              title="Track another vehicle"
            >
              <RotateCcw size={14} />
              <span>Track Another</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-slate-600" />
            )}
          </button>

          <div className="system-pill hide-on-mobile">
            <span className="system-status-dot"></span>
            <span className="system-status-text">Workshop Live</span>
          </div>

          <Link to="/login" className="admin-login-link">
            <Lock size={14} />
            <span className="admin-btn-text">Admin Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Portal Container */}
      <main className="user-portal-container">
        {/* Search Hero Section (when not searched yet) */}
        {!hasSearched ? (
          <section className="portal-hero">
            <div className="hero-pill-badge">
              <Sparkles size={13} className="text-amber-400" />
              <span>Live Vehicle Service Portal</span>
            </div>

            <h1 className="portal-hero-title">
              Track Your Vehicle Repair Progress
            </h1>
            <p className="portal-hero-subtitle">
              Enter your vehicle license plate or customer email to view live mechanic diagnostic updates, repair workflow stages, and official documentation.
            </p>

            {/* Search Mode Switcher Tabs */}
            <div className="auth-switch-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${searchMode === "plate" ? "active" : ""}`}
                onClick={() => {
                  setSearchMode("plate");
                  setError("");
                }}
              >
                <CarFront size={16} />
                <span>Track by License Plate</span>
              </button>

              <button
                type="button"
                className={`auth-tab-btn ${searchMode === "email" ? "active" : ""}`}
                onClick={() => {
                  setSearchMode("email");
                  setError("");
                }}
              >
                <Mail size={16} />
                <span>Find by Customer Email</span>
              </button>
            </div>

            {/* Mode 1: Search by License Plate */}
            {searchMode === "plate" && (
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
                    maxLength="14"
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
                      <span>Checking Bay Status...</span>
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

            {/* Mode 2: Search by Email */}
            {searchMode === "email" && (
              <form onSubmit={handleEmailSearch} className="vehicle-search-card">
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
                      <span>Searching Records...</span>
                    </>
                  ) : (
                    <>
                      <Search size={17} />
                      <span>Find Records</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="recent-chips-row">
                <span className="recent-chips-label">Recent Searches:</span>
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (item.includes("@")) {
                        setEmailInput(item);
                        setSearchMode("email");
                        (async () => {
                          setLoading(true);
                          setError("");
                          try {
                            const res = await API.get(`/user-auth/by-email/${item.toLowerCase()}`);
                            if (res.data.success && res.data.vehicles?.length > 0) {
                              setUserVehicles(res.data.vehicles);
                              setSelectedVehicleIndex(0);
                              setCustomerInfo(res.data.customer);
                              setHasSearched(true);
                            }
                          } catch (err) {
                            setError(err.response?.data?.message || `No records found for ${item}`);
                          } finally {
                            setLoading(false);
                          }
                        })();
                      } else {
                        setVehicleNumber(item);
                        setSearchMode("plate");
                        handlePlateSearch(item);
                      }
                    }}
                    className="plate-chip-btn"
                  >
                    {item.includes("@") ? <Mail size={12} /> : <CarFront size={12} />}
                    <span>{item}</span>
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
        ) : (
          /* =========================================================================
              RESULTS TOP ACTION BAR: ONLY ONE SINGLE PRINT BUTTON HERE!
             ========================================================================= */
          <div className="results-top-bar">
            <div className="results-top-left">
              <button
                type="button"
                onClick={handleClearSearch}
                className="search-again-pill-btn"
              >
                <RotateCcw size={14} />
                <span>Track Another Vehicle</span>
              </button>

              {customerInfo && (
                <span className="active-customer-tag">
                  Customer: <strong>{customerInfo.name || "Vehicle Owner"}</strong>
                  {customerInfo.email && ` • ${customerInfo.email}`}
                </span>
              )}
            </div>

            {/* ONLY ONE SINGLE PRINT OPTION IN THE ENTIRE USER INTERFACE */}
            <div className="print-action-single-container">
              <button
                type="button"
                onClick={() => setPrintModalOpen(true)}
                className="print-single-action-btn"
                title="Print Official Tax Invoice or Job Token Gate Pass"
              >
                <Printer size={16} />
                <span>Print Documents</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VEHICLE STATUS & REPAIR LOGS SECTION
           ========================================================================= */}
        {hasSearched && activeVehicle && (
          <section className="repair-status-result-section">
            {/* Multi-Vehicle Picker if customer owns more than 1 vehicle */}
            {userVehicles.length > 1 && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "10px" }} className="section-title-themed">
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
                <span className="plate-label">VEHICLE PLATE</span>
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
                  {activeVehicle.customerName || customerInfo?.name || "Customer"}
                </strong>
                <span className="info-box-sub">Vehicle Owner</span>
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
                  {servicesList.length}
                </strong>
                <span className="info-box-sub">Recorded Operations</span>
              </div>
            </div>

            {/* Detailed Services Table (Print button removed here to keep only 1 print option) */}
            <div className="portal-service-history-card">
              <div className="portal-card-header">
                <div className="card-header-left">
                  <Wrench size={18} className="text-primary-600" />
                  <div>
                    <h3>Service Orders & Repair Log</h3>
                    <p>Itemized maintenance checks, technician notes, and billed costs</p>
                  </div>
                </div>
              </div>

              {servicesList.length === 0 ? (
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
                      {servicesList.map((service, index) => (
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

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-again-btn"
                >
                  <span>Track Another Vehicle</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Informational Guidance (When no search performed yet) */}
        {!hasSearched && (
          <section className="portal-guide-section">
            <h2 className="guide-title">How To Track Your Vehicle Progress</h2>
            <div className="guide-grid">
              <div className="guide-card">
                <div className="guide-num">01</div>
                <div className="guide-icon-wrap">
                  <CarFront size={24} />
                </div>
                <h3>Instant Search</h3>
                <p>
                  Enter your registered vehicle plate number or customer email to immediately view real-time garage bay updates.
                </p>
              </div>

              <div className="guide-card">
                <div className="guide-num">02</div>
                <div className="guide-icon-wrap">
                  <Wrench size={24} />
                </div>
                <h3>Live Bay Progress</h3>
                <p>
                  Follow your vehicle repair stages from Job Received to Active Servicing and Ready for Pickup in real time.
                </p>
              </div>

              <div className="guide-card">
                <div className="guide-num">03</div>
                <div className="guide-icon-wrap">
                  <Printer size={24} />
                </div>
                <h3>Bill & Token Printing</h3>
                <p>
                  Print authentic tax invoices with GST breakdown, or generate compact service gate pass tokens anytime.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <p>© 2026 AutoFlow Vehicle Service Management • Live Customer Repair Tracking Hub.</p>
      </footer>

      {/* =========================================================================
          PRINT PREVIEW & OPTIONS MODAL (Unified Modal with Tax Bill & Token Tabs)
         ========================================================================= */}
      {printModalOpen && activeVehicle && (
        <div className="print-modal-overlay" onClick={() => setPrintModalOpen(false)}>
          <div className="print-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header">
              <div className="modal-title-group">
                <Printer size={20} className="text-primary-600" />
                <div>
                  <h3>Print Options & Document Preview</h3>
                  <p>Choose your document format: Tax Bill or Job Token</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPrintModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Type Switcher */}
            <div className="print-format-toggle-bar">
              <button
                type="button"
                className={`format-toggle-btn ${activePrintFormat === "bill" ? "active" : ""}`}
                onClick={() => setActivePrintFormat("bill")}
              >
                <FileText size={16} />
                <span>Tax Bill / Invoice (A4)</span>
              </button>
              <button
                type="button"
                className={`format-toggle-btn ${activePrintFormat === "token" ? "active" : ""}`}
                onClick={() => setActivePrintFormat("token")}
              >
                <Ticket size={16} />
                <span>Job Token / Gate Pass</span>
              </button>
            </div>

            {/* In-Modal Mini Preview */}
            <div className="modal-preview-viewport">
              {activePrintFormat === "bill" ? (
                <div className="mini-preview-card invoice-style">
                  <div className="preview-stamp">TAX INVOICE</div>
                  <div className="preview-header-row">
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "var(--slate-900)" }}>AutoFlow Workshop & Service Care</h4>
                      <p style={{ margin: "2px 0", fontSize: "11px", color: "var(--slate-500)" }}>GSTIN: 27AAACA1234A1Z5 • Pune, MH</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "13px", color: "#0284c7" }}>{invoiceNumber}</strong>
                      <div style={{ fontSize: "11px", color: "var(--slate-500)" }}>Date: {issueDate}</div>
                    </div>
                  </div>

                  <div className="preview-meta-grid">
                    <div>
                      <span className="preview-label">BILL TO CUSTOMER</span>
                      <strong>{activeVehicle.customerName || "Customer"}</strong>
                      <div>{activeVehicle.customerEmail || "customer@example.com"}</div>
                    </div>
                    <div>
                      <span className="preview-label">VEHICLE DETAILS</span>
                      <strong style={{ color: "#2563eb" }}>{activeVehicle.vehicleNumber}</strong>
                      <div>{activeVehicle.model} ({activeVehicle.vehicleType})</div>
                    </div>
                  </div>

                  <table className="mini-preview-table">
                    <thead>
                      <tr>
                        <th>Service Description</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicesList.length > 0 ? (
                        servicesList.map((s, i) => (
                          <tr key={i}>
                            <td>{s.serviceName}</td>
                            <td style={{ textAlign: "right" }}>₹{Number(s.serviceCost).toLocaleString("en-IN")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td>Vehicle Comprehensive Diagnostic & Multi-point Inspection</td>
                          <td style={{ textAlign: "right" }}>₹1,200</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="preview-total-summary">
                    <div>Subtotal: ₹{baseSubtotal.toLocaleString("en-IN")}</div>
                    <div>Total GST (CGST 9% + SGST 9%): ₹{totalTax.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--slate-900)", marginTop: "4px" }}>
                      Grand Total: ₹{grandTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mini-preview-card token-style">
                  <div className="token-slip-header">
                    <Wrench size={18} />
                    <span>AutoFlow Workshop Gate Pass</span>
                  </div>
                  <div className="token-number-badge">
                    <span className="token-prefix">QUEUE PASS</span>
                    <span className="token-digits">{tokenNumber}</span>
                  </div>
                  <div className="token-plate-box">
                    <CarFront size={18} />
                    <span>{activeVehicle.vehicleNumber}</span>
                  </div>
                  <div className="token-meta-lines">
                    <div>Model: <strong>{activeVehicle.model}</strong></div>
                    <div>Owner: <strong>{activeVehicle.customerName}</strong></div>
                    <div>Stage: <strong style={{ color: "#059669" }}>{activeVehicle.latestStatus || "Queued"}</strong></div>
                    <div>Check-in: {issueDate} • {issueTime}</div>
                    <div>Bay: <strong>Bay 02 - Active Service Bay</strong></div>
                  </div>
                  <div className="token-qr-visual">
                    <QrCode size={42} />
                    <span>Scan at Dispatch Counter</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="print-modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setPrintModalOpen(false)}
              >
                Close Preview
              </button>

              <button
                type="button"
                className="modal-print-btn"
                onClick={() => {
                  setPrintModalOpen(false);
                  triggerPrint(activePrintFormat);
                }}
              >
                <Printer size={16} />
                <span>
                  Print {activePrintFormat === "bill" ? "Tax Invoice (A4)" : "Job Token (Slip)"} Now
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DEDICATED PRINTABLE DOCUMENTS (Rendered solely for browser @media print)
         ========================================================================= */}
      {activeVehicle && (
        <div id="printable-document" className={`print-container ${activePrintFormat}`}>
          {/* ========================================
              DOCUMENT 1: OFFICIAL TAX INVOICE & BILL
             ======================================== */}
          {activePrintFormat === "bill" && (
            <div id="printable-bill" className="tax-invoice-sheet">
              {/* Invoice Header */}
              <div className="bill-header">
                <div className="bill-brand">
                  <div className="bill-brand-badge">
                    <span>AutoFlow</span>
                  </div>
                  <div className="bill-brand-info">
                    <h2>AutoFlow Automotive Services & Garage Hub</h2>
                    <p className="bill-tagline">Multi-brand Car & Bike Precision Repair Centre</p>
                    <p className="bill-legal">
                      GSTIN: <strong>27AAACA1234A1Z5</strong> • Reg No: MH-AF-2026-9081 • State Code: 27
                    </p>
                    <p className="bill-address">
                      Central Automobile Complex, Bay #4, Workshop Avenue, Pune, MH - 411045
                    </p>
                    <p className="bill-contact">
                      Helpline: +91 98765 43210 • Email: billing@autoflow.work • Web: www.autoflow.work
                    </p>
                  </div>
                </div>

                <div className="bill-meta-box">
                  <div className="bill-meta-title">TAX INVOICE</div>
                  <div className="bill-meta-row">
                    <span>Invoice No:</span>
                    <strong>{invoiceNumber}</strong>
                  </div>
                  <div className="bill-meta-row">
                    <span>Date of Issue:</span>
                    <span>{issueDate}</span>
                  </div>
                  <div className="bill-meta-row">
                    <span>Place of Supply:</span>
                    <span>Maharashtra (27)</span>
                  </div>
                  <div className="bill-meta-row">
                    <span>Payment Mode:</span>
                    <span>UPI / Online / Bay Cash</span>
                  </div>
                  <div className="bill-status-stamp">
                    {activeVehicle.latestStatus === "Completed" ? "PAID" : "SERVICE WORK ORDER"}
                  </div>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="bill-parties-grid">
                {/* Customer Particulars */}
                <div className="party-box customer-party">
                  <div className="party-box-title">BILL TO (CUSTOMER PARTICULARS)</div>
                  <table className="mini-details-table">
                    <tbody>
                      <tr>
                        <td>Customer Name:</td>
                        <td><strong>{activeVehicle.customerName || customerInfo?.name || "Customer"}</strong></td>
                      </tr>
                      <tr>
                        <td>Contact Phone:</td>
                        <td>{customerInfo?.phone || "+91 98220 12345 (On File)"}</td>
                      </tr>
                      <tr>
                        <td>Email Address:</td>
                        <td>{activeVehicle.customerEmail || customerInfo?.email || "customer@example.com"}</td>
                      </tr>
                      <tr>
                        <td>Billing Address:</td>
                        <td>Registered Customer On File, Workshop Region</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Vehicle Particulars */}
                <div className="party-box vehicle-party">
                  <div className="party-box-title">VEHICLE PARTICULARS & JOB CARD</div>
                  <table className="mini-details-table">
                    <tbody>
                      <tr>
                        <td>Vehicle License Plate:</td>
                        <td>
                          <span className="bill-plate-badge">
                            {activeVehicle.vehicleNumber}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Make / Model:</td>
                        <td><strong>{activeVehicle.model}</strong></td>
                      </tr>
                      <tr>
                        <td>Category / Type:</td>
                        <td>{activeVehicle.vehicleType || "Four-Wheeler / Car"}</td>
                      </tr>
                      <tr>
                        <td>Manufacturing Year:</td>
                        <td>{activeVehicle.registrationYear || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Service Bay:</td>
                        <td>Bay 02 - Active Mechanical Lift</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Itemized Services Table */}
              <div className="bill-table-wrap">
                <table className="bill-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Service Operation / Parts Replaced & Diagnostics</th>
                      <th style={{ width: "90px" }}>HSN / SAC</th>
                      <th style={{ width: "60px", textAlign: "center" }}>Qty</th>
                      <th style={{ width: "100px", textAlign: "right" }}>Rate (₹)</th>
                      <th style={{ width: "110px", textAlign: "right" }}>Taxable Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicesList.length > 0 ? (
                      servicesList.map((service, idx) => (
                        <tr key={service._id || idx}>
                          <td style={{ textAlign: "center" }}>{idx + 1}</td>
                          <td>
                            <strong>{service.serviceName}</strong>
                            <div className="bill-sub-desc">
                              {service.description || "Routine maintenance, torque checks, and multi-point road diagnostics."}
                            </div>
                          </td>
                          <td>998729</td>
                          <td style={{ textAlign: "center" }}>1</td>
                          <td style={{ textAlign: "right" }}>
                            ₹{Number(service.serviceCost).toLocaleString("en-IN")}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            ₹{Number(service.serviceCost).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={{ textAlign: "center" }}>1</td>
                        <td>
                          <strong>Comprehensive Multi-Point Vehicle Safety & Diagnostic Inspection</strong>
                          <div className="bill-sub-desc">
                            Complete brake test, fluid level checks, electrical scanning, and suspension test.
                          </div>
                        </td>
                        <td>998729</td>
                        <td style={{ textAlign: "center" }}>1</td>
                        <td style={{ textAlign: "right" }}>₹1,200</td>
                        <td style={{ textAlign: "right" }}>₹1,200</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="bill-calculation-row">
                <div className="bill-words-wrap">
                  <div className="words-title">AMOUNT IN WORDS:</div>
                  <div className="words-content">
                    <strong>{amountInWords}</strong>
                  </div>

                  <div className="bill-bank-details">
                    <div><strong>Bank Details for Remittance:</strong></div>
                    <div>Bank Name: HDFC Bank • Branch: Central Pune</div>
                    <div>A/C Name: AutoFlow Workshop Pvt Ltd</div>
                    <div>A/C No: 50200089123456 • IFSC: HDFC0001234</div>
                  </div>
                </div>

                <div className="bill-totals-wrap">
                  <table className="totals-table">
                    <tbody>
                      <tr>
                        <td>Total Taxable Value:</td>
                        <td style={{ textAlign: "right" }}>₹{baseSubtotal.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td>CGST @ 9%:</td>
                        <td style={{ textAlign: "right" }}>₹{cgst.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td>SGST @ 9%:</td>
                        <td style={{ textAlign: "right" }}>₹{sgst.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td>Total Tax Amount (18%):</td>
                        <td style={{ textAlign: "right" }}>₹{totalTax.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr className="grand-total-row">
                        <td><strong>Grand Total (INR):</strong></td>
                        <td style={{ textAlign: "right" }}>
                          <strong className="grand-price">₹{grandTotal.toLocaleString("en-IN")}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms and Signatures */}
              <div className="bill-footer-section">
                <div className="bill-terms">
                  <div className="terms-heading">TERMS & CONDITIONS:</div>
                  <ol>
                    <li>All mechanical components & workmanship carry a 30-day / 1,000 km workshop warranty.</li>
                    <li>Vehicle released only upon confirmation of full payment / authorized company voucher.</li>
                    <li>Not responsible for personal items left in the vehicle during servicing.</li>
                  </ol>
                </div>

                <div className="bill-signature-block">
                  <div className="seal-stamp-box">
                    <span>AutoFlow Official Workshop Seal</span>
                  </div>
                  <div className="signature-line">
                    <span>Authorized Workshop Manager</span>
                  </div>
                </div>
              </div>

              <div className="bill-bottom-footnote">
                This is a computer-generated tax invoice verified under AutoFlow Automotive Management System.
              </div>
            </div>
          )}

          {/* ========================================
              DOCUMENT 2: SERVICE JOB TOKEN & GATE PASS
             ======================================== */}
          {activePrintFormat === "token" && (
            <div id="printable-token" className="service-token-sheet">
              <div className="token-slip-card">
                {/* Token Slip Header */}
                <div className="token-top-bar">
                  <div className="token-brand-name">
                    Auto<span>Flow</span>
                  </div>
                  <div className="token-type-pill">WORKSHOP GATE PASS & INTAKE TOKEN</div>
                </div>

                <div className="token-sub-address">
                  AutoFlow Service Hub • Bay Intake Desk #02 • Ph: +91 98765 43210
                </div>

                <div className="token-divider-dashed"></div>

                {/* Giant Token Code */}
                <div className="token-number-display">
                  <span className="token-sm-label">SERVICE TOKEN NO</span>
                  <div className="token-big-code">{tokenNumber}</div>
                </div>

                <div className="token-divider-dashed"></div>

                {/* Vehicle Plate Card */}
                <div className="token-plate-card">
                  <span className="plate-tag-sm">REGISTERED VEHICLE PLATE</span>
                  <div className="token-plate-val">{activeVehicle.vehicleNumber}</div>
                  <div className="token-model-sub">{activeVehicle.model} ({activeVehicle.vehicleType || "Vehicle"})</div>
                </div>

                {/* Meta details */}
                <div className="token-meta-table">
                  <div className="token-meta-row">
                    <span>Customer Name:</span>
                    <strong>{activeVehicle.customerName || "Customer"}</strong>
                  </div>
                  <div className="token-meta-row">
                    <span>Intake Date & Time:</span>
                    <span>{issueDate} • {issueTime}</span>
                  </div>
                  <div className="token-meta-row">
                    <span>Assigned Garage Bay:</span>
                    <strong>Bay 02 - Active Service Bay</strong>
                  </div>
                  <div className="token-meta-row">
                    <span>Current Workflow Stage:</span>
                    <strong style={{ color: "#047857" }}>{activeVehicle.latestStatus || "Queued"}</strong>
                  </div>
                  <div className="token-meta-row">
                    <span>Estimated Completion:</span>
                    <span>Same Day • 05:30 PM</span>
                  </div>
                </div>

                <div className="token-divider-dashed"></div>

                {/* Barcode & QR Visual */}
                <div className="token-barcode-wrap">
                  <svg className="barcode-svg" viewBox="0 0 200 40">
                    <rect x="5" y="0" width="3" height="40" fill="#000" />
                    <rect x="12" y="0" width="5" height="40" fill="#000" />
                    <rect x="22" y="0" width="2" height="40" fill="#000" />
                    <rect x="28" y="0" width="6" height="40" fill="#000" />
                    <rect x="38" y="0" width="3" height="40" fill="#000" />
                    <rect x="45" y="0" width="4" height="40" fill="#000" />
                    <rect x="55" y="0" width="2" height="40" fill="#000" />
                    <rect x="62" y="0" width="7" height="40" fill="#000" />
                    <rect x="74" y="0" width="3" height="40" fill="#000" />
                    <rect x="82" y="0" width="4" height="40" fill="#000" />
                    <rect x="92" y="0" width="2" height="40" fill="#000" />
                    <rect x="98" y="0" width="6" height="40" fill="#000" />
                    <rect x="108" y="0" width="3" height="40" fill="#000" />
                    <rect x="115" y="0" width="4" height="40" fill="#000" />
                    <rect x="124" y="0" width="2" height="40" fill="#000" />
                    <rect x="131" y="0" width="5" height="40" fill="#000" />
                    <rect x="141" y="0" width="3" height="40" fill="#000" />
                    <rect x="148" y="0" width="6" height="40" fill="#000" />
                    <rect x="159" y="0" width="2" height="40" fill="#000" />
                    <rect x="166" y="0" width="4" height="40" fill="#000" />
                    <rect x="175" y="0" width="3" height="40" fill="#000" />
                    <rect x="183" y="0" width="5" height="40" fill="#000" />
                    <rect x="193" y="0" width="2" height="40" fill="#000" />
                  </svg>
                  <div className="barcode-number">*{tokenNumber}*</div>
                </div>

                {/* Important Customer Instructions */}
                <div className="token-instructions">
                  <div className="instruction-title">GATE PASS INSTRUCTIONS:</div>
                  <ul>
                    <li>1. Retain this slip safely. It is required for vehicle key handover at the dispatch bay.</li>
                    <li>2. Track live mechanic bay status online anytime at <strong>autoflow.work/track</strong>.</li>
                    <li>3. Workshop Helpline: <strong>1800-AUTO-FLOW</strong> (Toll Free).</li>
                  </ul>
                </div>

                <div className="token-bottom-signature">
                  <div>Customer Signature</div>
                  <div>Bay Inspector Stamp</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
