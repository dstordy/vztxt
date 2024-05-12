const escapeSequences: Record<string, string> = {
  "'": "\\'",
  '"': '\\"',
  "\t": "\\t",
  "\r": "\\r",
  "\n": "\\n",
  "\\": "\\",
};

export const escapeString = (value: string, quote: '"' | "'" | "" = '"') => {
  if (quote == '"')
    return value.replace(
      /"|\t|\r|\n|\\/g,
      (seq) => escapeSequences[seq] ?? seq,
    );
  else if (quote == "'")
    return value.replace(
      /'|\t|\r|\n|\\/g,
      (seq) => escapeSequences[seq] ?? seq,
    );
  else
    return value.replace(/\t|\r|\n|\\/g, (seq) => escapeSequences[seq] ?? seq);
};

const unescapeSequences: Record<string, string> = {
  "\\'": "'",
  '\\"': '"',
  "\\t": "\t",
  "\\r": "\r",
  "\\n": "\n",
  "\\\\": "\\",
} as const;

export const unescapeString = (value: string) => {
  return value.replace(/\\['"trn\\]/g, (seq) => unescapeSequences[seq] ?? seq);
};
