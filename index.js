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

  const has = (kw) => text.includes(kw);

  // 0. MAP MADAGASCAR (ETS2 / Proton Bus)
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
        "Araho fotsiny ny page fa ho annonce-na officiel izy io 😉"
    };

  // 1. TUTO PROTON BUS / BUSSID / GENERAL
  } else if (
    has("tuto") ||
    has("tutorial") ||
    has("tutoriel") ||
    has("torolalana") ||
    has("guide")
  ) {
    // Tuto Proton Bus
    if (has("proton")) {
      response = {
        text:
          "Tuto install mod Proton Bus Simulator 🚍\n" +
          "1️⃣ Alefaso ao anaty dossier du jeu ilay .3ds/.pbz/.pks (araka ny format mod-nao)\n" +
          "2️⃣ Ao anaty jeu → Garage / Mods → activeo ilay mod\n" +
          "3️⃣ Raha misy olana (crash na tsy hita) dia asio place libre ao anaty stockage & avereno ny jeu\n" +
          "Raha mila tuto vidéo dia manorata fotsiny, dia halefako lien-nao 😉"
      };
    }
    // Tuto BUSSID
    else if (has("bussid")) {
      response = {
        text:
          "Tuto install mod BUSSID 🚌\n" +
          "1️⃣ Apetraho ao anaty dossier `BUSSID/Mods` ilay .bussidmod\n" +
          "2️⃣ Sokafy ny jeu → Garage → Import / Mod → safidio ilay mod\n" +
          "3️⃣ Activeo izy dia afaka mitendry amin'io vehicule io ianao\n" +
          "Raha tsy mandeha dia alefaso sary écran, hijerentsika 😄"
      };
    }
    // Tuto générique (tsy nilaza jeu)
    else {
      response = {
        text:
          "Tuto ve no tadiavinao 😎\n" +
          "Lazao fotsiny hoe:\n" +
          "- 'tuto proton bus' raha te-hahafantatra install mod Proton Bus\n" +
          "- 'tuto bussid' raha te-hahafantatra install mod BUSSID\n" +
          "Afaka manampy step-by-step aho 😉"
      };
    }

  // 2. MOD PROTON BUS
  } else if (
    has("proton bus") ||
    (has("proton") && has("bus"))
  ) {
    response = {
      text:
        "Mod Proton Bus Simulator ve no tadiavinao? 😏\n" +
        "- Misy pack bus & cars RTS DarkZone\n" +
        "- Afaka manontany prix direct ato na mijery publications ao amin'ny page. 🚍"
    };

  // 3. MOD BUSSID
  } else if (has("bussid") || has("bus simulator indonesia")) {
    response = {
      text:
        "Ho an'ny BUSSID dia misy mod bus & car koa an 😎\n" +
        "Mijery ao amin'ny RTS DarkZone Mods na manoratra hoe 'mod bussid'."
    };

  // 4. Jeux simulation android
  } else if (
    has("android") &&
    has("jeux") &&
    has("simulation")
  ) {
    response = {
      text:
        "Jeux simulation android recommandés:\n" +
        "- Proton Bus Simulator 2 🚍\n" +
        "- BUSSID (Bus Simulator Indonesia) 🚌\n" +
        "- Truckers of Europe 3 🚚\n" +
        "Raha mila MOD dia soraty fotsiny hoe 'mod proton bus' na 'mod bussid'."
    };

  // 5. Fallback
  } else {
    response = {
      text:
        "Tsy azoko tsara ilay fangatahana 😅\n" +
        "Azonao andramana hoe:\n" +
        "- 'jeux simulation android'\n" +
        "- 'mod proton bus' / 'mod bussid'\n" +
        "- 'map mada'\n" +
        "- 'tuto proton bus' na 'tuto bussid'"
    };
  }

  callSendAPI(sender_psid, response);
}
// =============== SERVER START ===================

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Webhook en écoute sur le port ${PORT}`);
});
