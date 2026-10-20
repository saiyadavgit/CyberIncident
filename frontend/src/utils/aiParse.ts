export interface AiSection {
  title: string;
  items: string[];
  paragraphs: string[];
  ordered: boolean;
}

const TEXT_KEYS = [
  'analysis',
  'plan',
  'remediationPlan',
  'summary',
  'result',
  'content',
  'response',
  'text',
  'message',
  'output',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function extractAiText(data: unknown): string {
  if (typeof data === 'string') {
    const trimmed = data.trim();

    // Handle JSON returned as a string.
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return extractAiText(JSON.parse(trimmed));
      } catch {
        return data;
      }
    }

    return data;
  }

  if (Array.isArray(data)) {
    return data
      .map((item) => extractAiText(item))
      .filter(Boolean)
      .join('\n\n');
  }

  if (!isRecord(data)) {
    return data == null ? '' : String(data);
  }

  // Prefer an actual natural-language response when available.
  for (const key of TEXT_KEYS) {
    const value = data[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  // Handle nested API response objects.
  if (data.data !== undefined) {
    const nested = extractAiText(data.data);

    if (nested) return nested;
  }

  // Handle the backend's AI Threat Analysis response.
  const sections: string[] = [];

  if (typeof data.threatSummary === 'string') {
    sections.push(
      `Threat Summary\n${data.threatSummary}`
    );
  }

  if (typeof data.suggestedSeverity === 'string') {
    sections.push(
      `Suggested Severity\n${data.suggestedSeverity}`
    );
  }

  if (typeof data.attackCategory === 'string') {
    sections.push(
      `Attack Category\n${data.attackCategory}`
    );
  }

  if (Array.isArray(data.riskFactors)) {
    sections.push(
      `Risk Factors\n${data.riskFactors
        .filter((item): item is string => typeof item === 'string')
        .map((item) => `- ${item}`)
        .join('\n')}`
    );
  }

  if (Array.isArray(data.investigationSuggestions)) {
    sections.push(
      `Recommended Investigation\n${data.investigationSuggestions
        .filter((item): item is string => typeof item === 'string')
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n')}`
    );
  }

  if (typeof data.disclaimer === 'string') {
    sections.push(
      `Important Note\n${data.disclaimer}`
    );
  }

  if (sections.length > 0) {
    return sections.join('\n\n');
  }

  // Fallback for other response formats.
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return '';
  }
}

const clean = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

export function parseAiText(text: string): AiSection[] {
  const sections: AiSection[] = [];

  let cur: AiSection = {
    title: '',
    items: [],
    paragraphs: [],
    ordered: false,
  };

  const push = () => {
    if (cur.title || cur.items.length || cur.paragraphs.length) {
      sections.push(cur);
    }
  };

  text
    .replace(/\r/g, '')
    .split('\n')
    .forEach((raw) => {
      const line = raw.trim();

      if (!line) return;

      const heading =
        line.match(/^#{1,6}\s+(.+)$/) ||
        line.match(/^\*\*(.+?)\*\*:?\s*$/) ||
        line.match(/^([A-Z][A-Za-z0-9 /&()-]{2,60}):$/);

      if (heading) {
        push();

        cur = {
          title: clean(heading[1]).replace(/:$/, ''),
          items: [],
          paragraphs: [],
          ordered: false,
        };

        return;
      }

      const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);

      if (bullet) {
        cur.items.push(clean(bullet[1]));

        if (/^\d+[.)]\s+/.test(line)) {
          cur.ordered = true;
        }

        return;
      }

      cur.paragraphs.push(clean(line));
    });

  push();

  return sections;
}

export function splitLabel(
  item: string
): { label: string | null; body: string } {
  const match = item.match(/^([^:]{2,36}):\s+(.+)$/);

  return match
    ? { label: match[1], body: match[2] }
    : { label: null, body: item };
}