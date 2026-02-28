/**
 * prompts.ts
 *
 * Central collection of every AI prompt used across the ai-service.
 * ─────────────────────────────────────────────────────────────────
 * Naming convention:
 *   SCREAMING_SNAKE_CASE for static strings
 *   camelCase functions for prompts that need runtime interpolation
 *
 * Each prompt is annotated with:
 *   @used-in  — controller file and function name
 *   @purpose  — what the prompt instructs the model to do
 */

// ──────────────────────────────────────────────────────────────────────────────
// CONTENT GENERATION  (content.controller.ts)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @used-in  content.controller.ts → generateContent()
 * @purpose  Generates a full blog post from a topic, writing tone, and
 *           approximate word-count range.  Does NOT include a title —
 *           the frontend renders the title separately.
 */
export const buildGenerateBlogContentPrompt = (
  topic: string,
  tone: string,
  wordRange: string,
): string =>
  `Write a ${tone} blog post about "${topic}".
The content should be approximately ${wordRange}.
Make it engaging, informative, and well-structured.

Formatting rules you MUST follow:
- Use proper Markdown throughout.
- Wrap every code snippet, command, or script in a fenced code block with the correct language tag, e.g.:
  \`\`\`bash
  npm install some-package
  \`\`\`
  or
  \`\`\`javascript
  const x = 1;
  \`\`\`
- Use \`inline code\` for short identifiers, filenames, flags, and commands mentioned inside prose.
- Use **bold** for key terms and important ideas.
- Separate each paragraph with a blank line.
- Do NOT include a title — just the main content.
- If the topic involves any commands, scripts, configurations, or code, ALWAYS put them in fenced code blocks — never inline in the paragraph text.`;



/**
 * @used-in  content.controller.ts → generateTitles()
 * @purpose  Suggests N catchy, SEO-friendly blog titles based on the first
 *           1 000 characters of existing content.  Returns plain-text titles,
 *           one per line, with no numbering or bullet points.
 */
export const buildGenerateTitlesPrompt = (content: string, count: number): string =>
  `Based on the following blog content, generate ${count} catchy, SEO-friendly title suggestions.
Return only the titles, one per line, without numbering or bullet points.

Content:
${content.substring(0, 1000)}`;

/**
 * @used-in  content.controller.ts → generateOutline()
 * @purpose  Creates a detailed, hierarchical blog outline for a topic with a
 *           configurable number of main sections (each with 2-3 key points).
 */
export const buildGenerateOutlinePrompt = (topic: string, sections: number): string =>
  `Create a detailed blog post outline for the topic: "${topic}"
Include approximately ${sections} main sections.
For each section, provide:
1. Section title
2. 2-3 key points to cover

Format the outline in a clear, hierarchical structure.`;

// ──────────────────────────────────────────────────────────────────────────────
// CONTENT IMPROVEMENT  (improvement.controller.ts)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @used-in  improvement.controller.ts → checkGrammar(), improveContent()
 * @purpose  System-level instruction that applies to both grammar-check and
 *           improve-content calls.  Forces the model to always return the
 *           COMPLETE text so it never truncates long blogs.
 */
export const WRITING_ASSISTANT_SYSTEM_MESSAGE =
  `You are an expert writing assistant. When given text to improve or modify:
- Always return the COMPLETE modified text — never summarise, truncate, or omit any part of it.
- Preserve ALL fenced code blocks exactly as-is (including the language tag) unless the user explicitly asks you to change them.
- Use proper Markdown: fenced code blocks (\`\`\`lang\n...\n\`\`\`) for code, \`inline code\` for short identifiers, and **bold** for key terms.`;

/**
 * @used-in  improvement.controller.ts → checkGrammar()
 * @purpose  Standard grammar / spelling / punctuation check.  Asks the model
 *           to return a structured JSON response containing the corrected text,
 *           a list of errors with explanations, and an error count.
 */
