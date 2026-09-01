const passwordResetTemplate = (otp) => ({
  subject: "Reset your Unfazed password",

  html: `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">
        Password Reset Request
      </h2>

      <p>
        We received a request to reset your Unfazed account password.
      </p>

      <p>
        Use the OTP below to continue:
      </p>

      <p
        style="
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 4px;
          margin: 24px 0;
        "
      >
        ${otp}
      </p>

      <p>
        This OTP will expire in 10 minutes.
      </p>

      <p>
        If you did not request a password reset, you can safely ignore this email.
      </p>

      <br />

      <p>
        Regards,<br />
        Team Unfazed
      </p>
    </div>
  `,

  text: `
Your Unfazed password reset OTP is ${otp}.

This OTP will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.
  `,
});

module.exports = passwordResetTemplate;