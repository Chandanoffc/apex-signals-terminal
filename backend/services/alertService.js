import fetch from 'node-fetch';

const MIN_CONFIDENCE_ALERT = 8;

export function shouldAlert(signal) {
  return signal?.confidence >= MIN_CONFIDENCE_ALERT;
}

export async function sendTelegramAlert(signal, botToken, chatId) {
  if (!botToken || !chatId) return;
  const text = `🔔 Apex Signal (confidence ${signal.confidence})\n` +
    `Symbol: ${signal.symbol} | Bias: ${signal.bias}\n` +
    `Price: ${signal.price} | Funding: ${signal.fundingRate != null ? (signal.fundingRate * 100).toFixed(3) + '%' : '—'}\n` +
    `${signal.explanation || ''}`;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (e) {
    console.error('Telegram alert error:', e.message);
  }
}

export async function sendDiscordAlert(signal, webhookUrl) {
  if (!webhookUrl) return;
  const color = signal.bias === 'LONG' ? 0x3fb950 : 0xf85149;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `Apex Signal: ${signal.symbol} ${signal.bias}`,
          description: signal.explanation || '',
          color,
          fields: [
            { name: 'Confidence', value: String(signal.confidence), inline: true },
            { name: 'Price', value: String(signal.price), inline: true },
            { name: 'Funding', value: signal.fundingRate != null ? (signal.fundingRate * 100).toFixed(3) + '%' : '—', inline: true },
          ],
        }],
      }),
    });
  } catch (e) {
    console.error('Discord alert error:', e.message);
  }
}

export async function dispatchAlerts(signal) {
  if (!shouldAlert(signal)) return;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  await Promise.allSettled([
    telegramToken && telegramChatId ? sendTelegramAlert(signal, telegramToken, telegramChatId) : Promise.resolve(),
    discordWebhook ? sendDiscordAlert(signal, discordWebhook) : Promise.resolve(),
  ]);
}
