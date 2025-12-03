const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Ampidiro eto ny token avy amin'i Meta
const PAGE_ACCESS_TOKEN = 'EAAQfDUhiPO4BQDyiihwDjf4JEZB2oGRW3fe5mVherEMYUc5bICKBixLNmuH6qikMo9R18FYo9aI3dPm7gtSsvGBkP5nw57cP3A8zIlYoQjZBS8brnjywkYxVW49FCexG91xnZAewOa1kNiaz1P8I5qNCFraPDizc5GAxp7QnD3A1TS3UPczRawsF6jFEKlZCEPxV1ZAhM';
const VERIFY_TOKEN = 'rts-secret-token';

console.log('PAGE_ACCESS_TOKEN length =', PAGE_ACCESS_TOKEN.length);

// --- 1) GET /webhook : verification an'i Meta ---
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// --- 2) POST /webhook : mandray events ---
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const event = entry.messaging && entry.messaging[0];
      if (!event) return;

      const senderPsid = event.sender.id;

      if (event.message) {
        handleMessage(senderPsid, event.message);
      } else if (event.postback) {
        handlePostback(senderPsid, event.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// --- 3) Logic message: jeux, android, simulation, salutation, fallback ---
function handleMessage(senderPsid, receivedMessage) {
  const text = (receivedMessage.text || '').toLowerCase().trim();

  if (!text) {
    return callSendAPI(senderPsid, {
      text: 'Afaka mamerina amin\'ny soratra mazava ve azafady ? 🙂'
    });
  }

  const has = (kw) => text.includes(kw);
  let reply;

  // 🎯 Cas 1 : jeux simulation sur Android
  if (has('android') && (has('simulation') || has('simu') || has('simulator'))) {
    reply = {
      text: [
        'Ho an\'ny jeux simulation amin’ny Android, ireto no tsara be 🔥:',
        '',
        '- Proton Bus Simulator',
        '- Proton Bus Road (PBSR)',
        '- Bus Simulator Indonesia (BUSSID)',
        '',
        'Afaka asiana MOD koa @ ireny, indrindra ao @ Bussid 😈. Raha mila catégorie hafa (FPS, foot, open world, etc.) dia soraty fotsiny.'
      ].join('\n')
    };
  }

  // 🎯 Cas 2 : général "jeux android"
  else if (has('jeux') && has('android')) {
    reply = {
      text: 'Jeux Android ve no tadiavinao? Lazao fotsiny catégorie: simulation, fps, foot, open world… dia omeko liste 🔥'
    };
  }

  // 🎯 Cas 3 : salutation
  else if (has('salama') || has('bonjour') || has('hello') || has('coucou')) {
    reply = {
      text: 'Yooo 😄 Tongasoa ato @ RTS DarkZone Gaming! Afaka manontany jeux, mod, na config téléphone ianao.'
    };
  }

  // 🎯 Fallback par défaut
  else {
    reply = {
      text: 'Misaotra namandefa message 🙌. Raha mitady jeux dia lazao fotsiny catégorie (oh: "jeux simulation android", "fps android", sns.).'
    };
  }

  return callSendAPI(senderPsid, reply);
}

// --- 4) Logic postback (raha mila boutons any aoriana) ---
function handlePostback(senderPsid, postback) {
  const payload = postback.payload || 'NO_PAYLOAD';
  const reply = { text: `Postback reçu: ${payload}` };
  callSendAPI(senderPsid, reply);
}

// --- 5) Mandefa message amin'ny Send API ---
async function callSendAPI(senderPsid, response) {
  const url = 'https://graph.facebook.com/v20.0/me/messages';

  const payload = {
    recipient: { id: senderPsid },
    message: response,
  };

  try {
    await axios.post(url, payload, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    });
    console.log('Message envoyé ✔️');
  } catch (err) {
    console.error(
      'Erreur en envoyant le message :',
      err.response?.data || err.message
    );
  }
}

// --- 6) Lancer le serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook en écoute sur le port ${PORT}`);
});
