const SPECIAL_CHARACTERS = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

export const escapeMarkdown = (text: string): string => {
  let escapedText = text;
  SPECIAL_CHARACTERS.forEach(char => {
    escapedText = escapedText.replace(new RegExp('\\' + char, 'g'), '\\' + char);
  });
  return escapedText;
};

export const formatMessageForTelegram = (text: string): string => {
  // Replace common markdown patterns with escaped versions
  const patterns = [
    // Bold
    { regex: /\*\*(.*?)\*\*/g, replacement: (_, p1: string) => `*${escapeMarkdown(p1)}*` },
    // Italic
    { regex: /\*(.*?)\*/g, replacement: (_, p1: string) => `_${escapeMarkdown(p1)}_` },
    // Strikethrough
    { regex: /~~(.*?)~~/g, replacement: (_, p1: string) => `~${escapeMarkdown(p1)}~` },
    // Code blocks
    { regex: /```([\s\S]*?)```/g, replacement: (_, p1: string) => `\`\`\`${escapeMarkdown(p1)}\`\`\`` },
    // Inline code
    { regex: /`([^`]+)`/g, replacement: (_, p1: string) => `\`${escapeMarkdown(p1)}\`` },
    // Links
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: (_, text: string, url: string) => 
      `[${escapeMarkdown(text)}](${escapeMarkdown(url)})` },
  ];

  let formattedText = text;
  patterns.forEach(({ regex, replacement }) => {
    formattedText = formattedText.replace(regex, replacement);
  });

  // Escape any remaining special characters that aren't part of markdown syntax
  return formattedText;
};