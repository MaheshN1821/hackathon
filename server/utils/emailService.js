import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendAlertEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email service not configured, skipping email")
      return
    }

    const mailOptions = {
      from: `"DISS System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Alert email sent to ${to}`)
  } catch (error) {
    console.error("Email send error:", error)
  }
}

export const sendLowStockAlert = async (drug, adminEmails) => {
  const subject = `Low Stock Alert: ${drug.name}`
  const html = `
    <h2>Low Stock Alert</h2>
    <p>The following drug is running low on stock:</p>
    <ul>
      <li><strong>Drug:</strong> ${drug.name}</li>
      <li><strong>Batch:</strong> ${drug.batchNo}</li>
      <li><strong>Current Quantity:</strong> ${drug.quantity}</li>
      <li><strong>Threshold:</strong> ${drug.minThreshold}</li>
      <li><strong>Location:</strong> ${drug.location}</li>
    </ul>
    <p>Please reorder immediately.</p>
  `

  for (const email of adminEmails) {
    await sendAlertEmail(email, subject, html)
  }
}

export const sendExpiryAlert = async (drug, adminEmails) => {
  const subject = `Expiry Alert: ${drug.name}`
  const html = `
    <h2>Drug Expiry Alert</h2>
    <p>The following drug is expiring soon:</p>
    <ul>
      <li><strong>Drug:</strong> ${drug.name}</li>
      <li><strong>Batch:</strong> ${drug.batchNo}</li>
      <li><strong>Expiry Date:</strong> ${new Date(drug.expiryDate).toLocaleDateString()}</li>
      <li><strong>Days Remaining:</strong> ${drug.daysUntilExpiry}</li>
      <li><strong>Quantity:</strong> ${drug.quantity}</li>
    </ul>
    <p>Please take necessary action.</p>
  `

  for (const email of adminEmails) {
    await sendAlertEmail(email, subject, html)
  }
}
