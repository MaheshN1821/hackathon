import cloudinary from "../config/cloudinary.js"

// Upload file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    res.json({
      success: true,
      file: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Upload multiple files
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const files = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
    }))

    res.json({ success: true, files })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params

    await cloudinary.uploader.destroy(publicId)

    res.json({ success: true, message: "File deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
