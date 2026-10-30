/** `*word*` → <em>word</em>, so headings in content.ts stay plain strings.
    Punctuation straight after the emphasis is moved inside it: left as a
    separate text node, SplitText counts it as a word of its own and can
    wrap a lone comma onto the start of the next line. */
export function rich(text: string) {
  return text
    .replace(/\*([.,!?;:]+)/g, "$1*")
    .split(/\*(.+?)\*/g)
    .map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}
