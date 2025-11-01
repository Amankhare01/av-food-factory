import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "devs@digipants.com";

export async function POST(req: Request) {
  try {
    const { name, phone, email, date, type, location, message } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminMail = {
      from: `"AV Food Factory" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Catering Inquiry from ${name}`,
      html: `
        <div style="background-color:#faf6f1;padding:32px;font-family:'Segoe UI',Tahoma,sans-serif;color:#333;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <div style="background:#0f766e;padding:20px 30px;">
              <h2 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;">New Catering Inquiry</h2>
              <p style="color:#b2f5ea;margin-top:6px;font-size:14px;">Sent via AV Food Factory contact form</p>
            </div>
            <div style="padding:28px 30px;">
              <p style="margin:0 0 12px 0;font-size:16px;color:#333;">
                A new inquiry has been submitted with the following details:
              </p>
              <table cellpadding="6" cellspacing="0" width="100%" style="margin-top:10px;border-collapse:collapse;">
                <tr>
                  <td style="font-weight:600;width:150px;color:#0f766e;">Name:</td>
                  <td>${name}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#0f766e;">Phone / WhatsApp:</td>
                  <td>${phone}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#0f766e;">Email:</td>
                  <td>${email}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#0f766e;">Event Date:</td>
                  <td>${date || "Not specified"}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#0f766e;">Event Type:</td>
                  <td>${type || "Not specified"}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#0f766e;">Location:</td>
                  <td>${location || "Not specified"}</td>
                </tr>
              </table>
              <div style="margin-top:20px;">
                <p style="font-weight:600;margin-bottom:6px;color:#0f766e;">Message:</p>
                <div style="background:#f5f5f5;border-left:4px solid #0f766e;padding:12px 16px;border-radius:6px;font-size:15px;line-height:1.6;color:#444;">
                  ${message || "No message provided"}
                </div>
              </div>
            </div>
            <div style="background:#f2f2f2;padding:18px 30px;text-align:center;font-size:13px;color:#666;">
              <p style="margin:0;"><strong>AV Food Factory</strong> - Lucknow's Nawabi Catering Service</p>
              <p style="margin-top:4px;color:#999;">Dastarkhwan-style catering for weddings, events & celebrations</p>
              <a href="https://avfoodfactory.com" target="_blank" style="color:#0f766e;text-decoration:none;font-weight:600;">avfoodfactory.com</a>
            </div>
          </div>
        </div>
      `,
    };


    if (email) {
      const userMail = {
        from: `"AV Food Factory" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Thank you for contacting AV Food Factory!",
        html: `
<div style="background-color:#faf6f1;padding:20px;font-family:'Segoe UI',Tahoma,sans-serif;color:#333;">
  <center>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);margin:0 auto;">
      
      <!-- Header -->
      <tr>
        <td style="background:#0f766e;padding:24px 15px;text-align:center;">
          <h2 style="color:#ffffff;margin:0;font-size:22px;line-height:1.4;">Thank you, ${name || "Guest"}!</h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px 20px;text-align:center;">
          <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 10px 0;">
            We’ve received your catering inquiry and our team will contact you shortly.
          </p>

          <p style="font-size:14px;margin:18px 0;color:#555;">
            Here’s a quick summary of your request:
          </p>

          <!-- Details Box -->
          <table cellpadding="10" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 auto;max-width:95%;background:#f8fdfb;border:1px solid #cde4df;border-radius:10px;">
            <tr style="border-bottom:1px solid #dbe8e5;">
              <td style="color:#0f766e;font-weight:600;width:40%;font-size:14px;">📅 Event Date:</td>
              <td style="color:#333;font-size:14px;">${date || "Not specified"}</td>
            </tr>
            <tr style="border-bottom:1px solid #dbe8e5;">
              <td style="color:#0f766e;font-weight:600;font-size:14px;">🎉 Event Type:</td>
              <td style="color:#333;font-size:14px;">${type || "Not specified"}</td>
            </tr>
            <tr>
              <td style="color:#0f766e;font-weight:600;font-size:14px;">📍 Location:</td>
              <td style="color:#333;font-size:14px;">${location || "Not specified"}</td>
            </tr>
          </table>

          <div style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;">
            <p style="font-size:14px;line-height:1.6;color:#444;margin:0;">
              Need to connect sooner? Reach us on
              <a href="https://wa.me/917880561870" target="_blank" style="color:#0f766e;text-decoration:none;font-weight:600;">WhatsApp</a>.
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:18px 10px;text-align:center;font-size:13px;color:#666;">
          <p style="margin:0 0 4px 0;">
            <strong>AV Food Factory</strong> • Lucknow’s Nawabi Catering Service
          </p>
          <p style="margin:0;color:#999;">
            Dastarkhwan-style catering for weddings, events & celebrations
          </p>
          <a href="https://avfoodfactory.com" target="_blank" 
             style="display:inline-block;margin-top:8px;color:#0f766e;text-decoration:none;font-weight:600;font-size:13px;">
            🌐 avfoodfactory.com
          </a>
        </td>
      </tr>
    </table>
  </center>
</div>
        `,
      };

      await transporter.sendMail(userMail);
    }

    await transporter.sendMail(adminMail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email." },
      { status: 500 },
    );
  }
}