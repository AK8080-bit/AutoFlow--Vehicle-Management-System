const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const UserOtp = require("../models/UserOtp");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

// Primary and fallback sender addresses
const PRIMARY_FROM = process.env.EMAIL_FROM || "AutoFlow Workshop <notifications@autoflow.freedynamicdns.net>";
const FALLBACK_FROM = process.env.FALLBACK_EMAIL_FROM || "AutoFlow Workshop <onboarding@resend.dev>";

// Helper to mask email for security (e.g., johndoe@gmail.com -> j***e@gmail.com)
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "your registered email";
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user.substring(0, 2)}***${user.slice(-1)}@${domain}`;
};

// Send OTP directly to email or vehicle owner's email
const sendOtp = async (req, res) => {
  try {
    const { email, vehicleNumber } = req.body;
    let targetEmail = "";
    let targetVehicle = null;

    if (vehicleNumber) {
      const cleanPlate = vehicleNumber.trim().toUpperCase();
      targetVehicle = await Vehicle.findOne({
        vehicleNumber: { $regex: new RegExp(`^${cleanPlate}$`, "i") },
      });

      if (!targetVehicle) {
        return res.status(404).json({
          success: false,
          message: `Vehicle "${cleanPlate}" is not registered in our system. Please verify the plate number or contact the garage desk.`,
        });
      }

      // Check if vehicle has customerEmail directly or lookup Customer by customerName
      if (targetVehicle.customerEmail) {
        targetEmail = targetVehicle.customerEmail.trim().toLowerCase();
      } else {
        const matchedCustomer = await Customer.findOne({
          name: { $regex: new RegExp(`^${targetVehicle.customerName.trim()}$`, "i") },
        });
        if (matchedCustomer && matchedCustomer.email) {
          targetEmail = matchedCustomer.email.trim().toLowerCase();
        }
      }

      if (!targetEmail) {
        return res.status(400).json({
          success: false,
          message: `No email address is registered on file for vehicle "${cleanPlate}". Please enter your registered email address below.`,
          requiresManualEmail: true,
        });
      }
    } else if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }
      targetEmail = cleanEmail;
    } else {
      return res.status(400).json({
        success: false,
        message: "Email or Vehicle Number is required.",
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous unverified OTP for this email
    await UserOtp.deleteMany({ email: targetEmail });

    // Store new OTP
    await UserOtp.create({
      email: targetEmail,
      otp,
      expiresAt,
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>AutoFlow Portal Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 580px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 10px 18px; margin-bottom: 12px;">
                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Auto<span style="color: #38bdf8;">Flow</span></span>
              </div>
              <h2 style="color: #f8fafc; margin: 0; font-size: 20px; font-weight: 600;">Customer Verification Code</h2>
              <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Secure access to your vehicle service records & invoices</p>
            </div>

            <!-- Content -->
            <div style="padding: 36px 32px; color: #334155; line-height: 1.6;">
              <p style="font-size: 15px; margin-top: 0;">Hello,</p>
              <p style="font-size: 15px; color: #475569;">
                We received a request to access vehicle repair and service records for <strong>${targetEmail}</strong>. Use the one-time code below to verify your email and unlock your data:
              </p>

              <!-- OTP Box -->
              <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; text-align: center; padding: 26px 20px; margin: 28px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">Your Verification Code</div>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', Courier, monospace;">${otp}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 10px;">⏱ Valid for <strong>10 minutes</strong> only</div>
              </div>

              <p style="font-size: 13px; color: #64748b;">
                🔒 <strong>Security Notice:</strong> Never share this code with anyone. AutoFlow staff will never request your verification code. If you did not request this, please disregard this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">AutoFlow Vehicle Service Management • Domain: autoflow.freedynamicdns.net</p>
              <p style="margin: 4px 0 0 0;">This is an automated security verification email. Please do not reply directly.</p>
            </div>

          </div>
        </body>
      </html>
    `;

    // Send email directly via Resend (first trying domain sender, then fallback if DNS is propagating)
    let emailResponse = null;
    let senderUsed = PRIMARY_FROM;

    try {
      emailResponse = await resend.emails.send({
        from: PRIMARY_FROM,
        to: targetEmail,
        subject: `Your AutoFlow Verification Code: ${otp}`,
        html: emailHtml,
      });

      if (emailResponse.error) {
        console.warn(`[Resend Primary Domain Error]: ${emailResponse.error.message}, trying fallback sender...`);
        // If domain is pending verification, try fallback sender
        emailResponse = await resend.emails.send({
          from: FALLBACK_FROM,
          to: targetEmail,
          subject: `Your AutoFlow Verification Code: ${otp}`,
          html: emailHtml,
        });
        senderUsed = FALLBACK_FROM;
      }
    } catch (sendErr) {
      console.warn(`[Resend Exception with primary sender]: ${sendErr.message}, trying fallback sender...`);
      emailResponse = await resend.emails.send({
        from: FALLBACK_FROM,
        to: targetEmail,
        subject: `Your AutoFlow Verification Code: ${otp}`,
        html: emailHtml,
      });
      senderUsed = FALLBACK_FROM;
    }

    if (emailResponse.error) {
      console.error("[Resend Error]:", emailResponse.error);
      return res.status(500).json({
        success: false,
        message: `Failed to deliver email: ${emailResponse.error.message}`,
      });
    }

    console.log(`[Resend Success] Verification email dispatched to ${targetEmail} via ${senderUsed}`);

    const masked = maskEmail(targetEmail);

    return res.status(200).json({
      success: true,
      message: `Verification code successfully sent to ${masked}. Please check your inbox.`,
      maskedEmail: masked,
      email: targetEmail,
      expiresIn: 600,
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send verification code. Please try again.",
    });
  }
};

