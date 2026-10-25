import "server-only";
import { Marked, type Tokens } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Os textos são escritos em Markdown simples no painel, com dois extras:
 *
 *   ::: versiculo João 15:5
 *   Eu sou a videira, vós as varas…
 *   :::
 *
 * vira um versículo em destaque, e referências como "Salmos 23:1" ou
 * "1 Coríntios 13:4-7" no meio do texto são identificadas automaticamente.
 */

const BOOKS = [
  "Gênesis", "Genesis", "Êxodo", "Exodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
  "Samuel", "Reis", "Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Salmo", "Provérbios",
  "Eclesiastes", "Cantares", "Cântico dos Cânticos", "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel",
  "Oséias", "Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Miqueias", "Naum", "Habacuque",
  "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos",
  "Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "Tessalonicenses", "Timóteo", "Tito",
  "Filemom", "Hebreus", "Tiago", "Pedro", "Judas", "Apocalipse",
].sort((a, b) => b.length - a.length);

const REF_SOURCE = `(?:[1-3]\\s?)?(?:${BOOKS.join("|")})\\s\\d{1,3}(?::\\d{1,3}(?:[-–]\\d{1,3})?(?:,\\s?\\d{1,3}(?:[-–]\\d{1,3})?)*)?`;
const REF_AT_START = new RegExp(`^${REF_SOURCE}(?![\\p{L}\\d])`, "u");
const REF_ANYWHERE = new RegExp(`(?<![\\p{L}\\d])${REF_SOURCE}(?![\\p{L}\\d])`, "u");

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const marked = new Marked({ gfm: true, breaks: false });

marked.use({
  extensions: [
    {
      name: "verse",
      level: "block",
      start(src) {
        return src.match(/^::: ?vers[ií]culo/im)?.index;
      },
      tokenizer(src) {
        const match = /^::: ?vers[ií]culo[ \t]*([^\n]*)\n([\s\S]*?)\n:::[ \t]*(?:\n|$)/i.exec(src);
        if (!match) return undefined;
        return {
          type: "verse",
          raw: match[0],
          reference: match[1].trim(),
          tokens: this.lexer.inlineTokens(match[2].trim().replace(/\n+/g, " ")),
        };
      },
      renderer(token) {
        const body = this.parser.parseInline(token.tokens ?? []);
        const ref = token.reference ? `<figcaption><cite class="bible-ref">${escapeHtml(token.reference)}</cite></figcaption>` : "";
        return `<figure class="verse"><blockquote><p>${body}</p></blockquote>${ref}</figure>\n`;
      },
    },
    {
      name: "bibleRef",
      level: "inline",
      start(src) {
        return src.match(REF_ANYWHERE)?.index;
      },
      tokenizer(src) {
        const match = REF_AT_START.exec(src);
        if (!match) return undefined;
        return { type: "bibleRef", raw: match[0], text: match[0] };
      },
      renderer(token) {
        return `<cite class="bible-ref">${escapeHtml(token.text)}</cite>`;
      },
    },
  ],
  renderer: {
    image({ href, title, text }: Tokens.Image) {
      const caption = title || "";
      return `<figure class="content-image"><img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />${
        caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""
      }</figure>`;
    },
  },
});

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "del", "a", "ul", "ol", "li", "blockquote",
    "figure", "figcaption", "img", "cite", "code", "pre", "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "loading", "decoding"],
    "*": ["class"],
  },
  allowedClasses: { figure: ["verse", "content-image"], cite: ["bible-ref"] },
  allowedSchemes: ["https", "http", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"] },
  allowProtocolRelative: false,
  transformTags: {
    // O título principal (h1) é reservado ao título da página
    h1: "h2",
    a: (tagName, attribs) => {
      const external = /^https?:\/\//.test(attribs.href ?? "");
      return {
        tagName,
        attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
      };
    },
  },
};

export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown ?? "", { async: false }) as string;
  return sanitizeHtml(html, SANITIZE);
}

/** Para campos curtos (devocionais): parágrafos simples + referências bíblicas. */
export function renderParagraphs(text: string) {
  return renderMarkdown(text);
}
