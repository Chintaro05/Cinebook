import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RefundEmailRequest {
  type: "booking_cancelled" | "refund_processing" | "refund_completed";
  bookingId: string;
  userEmail: string;
  userName?: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  seats: string[];
  amount: number;
}

const getEmailContent = (data: RefundEmailRequest) => {
  const { type, userName, movieTitle, showDate, showTime, seats, amount } = data;
  const name = userName || "Valued Customer";
  const seatList = seats.join(", ");
  const formattedAmount = `$${amount.toFixed(2)}`;

  switch (type) {
    case "booking_cancelled":
      return {
        subject: "Booking Cancellation Confirmation - CineBook",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #E50914 0%, #B81D24 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .status-badge { background: #FFA500; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Cancelled</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Your booking has been successfully cancelled. A refund request has been initiated.</p>
                
                <div class="booking-details">
                  <h3>Cancelled Booking Details</h3>
                  <div class="detail-row"><span>Movie:</span><strong>${movieTitle}</strong></div>
                  <div class="detail-row"><span>Date:</span><strong>${showDate}</strong></div>
                  <div class="detail-row"><span>Time:</span><strong>${showTime}</strong></div>
                  <div class="detail-row"><span>Seats:</span><strong>${seatList}</strong></div>
                  <div class="detail-row"><span>Refund Amount:</span><strong>${formattedAmount}</strong></div>
                  <div class="detail-row"><span>Refund Status:</span><span class="status-badge">Pending</span></div>
                </div>
                
                <p>Your refund will be processed within 3-5 business days. You will receive another email once the refund has been completed.</p>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>The CineBook Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} CineBook. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "refund_processing":
      return {
        subject: "Refund Processing - CineBook",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .status-badge { background: #3B82F6; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Refund Processing</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Great news! Your refund is now being processed.</p>
                
                <div class="booking-details">
                  <h3>Refund Details</h3>
                  <div class="detail-row"><span>Movie:</span><strong>${movieTitle}</strong></div>
                  <div class="detail-row"><span>Original Date:</span><strong>${showDate}</strong></div>
                  <div class="detail-row"><span>Refund Amount:</span><strong>${formattedAmount}</strong></div>
                  <div class="detail-row"><span>Status:</span><span class="status-badge">Processing</span></div>
                </div>
                
                <p>The refund will be credited to your original payment method within 1-2 business days.</p>
                
                <p>Best regards,<br>The CineBook Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} CineBook. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "refund_completed":
      return {
        subject: "Refund Completed - CineBook",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .status-badge { background: #22C55E; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
              .checkmark { font-size: 48px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="checkmark">✓</div>
                <h1>Refund Completed</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Your refund has been successfully processed and credited to your original payment method.</p>
                
                <div class="booking-details">
                  <h3>Refund Summary</h3>
                  <div class="detail-row"><span>Movie:</span><strong>${movieTitle}</strong></div>
                  <div class="detail-row"><span>Refund Amount:</span><strong>${formattedAmount}</strong></div>
                  <div class="detail-row"><span>Status:</span><span class="status-badge">Completed</span></div>
                </div>
                
                <p>The funds should appear in your account within 1-3 business days, depending on your bank.</p>
                
                <p>We hope to see you at CineBook again soon!</p>
                
                <p>Best regards,<br>The CineBook Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} CineBook. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      throw new Error("Invalid email type");
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RefundEmailRequest = await req.json();
    console.log("Received email request:", { type: data.type, bookingId: data.bookingId, email: data.userEmail });

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "CineBook <onboarding@resend.dev>",
      to: [data.userEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-refund-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