// Verify OTP and provide authenticated session token + user data
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, vehicleNumber } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Find valid OTP record
    const record = await UserOtp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please request a new code.",
      });
    }

    // Mark as verified and clean up
    await UserOtp.deleteMany({ email: cleanEmail });

    // Generate authenticated JWT token for the user session (valid for 7 days)
    const token = jwt.sign(
      { email: cleanEmail, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Fetch customer details by email
    const customer = await Customer.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    // Fetch vehicles associated with this email or customer name
    let vehicles = [];
    if (customer) {
      vehicles = await Vehicle.find({
        $or: [
          { customerEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") } },
          { customerName: { $regex: new RegExp(`^${customer.name}$`, "i") } },
          { customerId: customer._id },
        ],
      });
    } else {
      vehicles = await Vehicle.find({
        customerEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
      });
    }

    // If a specific vehicleNumber was provided, ensure it is included
    if (vehicleNumber) {
      const cleanPlate = vehicleNumber.trim().toUpperCase();
      const specificVehicle = await Vehicle.findOne({
        vehicleNumber: { $regex: new RegExp(`^${cleanPlate}$`, "i") },
      });
      if (
        specificVehicle &&
        !vehicles.some((v) => v.vehicleNumber === specificVehicle.vehicleNumber)
      ) {
        vehicles.push(specificVehicle);
      }
    }

    // Attach latest service status for each vehicle
    const vehicleListWithServices = await Promise.all(
      vehicles.map(async (v) => {
        const services = await Service.find({
          vehicleNumber: { $regex: new RegExp(`^${v.vehicleNumber}$`, "i") },
        }).sort({ serviceDate: -1, createdAt: -1 });

        return {
          ...v.toObject(),
          services,
          latestService: services.length > 0 ? services[0] : null,
          latestStatus: services.length > 0 ? services[0].serviceStatus : "Pending",
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Full access granted to your service records.",
      token,
      email: cleanEmail,
      customer: customer || {
        name: vehicles.length > 0 ? vehicles[0].customerName : "Valued Customer",
        email: cleanEmail,
      },
      vehicles: vehicleListWithServices,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Verification failed. Please try again.",
    });
  }
};

// Fetch verified user's data (vehicles + service records) using JWT token
const getMyVerifiedData = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    const customer = await Customer.findOne({
      email: { $regex: new RegExp(`^${userEmail}$`, "i") },
    });

    let vehicles = [];
    if (customer) {
      vehicles = await Vehicle.find({
        $or: [
          { customerEmail: { $regex: new RegExp(`^${userEmail}$`, "i") } },
          { customerName: { $regex: new RegExp(`^${customer.name}$`, "i") } },
          { customerId: customer._id },
        ],
      });
    } else {
      vehicles = await Vehicle.find({
        customerEmail: { $regex: new RegExp(`^${userEmail}$`, "i") },
      });
    }

    const vehicleListWithServices = await Promise.all(
      vehicles.map(async (v) => {
        const services = await Service.find({
          vehicleNumber: { $regex: new RegExp(`^${v.vehicleNumber}$`, "i") },
        }).sort({ serviceDate: -1, createdAt: -1 });

        return {
          ...v.toObject(),
          services,
          latestService: services.length > 0 ? services[0] : null,
          latestStatus: services.length > 0 ? services[0].serviceStatus : "Pending",
        };
      })
    );

    return res.status(200).json({
      success: true,
      customer: customer || {
        name: vehicles.length > 0 ? vehicles[0].customerName : "Valued Customer",
        email: userEmail,
      },
      vehicles: vehicleListWithServices,
    });
  } catch (error) {
    console.error("getMyVerifiedData error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user data.",
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMyVerifiedData,
};
