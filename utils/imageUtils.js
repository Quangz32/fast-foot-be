const fs = require("fs");
const path = require("path");

const saveBase64Image = (base64String) => {
  try {
    // Remove the data:image/... prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

    // Create buffer from base64
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const filename = `${Date.now()}.png`;
    const filepath = path.join("uploads", filename);

    // Ensure uploads directory exists
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    // Save the file
    fs.writeFileSync(filepath, imageBuffer);

    // Return the file path relative to uploads directory
    return `/uploads/${filename}`;
  } catch (error) {
    throw new Error("Error saving base64 image: " + error.message);
  }
};

module.exports = {
  saveBase64Image,
};
