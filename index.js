// index.js - RTS DarkZone bot clean version

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ENV VARS
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rts-secret-token";

if (!PAGE_ACCESS_TOKEN) {
  console.error("PAGE_ACCESS_TOKEN manjavona (tsy defini) !");
}

console.log(
  "PAGE_ACCESS_TOKEN length =",
  PAGE_ACCESS_TOKEN ? PAGE_ACCESS_TOKEN.length : 0
);

// =============== HELPERS ===================

async function callSendAPI(sender_psid, response) {
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: sender_psid },
        message: response,
      }
    );
    console.log("Message envoyé ✅");
  } catch (error) {
    console.error(
      "Erreur en envoyant le message :",
      error.response?.data || error.message
    );
  }
}

function handleMessage(sender_psid, received_message) {
  if (!received_message.text) return;

  const text = received_message.text.toLowerCase().trim();
  let response;

  // 1. MOD PROTON BUS
  if (text.includes("proton bus") || (text.includes("proton") && text.includes("bus"))) {
    response = {
      text:
        "Mod Proton Bus Simulator ve no tadiavinao? 😏\n" +
        "- Misy pack bus & cars RTS DarkZone\n" +
        "- Afaka manontany prix direct ato na mijery publications ao amin'ny page. 🚍"
    };

  // 2. MOD BUSSID
  } else if (text.includes("bussid") || text.includes("bus simulator indonesia")) {
    response = {
      text:
        "Ho an'ny BUSSID dia misy mod bus & car koa an 😎\n" +
        "Mijery ao amin'ny RTS DarkZone Mods na manoratra hoe 'mod bussid'."
    };

  // 3. Jeux simulation android
  } else if (
    text.includes("android") &&
    text.includes("jeux") &&
    text.includes("simulation")
  ) {
    response = {
      text:
        "Jeux simulation android recommandés:\n" +
        "- Proton Bus Simulator 2 🚍\n" +
        "- BUSSID (Bus Simulator Indonesia) 🚌\n" +
        "- Truckers of Europe 3 🚚\n" +
        "Raha mila MOD dia soraty fotsiny hoe 'mod proton bus' na 'mod bussid'."
    };

  // 4. Fallback
  } else {
    response = {
      text:
        "Tsy azoko tsara ilay fangatahana 😅\n" +
        "Azonao andramana hoe:\n" +
        "- 'jeux simulation android'\n" +
        "- 'mod proton bus'\n" +
        "- 'mod bussid'"
    };
  }

  callSendAPI(sender_psid, response);
}

// =============== WEBHOOKS ===================

// Verification (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Webhook events (POST)
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.messaging && entry.messaging[0];
      if (!event) return;

      const sender_psid = event.sender.id;

      if (event.message) {
        handleMessage(sender_psid, event.message);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// =============== SERVER START ===================

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Webhook en écoute sur le port ${PORT}`);
});