export const buildCheckGrammarPrompt = (content: string): string =>
  `Check the following text for grammar, spelling, and punctuation errors.
Provide a corrected version and list the specific errors found.

Format your response as JSON with this structure:
{
  "correctedText": "the corrected text here",
  "errors": [
    {"type": "grammar|spelling|punctuation", "original": "...", "correction": "...", "explanation": "..."}
  ],
  "errorCount": number
}

Text to check:
${content}`;

/**
 * @used-in  improvement.controller.ts → checkGrammar(), improveContent()
 * @purpose  Applies a free-form user instruction (e.g. "add emojis",
 *           "make it shorter") to the existing content.  Used whenever the
 *           user types a custom instruction instead of clicking a preset button.
 *           Returns the COMPLETE modified text with no truncation.
 */
export const buildCustomInstructionPrompt = (instruction: string, content: string): string =>
  `${instruction.trim()}

Return the COMPLETE modified text (no truncation).

Text to modify:
${content}`;

/**
 * @used-in  improvement.controller.ts → improveContent()
 * @purpose  Preset improvement prompts keyed by improvementType.
 *           Each variant targets a different writing quality dimension.
 *           The chosen prompt is combined with the original content at runtime.
 */
export const IMPROVE_CONTENT_PROMPTS: Record<string, string> = {
  // Makes the text easier to read and understand without changing its meaning
  clarity: 'Make the following text clearer and easier to understand while preserving its meaning.',

  // Boosts reader engagement — more vivid, narrative-driven writing
  engagement: 'Make the following text more engaging and captivating for readers.',

  // Elevates the formal/professional quality of the writing
  professionalism: 'Improve the professionalism and tone of the following text.',

  // Default: applies clarity + engagement + professionalism improvements together
  all: 'Improve the following text by making it clearer, more engaging, and more professional.',
};

/**
 * @used-in  improvement.controller.ts → improveContent()
 * @purpose  Builds the full improve-content prompt from the stock improvement-type
 *           instruction plus the original text.  Asks the model to explain the
 *           key changes it made.
 */
export const buildImproveContentPrompt = (
  improvementType: keyof typeof IMPROVE_CONTENT_PROMPTS,
  content: string,
): string =>
  `${IMPROVE_CONTENT_PROMPTS[improvementType] ?? IMPROVE_CONTENT_PROMPTS.all}

Provide the improved version and explain the key changes made.

Original text:
${content}`;

// ──────────────────────────────────────────────────────────────────────────────
// SEO & SUMMARISATION  (seo.controller.ts)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @used-in  seo.controller.ts → generateSEO()
 * @purpose  Analyses the first 2 000 characters of a blog post and returns a
 *           structured JSON object with SEO recommendations: meta title,
 *           meta description, keyword suggestions, structure improvements,
 *           linking suggestions, and a readability score.
 */
export const buildGenerateSEOPrompt = (content: string, targetKeywords: string[]): string => {
  const keywordsText =
    targetKeywords.length > 0 ? `Target keywords: ${targetKeywords.join(', ')}` : '';

  return `Analyze the following blog content and provide SEO improvement suggestions.
${keywordsText}

Provide suggestions in the following areas:
1. Meta title (50-60 characters)
2. Meta description (150-160 characters)
3. Keyword optimization recommendations
4. Content structure improvements for SEO
5. Internal/external linking suggestions
6. Readability score and improvements

Format your response as JSON with this structure:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["keyword1", "keyword2", ...],
  "structureImprovements": ["improvement1", "improvement2", ...],
  "linkingSuggestions": ["suggestion1", "suggestion2", ...],
  "readabilityScore": "good|fair|needs improvement",
  "readabilityTips": ["tip1", "tip2", ...]
}

Content:
${content.substring(0, 2000)}`;
};

/**
 * @used-in  seo.controller.ts → summarizeContent()
 * @purpose  Condenses a piece of content to approximately maxLength words while
 *           retaining all key points.  Used for auto-generating blog excerpts.
 */
export const buildSummarizeContentPrompt = (content: string, maxLength: number): string =>
  `Summarize the following content in approximately ${maxLength} words.
Make the summary concise, informative, and capture the key points.

Content:
${content}`;
