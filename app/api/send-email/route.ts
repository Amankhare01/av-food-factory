import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, phone, date, type, location, message } = await req.json();

    // ✅ Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ 1. Admin Email (to you)
    const adminMail = {
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
            <a href="https://avfoodfactory.com" target="_blank" style="color:#0f766e; text-decoration:none; font-weight:600;">🌐 avfoodfactory.com</a>
          </div>
        </div>
      </div>
      `,
    };

    // ✅ 2. User Confirmation Email
    const userMail = {
      from: `"AV Food Factory" <${process.env.EMAIL_USER}>`,
      to: phone.includes("@") ? phone : process.env.DEFAULT_USER_EMAIL, // fallback if user didn't enter email
      subject: "🎉 Thank you for contacting AV Food Factory!",
      html: `
      <div style="background-color:#faf6f1; padding:32px; font-family:'Segoe UI', Tahoma, sans-serif; color:#333;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
          
          <div style="background:#0f766e; padding:20px 30px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:22px;">Thank You, ${name}!</h2>
          </div>

          <div style="padding:28px 30px; text-align:center;">
            <p style="font-size:16px; color:#333;">
              We’ve received your catering inquiry and our team will contact you shortly.
            </p>
            <p style="font-size:15px; margin-top:12px; color:#444;">
              Here's a quick summary of your request:
            </p>
            <table cellpadding="6" cellspacing="0" width="100%" style="margin-top:10px; border-collapse:collapse; text-align:left;">
              <tr><td style="color:#0f766e; font-weight:600;">📅 Date:</td><td>${date || "Not specified"}</td></tr>
              <tr><td style="color:#0f766e; font-weight:600;">🎉 Event:</td><td>${type || "Not specified"}</td></tr>
              <tr><td style="color:#0f766e; font-weight:600;">📍 Location:</td><td>${location || "Not specified"}</td></tr>
            </table>

            <div style="margin-top:20px;">
              <p style="font-size:15px; line-height:1.6; color:#444;">
                If you’d like to discuss your menu or requirements sooner, feel free to reach us on
                <a href="https://wa.me/917880561870" target="_blank" style="color:#0f766e; text-decoration:none; font-weight:600;">WhatsApp</a>.
              </p>
            </div>
          </div>

          <div style="background:#f2f2f2; padding:18px 30px; text-align:center; font-size:13px; color:#666;">
            <p style="margin:0;">💚 <b>AV Food Factory</b> — Lucknow’s Nawabi Catering Service</p>
            <p style="margin-top:4px; color:#999;">Dastarkhwan-style catering for weddings, events & celebrations</p>
            <a href="https://avfoodfactory.com" target="_blank" style="color:#0f766e; text-decoration:none; font-weight:600;">🌐 avfoodfactory.com</a>
          </div>
        </div>
      </div>
      `,
    };

    // ✅ Send both emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email." }, { status: 500 });
  }
}
