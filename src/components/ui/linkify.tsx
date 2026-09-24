// Turns bare URLs in AI-generated chat text (e.g. the WhatsApp link the
// system prompt is told to include) into real clickable links, since the
// answer is rendered as plain text otherwise.
const URL_RE = /(https?:\/\/[^\s]+)/g;

export function Linkify({ text }: { text: string }) {
  // Splitting on a capturing group keeps the matches in the output array,
  // interleaved at odd indices — no need to re-test each part (and re-testing
  // would be buggy anyway since URL_RE is global and stateful across calls).
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
