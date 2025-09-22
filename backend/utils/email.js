import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  // Check if we're using different email providers
  const isGmail = process.env.EMAIL_HOST === "smtp.gmail.com";
  const isOutlook =
    process.env.EMAIL_HOST === "smtp-mail.outlook.com" ||
    process.env.EMAIL_HOST === "smtp.office365.com";
  const isHostinger = process.env.EMAIL_HOST === "smtp.hostinger.com";

  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  // Add specific configurations for different providers
  if (isHostinger) {
    // Hostinger uses port 465 with SSL
    config.port = 465;
    config.secure = true;
  } else if (isOutlook) {
    config.auth.type = "login";
    config.tls = {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    };
  } else if (isGmail) {
    config.secure = false;
    config.requireTLS = true;
  }

  return nodemailer.createTransport(config);
};

// Send email function
export const sendEmail = async (options) => {
  // Check if email is configured
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "Email configuration is missing. Please configure EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env file."
    );
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `Chess Academy <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);

    // Provide helpful error messages based on error type
    if (error.code === "EAUTH") {
      console.error("❌ Email authentication failed!");
      console.error("Please check your email credentials in the .env file:");
      console.error("- EMAIL_USER should be your full email address");
      console.error("- EMAIL_PASS should be your email password");
      console.error("- For Hostinger: Use your domain email and password");

      // In development, provide more specific guidance
      if (process.env.NODE_ENV === "development") {
        console.error("💡 Development Tips:");
        console.error("1. Verify EMAIL_HOST=smtp.hostinger.com");
        console.error("2. Verify EMAIL_PORT=465");
        console.error("3. Verify EMAIL_SECURE=true");
        console.error("4. Verify EMAIL_USER=info@prathmesh9304.in");
        console.error("5. Verify your email password is correct");
      }
    } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      console.error("❌ Network connection error!");
      console.error("- Check your internet connection");
      console.error("- Verify SMTP server settings");
      console.error("- Check if firewall is blocking the connection");
    } else if (error.code === "EMESSAGE") {
      console.error("❌ Message format error!");
      console.error("- Check email content and formatting");
      console.error("- Verify recipient email address is valid");
    }

    // Re-throw the error so calling functions can handle it
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Generate random verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email change verification code
export const sendEmailChangeVerification = async (email, code, userName) => {
  console.log(`📧 EMAIL CHANGE VERIFICATION - Code: ${code} for ${email}`);
  const subject = "Chess Academy - Email Change Verification";
  const text = `
    Hi ${userName},

    You have requested to change your email address for your Chess Academy account.

    Your verification code is: ${code}

    This code will expire in 15 minutes.

    If you did not request this change, please ignore this email.

    Best regards,
    Chess Academy Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Chess Academy</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Email Change Verification</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
        
        <p style="color: #475569; line-height: 1.6;">
          You have requested to change your email address for your Chess Academy account.
        </p>
        
        <div style="background: white; border: 2px solid #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
          <h1 style="color: #0d9488; font-size: 32px; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">${code}</h1>
        </div>
        
        <p style="color: #ef4444; font-size: 14px; text-align: center; margin: 20px 0;">
          ⏰ This code will expire in 15 minutes
        </p>
        
        <p style="color: #475569; line-height: 1.6;">
          If you did not request this change, please ignore this email and your account will remain secure.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          Best regards,<br>
          <strong>Chess Academy Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

// Send password reset verification code
export const sendPasswordResetVerification = async (email, code, userName) => {
  console.log(`📧 PASSWORD RESET VERIFICATION - Code: ${code} for ${email}`);
  const subject = "Chess Academy - Password Reset Verification";
  const text = `
    Hi ${userName},

    You have requested to reset your password for your Chess Academy account.

    Your password reset code is: ${code}

    This code will expire in 15 minutes.

    If you did not request this reset, please ignore this email.

    Best regards,
    Chess Academy Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Chess Academy</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
        
        <p style="color: #475569; line-height: 1.6;">
          You have requested to reset your password for your Chess Academy account.
        </p>
        
        <div style="background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your password reset code is:</p>
          <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">${code}</h1>
        </div>
        
        <p style="color: #ef4444; font-size: 14px; text-align: center; margin: 20px 0;">
          ⏰ This code will expire in 15 minutes
        </p>
        
        <p style="color: #475569; line-height: 1.6;">
          If you did not request this password reset, please ignore this email and your account will remain secure.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          Best regards,<br>
          <strong>Chess Academy Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

// Send email change confirmation
export const sendEmailChangeConfirmation = async (
  oldEmail,
  newEmail,
  userName
) => {
  const subject = "Chess Academy - Email Address Changed";
  const text = `
    Hi ${userName},

    Your email address for your Chess Academy account has been successfully changed.

    Old email: ${oldEmail}
    New email: ${newEmail}

    If you did not make this change, please contact our support team immediately.

    Best regards,
    Chess Academy Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Chess Academy</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Email Address Changed</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
        
        <p style="color: #475569; line-height: 1.6;">
          Your email address for your Chess Academy account has been successfully changed.
        </p>
        
        <div style="background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">Email Change Details:</p>
          <div style="text-align: left;">
            <p style="margin: 5px 0; color: #475569;"><strong>Old email:</strong> ${oldEmail}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>New email:</strong> ${newEmail}</p>
          </div>
        </div>
        
        <p style="color: #ef4444; line-height: 1.6; background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
          <strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          Best regards,<br>
          <strong>Chess Academy Team</strong>
        </p>
      </div>
    </div>
  `;

  // Send to both old and new email addresses
  await sendEmail({
    to: oldEmail,
    subject,
    text,
    html,
  });

  await sendEmail({
    to: newEmail,
    subject,
    text,
    html,
  });
};

// Send password change confirmation
export const sendPasswordChangeConfirmation = async (email, userName) => {
  const subject = "Chess Academy - Password Changed";
  const text = `
    Hi ${userName},

    Your password for your Chess Academy account has been successfully changed.

    If you did not make this change, please contact our support team immediately.

    Best regards,
    Chess Academy Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Chess Academy</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Changed</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
        
        <p style="color: #475569; line-height: 1.6;">
          Your password for your Chess Academy account has been successfully changed.
        </p>
        
        <div style="background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="color: #059669; font-size: 18px; margin: 0;">
            ✅ Password Updated Successfully
          </p>
        </div>
        
        <p style="color: #ef4444; line-height: 1.6; background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
          <strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          Best regards,<br>
          <strong>Chess Academy Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};
