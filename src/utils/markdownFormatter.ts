const SPECIAL_CHARACTERS = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

export const escapeMarkdown = (text: string): string => {
  let escapedText = text;
  SPECIAL_CHARACTERS.forEach(char => {
    const regex = new RegExp('\\' + char, 'g');
    escapedText = escapedText.replace(regex, '\\' + char);
  });
  return escapedText;
};

export const formatMessageForTelegram = (text: string): string => {
  // First, split the text into segments that should and shouldn't be formatted
  const segments = text.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|```[\s\S]*?```|\[.*?\]\(.*?\))/g);

  return segments.map(segment => {
    // Skip empty segments
    if (!segment) return '';

    // Handle bold text
    if (segment.startsWith('**') && segment.endsWith('**')) {
      const content = segment.slice(2, -2);
      return `*${escapeMarkdown(content)}*`;
    }

    // Handle italic text
    if (segment.startsWith('*') && segment.endsWith('*') && !segment.startsWith('**')) {
      const content = segment.slice(1, -1);
      return `_${escapeMarkdown(content)}_`;
    }

    // Handle strikethrough
    if (segment.startsWith('~~') && segment.endsWith('~~')) {
      const content = segment.slice(2, -2);
      return `~${escapeMarkdown(content)}~`;
    }

    // Handle code blocks
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const content = segment.slice(3, -3);
      return `\`\`\`${escapeMarkdown(content)}\`\`\``;
    }

    // Handle inline code
    if (segment.startsWith('`') && segment.endsWith('`') && !segment.startsWith('```')) {
      const content = segment.slice(1, -1);
      return `\`${escapeMarkdown(content)}\``;
    }

    // Handle links
    if (segment.match(/\[.*?\]\(.*?\)/)) {
      const [, text, url] = segment.match(/\[(.*?)\]\((.*?)\)/)!;
      return `[${escapeMarkdown(text)}](${escapeMarkdown(url)})`;
    }

    // For regular text, just escape special characters
    // But preserve emojis by not escaping them
    return segment.split(/(\p{Emoji}+)/gu).map(part => {
      if (part.match(/\p{Emoji}/u)) {
        return part;
      }
      return escapeMarkdown(part);
    }).join('');
  }).join('');
};