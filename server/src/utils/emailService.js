import nodemailer from 'nodemailer';

let transporter;

const initializeTransporter = async () => {
  try {
    let testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
    console.log('Ethereal Email transporter initialized');
  } catch (error) {
    console.error('Failed to initialize Ethereal transporter:', error);
  }
};

initializeTransporter();

export const sendBookingConfirmation = async (userEmail, bookingDetails, carDetails) => {
  if (!transporter) {
    console.error('Transporter not initialized yet.');
    return;
  }

  const { startDate, endDate, totalPrice } = bookingDetails;
  const { name, price } = carDetails;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Booking Confirmation</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">Your booking for the <strong>${name}</strong> has been successfully confirmed!</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">Reservation Details:</h3>
        <ul style="list-style-type: none; padding-left: 0; color: #4b5563;">
          <li style="margin-bottom: 10px;"><strong>Car:</strong> ${name} (${price})</li>
          <li style="margin-bottom: 10px;"><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
          <li style="margin-bottom: 10px;"><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</li>
          <li style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1d5db; font-size: 18px; color: #111827;">
            <strong>Total Price:</strong> $${totalPrice}
          </li>
        </ul>
      </div>

      <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
        Thank you for choosing CarRental. Drive safely!
      </p>
    </div>
  `;

  try {
    let info = await transporter.sendMail({
      from: '"CarRental Service" <noreply@carrental.com>',
      to: userEmail,
      subject: `Booking Confirmed: ${name}`,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
