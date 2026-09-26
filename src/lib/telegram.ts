// Telegram alerts. The message templates mark bold with *x* and italics with _x_;
// visitor text can contain those characters too, so everything is escaped and only
// matched pairs become HTML tags. A stray * or _ can no longer make Telegram reject
// the alert, and visitor text cannot add links.
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toTelegramHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1<i>$2</i>');
}

export function telegramBody(chatId: string, text: string) {
  return JSON.stringify({ chat_id: chatId, text: toTelegramHtml(text).slice(0, 4000), parse_mode: 'HTML' });
}
