import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, otp: string) {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log(`[mock-email] password reset for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@profnavigator.ai",
    to: email,
    subject: "Восстановление доступа в ПрофНавигатор AI",
    text: `Ваш код восстановления: ${otp}`,
  });
}
