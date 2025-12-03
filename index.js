// ================== IMPORTS ==================
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ================== CONFIG ===================

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rts-secret-token";

if (!PAGE_ACCESS_TOKEN) {
  console.warn("PAGE_ACCESS_TOKEN manjavona (tsy defini) !");
} else {
  console.log("PAGE_ACCESS_TOKEN length =", PAGE_ACCESS_TOKEN.length);
}
console.log("VERIFY_TOKEN =", VERIFY_TOKEN ? "[OK]" : "[EMPTY]");

// =============== WEBHOOK VERIFY (GET) ===================

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("GET /webhook", { mode, token });

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED ✅");
      res.status(200).send(challenge);
    } else {
      console.log("WEBHOOK_VERIFIED FAILED ❌ - bad token");
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// =============== WEBHOOK EVENTS (POST) ===================

app.post("/webhook", (req, res) => {
  console.log("✅ POST /webhook reçu");
  console.log("Body reçu :", JSON.stringify(req.body, null, 2));

  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const events = entry.messaging || [];

      events.forEach((event) => {
        const sender_psid = event.sender && event.sender.id;
        if (!sender_psid) return;

        console.log("📩 Nouveau event de", sender_psid);

        if (event.message) {
          handleMessage(sender_psid, event.message);
        } else if (event.postback) {
          handlePostback(sender_psid, event.postback);
        }
      });
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    console.log('❌ body.object !== "page" :', body.object);
    res.sendStatus(404);
  }
});

// ================== MESSAGE LOGIC ==================

function handleMessage(sender_psid, received_message) {
  if (!received_message.text) return;

  const text = received_message.text.toLowerCase().trim();
  const has = (kw) => text.includes(kw);
  let response;

  // MAP MADAGASCAR
  if (
    has("map mada") ||
    has("map madagascar") ||
    (has("map") && (has("mada") || has("madagascar")))
  ) {
    response = {
      text:
        "Map Madagascar mbola eo am-panamboarana @ RTS DarkZone amin’izao 😄\n" +
        "- Efa misy projet map ho an'ny ETS2 sy Proton Bus\n" +
        "- Rehefa vita dia havoaka ato @ page (sary + vidéo + détails achat) 🔥\n" +
        "Araho fotsiny ny page fa ho annonce-na officiel izy io 😉",
    };

    // TUTO (PROTON / BUSSID / GÉNÉRIQUE)
  } else if (
    has("tuto") ||
    has("tutorial") ||
    has("tutoriel") ||
    has("torolalana") ||
    has("guide")
  ) {
    if (has("proton")) {
      response = {
        text:
          "Tuto install mod Proton Bus Simulator 🚍\n" +
          "1️⃣ Alefaso ao anaty dossier du jeu ilay .3ds/.pbz/.pks\n" +
          "2️⃣ Ao anaty jeu → Garage / Mods → activeo ilay mod\n" +
          "3️⃣ Raha misy olana (crash na tsy hita) dia asio place libre ao anaty stockage & avereno ny jeu\n" +
          "Raha mila tuto vidéo dia manorata, dia alefako lien 😉",
      };
    } else if (has("bussid")) {
      response = {
        text:
          "Tuto install mod BUSSID 🚌\n" +
          "1️⃣ Apetraho ao anaty dossier `BUSSID/Mods` ilay .bussidmod\n" +
          "2️⃣ Sokafy ny jeu → Garage → Import / Mod → safidio ilay mod\n" +
          "3️⃣ Activeo izy dia afaka mitendry amin'io vehicule io ianao\n" +
          "Raha tsy mandeha dia alefaso sary écran, hijerentsika 😄",
      };
    } else {
      response = {
        text:
          "Tuto ve no tadiavinao 😎\n" +
          "Azonao soratana hoe:\n" +
          "- 'tuto proton bus'\n" +
          "- 'tuto bussid'\n" +
          "Dia omeko step-by-step anao 😉",
      };
    }

    // MOD PROTON BUS
  } else if (has("proton bus") || (has("proton") && has("bus"))) {
    response = {
      text:
        "Mod Proton Bus Simulator ve no tadiavinao? 😏\n" +
        "- Misy pack bus & cars RTS DarkZone\n" +
        "- Afaka manontany prix direct ato na mijery publications ao amin'ny page 🚍",
    };

    // MOD BUSSID
  } else if (has("bussid") || has("bus simulator indonesia")) {
    response = {
      text:
        "Ho an'ny BUSSID dia misy mod bus & car koa an 😎\n" +
        "Mijery ao amin'ny RTS DarkZone Mods na manoratra hoe 'mod bussid'.",
    };

    // JEUX SIMULATION ANDROID
  } else if (has("android") && has("jeux") && has("simulation")) {
    response = {
      text:
        "Jeux simulation android recommandés:\n" +
        "- Proton Bus Simulator 2 🚍\n" +
        "- BUSSID (Bus Simulator Indonesia) 🚌\n" +
        "- Truckers of Europe 3 🚚\n" +
        "Raha mila MOD dia soraty hoe 'mod proton bus' na 'mod bussid'.",
    };

    // FALLBACK
  } else {
    response = {
      text:
        "Tsy azoko tsara ilay fangatahana 😅\n" +
        "Azonao andramana hoe:\n" +
        "- 'jeux simulation android'\n" +
        "- 'mod proton bus' / 'mod bussid'\n" +
        "- 'map mada'\n" +
        "- 'tuto proton bus' na 'tuto bussid'",
    };
  }

  callSendAPI(sender_psid, response);
}

// Postback de base (raha ilainao any aoriana)
function handlePostback(sender_psid, received_postback) {
  console.log(
    "📩 Postback reçu de",
    sender_psid,
    "payload =",
    received_postback.payload
  );
  const response = { text: "Ok, azoko ny safidinao 😄" };
  callSendAPI(sender_psid, response);
}

// ================== SEND API ==================

function callSendAPI(sender_psid, response) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ Tsy defini ny PAGE_ACCESS_TOKEN, tsy afaka mandefa message");
    return;
  }

  const request_body = {
    recipient: { id: sender_psid },
    message: response,
  };

  axios
    .post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      request_body
    )
    .then((res) => {
      console.log("✅ Message envoyé !", JSON.stringify(res.data));
    })
    .catch((err) => {
      const data = err.response?.data || err.message;
      console.error(
        "❌ Erreur en envoyant le message :",
        JSON.stringify(data)
      );
    });
}

// ================== SERVER START ==================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook en écoute sur le port ${PORT}`);
});
