import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, phone, date, type, location, message } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const mailOptions = {
  from: `"AV Food Factory" <${process.env.EMAIL_USER}>`,
  to: "aman@digipants.com",
  subject: `🍽️ New Catering Inquiry from ${name}`,
  html: `
  <div style="background-color:#faf6f1; padding:32px; font-family:'Segoe UI', Tahoma, sans-serif; color:#333;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#0f766e; padding:20px 30px;">
        <h2 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:0.5px;">
          🍴 New Catering Inquiry
        </h2>
        <p style="color:#b2f5ea; margin-top:6px; font-size:14px;">
          Sent via AV Food Factory Contact Form
        </p>
      </div>

      <!-- Body -->
      <div style="padding:28px 30px;">
        <p style="margin:0 0 12px 0; font-size:16px; color:#333;">
          You’ve received a new inquiry from a potential customer. Here are the details:
        </p>

        <table cellpadding="6" cellspacing="0" width="100%" style="margin-top:10px; border-collapse:collapse;">
          <tr>
            <td style="font-weight:600; width:150px; color:#0f766e;">👤 Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="font-weight:600; color:#0f766e;">📞 Phone:</td>
            <td>${phone}</td>
          </tr>
          <tr>
            <td style="font-weight:600; color:#0f766e;">📅 Event Date:</td>
            <td>${date || "Not specified"}</td>
          </tr>
          <tr>
            <td style="font-weight:600; color:#0f766e;">🎉 Event Type:</td>
            <td>${type || "Not specified"}</td>
          </tr>
          <tr>
            <td style="font-weight:600; color:#0f766e;">📍 Location:</td>
            <td>${location || "Not specified"}</td>
          </tr>
        </table>

        <!-- Message box -->
        <div style="margin-top:20px;">
          <p style="font-weight:600; margin-bottom:6px; color:#0f766e;">📝 Message:</p>
          <div style="background:#f5f5f5; border-left:4px solid #0f766e; padding:12px 16px; border-radius:6px; font-size:15px; line-height:1.6; color:#444;">
            ${message || "No message provided"}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f2f2f2; padding:18px 30px; text-align:center; font-size:13px; color:#666;">
        <p style="margin:0;">💚 <b>AV Food Factory</b> — Lucknow’s Nawabi Catering Service</p>
        <p style="margin-top:4px; color:#999;">Dastarkhwan-style catering for weddings, events & celebrations</p>
      </div>
    </div>
  </div>
  `,
};


    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email." }, { status: 500 });
  }
}
