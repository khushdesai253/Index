const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

const API_URL = "https://app.wabotick.com/api/v1/whatsapp/send/template";

const COMMON_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
};

const COMMON_DATA = {
  apiToken: "13485|fy1f14C2aQPJ9Yk7pPTqV8RvA3PH5mGXXBRyhRLWf029c319",
  phone_number_id: "801577553033468",
};

// ✅ helper function
async function sendTemplate(data) {
  const payload = new URLSearchParams(data);
  const response = await axios.post(API_URL, payload.toString(), {
    headers: COMMON_HEADERS,
  });
  return response.data;
}

app.post("/send-whatsapp", async (req, res) => {
  try {
    const { phoneNumber, inquiryStatus } = req.body;

    if (!phoneNumber || !inquiryStatus) {
      return res.status(400).json({
        error: "phoneNumber and inquiryStatus are required.",
      });
    }

    const status = inquiryStatus.trim().toUpperCase();

    let data = {
      ...COMMON_DATA,
      phone_number: phoneNumber,
    };

    // ✅ Only one special case: READY TO VISIT
    if (status === "READY TO VISIT") {
      data = {
        ...data,
        template_id: "257062",
        template_quick_reply_button_values: ["gT9P4GPFfFL0RTU"],
      };
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported inquiryStatus: ${inquiryStatus}`,
      });
    }

    const response = await sendTemplate(data);

    if (response?.status === "1") {
      return res.json({
        success: true,
        message: "Message sent successfully",
        response,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Sending failed",
        details: response,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Request failed",
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
