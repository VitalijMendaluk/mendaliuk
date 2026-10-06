// Vercel Serverless: заявка з сайту-портфоліо → Telegram. Токен тільки тут (на сервері).
// Краще задати TG_BOT_TOKEN і TG_CHAT_ID у Vercel → Settings → Environment Variables.
const TOKEN = process.env.TG_BOT_TOKEN || '8090010233:AAGucMxosOir1f7ttPIUODULMbO2DYoqTHU';
const CHAT_ID = process.env.TG_CHAT_ID || '-4934715371';
const esc = (v) => String(v ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])).slice(0, 200);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  const phone = String(b.phone || '').replace(/[^\d+]/g, '');
  if (!b.name || phone.length < 7) return res.status(400).json({ ok: false });
  const digits = phone.replace(/\D/g, '');
  const text = [
    '🆕 <b>Заявка на сайт (Кутаїсі)</b>', '',
    `👤 ${esc(b.name)}`,
    `📞 ${esc(phone)}`,
    `👉 <a href="https://wa.me/${digits}">Написати в WhatsApp</a>`,
    b.tg ? `✈️ Telegram: ${esc(b.tg)}` : null,
    `🌐 Мова: ${esc(b.lang)}`
  ].filter(Boolean).join('\n');
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (e) { console.error(e); return res.status(500).json({ ok: false }); }
};
