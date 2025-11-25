import QRCode from "qrcode"

export const generateQRCode = async (data) => {
  try {
    const qrString = JSON.stringify(data)
    const qrCode = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
    return qrCode
  } catch (error) {
    console.error("QR Code generation error:", error)
    throw error
  }
}
