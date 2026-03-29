#!/usr/bin/env node

/**
 * Build Spanish (ES) static pages from English blog articles.
 *
 * Reads each blog/*.html, replaces data-i18n attributes with Spanish translations
 * from i18n-blog-es.json + i18n-es.json, updates lang/canonical/hreflang tags,
 * and writes to blog/es/*.html.
 *
 * Usage: node scripts/build-es.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const OUTPUT_DIR = path.join(BLOG_DIR, 'es');
const DATA_DIR = path.join(ROOT, 'assets', 'data');

// Load all translation sources
function loadTranslations() {
  const files = [
    'i18n-es.json',
    'i18n-blog-es.json',
  ];

  const translations = {};
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      Object.assign(translations, data);
    }
  }
  return translations;
}

// Replace data-i18n="key" → set text content to translation
function replaceDataI18n(html, translations) {
  // data-i18n="key">...content...</tag>
  html = html.replace(
    /data-i18n="([^"]+)"([^>]*)>([^<]*)</g,
    (match, key, attrs, content) => {
      const translation = translations[key];
      if (translation) {
        return `data-i18n="${key}"${attrs}>${translation}<`;
      }
      return match;
    }
  );
  return html;
}

// Generic function to replace content of elements with a given i18n attribute.
// Finds the attribute, determines the parent tag, then finds its matching closing
// tag while handling nested tags of the same type.
function replaceI18nAttribute(html, attrName, translations) {
  const attrRegex = new RegExp('(<(\\w+)\\s[^>]*?' + attrName + '="([^"]+)"[^>]*>)', 'g');
  let result = html;
  let match;
  const replacements = [];

  while ((match = attrRegex.exec(html)) !== null) {
    const fullOpenTag = match[1];
    const tagName = match[2];
    const key = match[3];
    const translation = translations[key];
    if (!translation) continue;

    const startPos = match.index + fullOpenTag.length;
    const closingTag = '</' + tagName + '>';

    // Find the matching closing tag, accounting for nested same-type tags
    let depth = 1;
    let searchPos = startPos;
    let endPos = -1;
    const openTagRegex = new RegExp('<' + tagName + '[\\s>]', 'g');
    const closeTagRegex = new RegExp('</' + tagName + '>', 'g');

    while (depth > 0 && searchPos < html.length) {
      openTagRegex.lastIndex = searchPos;
      closeTagRegex.lastIndex = searchPos;

      const nextOpen = openTagRegex.exec(html);
      const nextClose = closeTagRegex.exec(html);

      if (!nextClose) break;

      if (nextOpen && nextOpen.index < nextClose.index) {
        depth++;
        searchPos = nextOpen.index + nextOpen[0].length;
      } else {
        depth--;
        if (depth === 0) {
          endPos = nextClose.index;
        }
        searchPos = nextClose.index + nextClose[0].length;
      }
    }

    if (endPos !== -1) {
      replacements.push({ start: startPos, end: endPos, translation: translation });
    }
  }

  // Apply replacements in reverse order to preserve positions
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    result = result.substring(0, r.start) + r.translation + result.substring(r.end);
  }

  return result;
}

// Replace data-i18n-html="key" content with translation
function replaceDataI18nHtml(html, translations) {
  return replaceI18nAttribute(html, 'data-i18n-html', translations);
}

// Replace data-i18n-rich="key" content with translation (supports nested HTML)
function replaceDataI18nRich(html, translations) {
  return replaceI18nAttribute(html, 'data-i18n-rich', translations);
}

// Replace data-i18n-placeholder="key" → set placeholder attribute
function replaceDataI18nPlaceholder(html, translations) {
  html = html.replace(
    /data-i18n-placeholder="([^"]+)"([^>]*?)placeholder="([^"]*)"/g,
    (match, key, attrs, placeholder) => {
      const translation = translations[key];
      if (translation) {
        return `data-i18n-placeholder="${key}"${attrs}placeholder="${translation}"`;
      }
      return match;
    }
  );
  return html;
}

// Update <html lang="en"> → <html lang="es">
function updateHtmlLang(html) {
  return html.replace(/<html\s+lang="en"/, '<html lang="es"');
}

// Update canonical URL to point to /es/ version
function updateCanonical(html, filename) {
  const baseName = path.basename(filename);
  // Update canonical
  html = html.replace(
    /rel="canonical"\s+href="https:\/\/elionavarrete\.com\/blog\/([^"]+)"/,
    `rel="canonical" href="https://elionavarrete.com/blog/es/${baseName}"`
  );
  // Also update in reverse format: href="..." rel="canonical"
  html = html.replace(
    /href="https:\/\/elionavarrete\.com\/blog\/([^"]+)"\s+rel="canonical"/,
    `href="https://elionavarrete.com/blog/es/${baseName}" rel="canonical"`
  );
  return html;
}

// Update hreflang tags to point to correct /es/ URLs
function updateHreflang(html, filename) {
  const baseName = path.basename(filename);

  // Update hreflang="es" to point to /blog/es/file.html (no ?lang=es)
  html = html.replace(
    /hreflang="es"\s+href="https:\/\/elionavarrete\.com\/blog\/[^"]*"/g,
    `hreflang="es" href="https://elionavarrete.com/blog/es/${baseName}"`
  );

  // Also handle href before hreflang
  html = html.replace(
    /href="https:\/\/elionavarrete\.com\/blog\/[^"]*"\s+hreflang="es"/g,
    `href="https://elionavarrete.com/blog/es/${baseName}" hreflang="es"`
  );

  return html;
}

// Update og:url and og:locale for Spanish version
function updateOgMeta(html, filename) {
  const baseName = path.basename(filename);
  html = html.replace(
    /property="og:url"\s+content="https:\/\/elionavarrete\.com\/blog\/[^"]+"/,
    `property="og:url" content="https://elionavarrete.com/blog/es/${baseName}"`
  );
  // Add og:locale if not present
  html = html.replace(
    /property="og:type"/,
    'property="og:locale" content="es_ES"><meta property="og:type"'
  );
  return html;
}

// Update meta description and og/twitter descriptions to Spanish version
function updateMetaDescription(html, translations, articlePrefix) {
  // Check for description:es meta tag content
  const descMatch = html.match(/name="description:es"\s+content="([^"]+)"/);
  if (descMatch) {
    const esDesc = descMatch[1];
    // Replace og:description
    html = html.replace(
      /property="og:description"\s+content="[^"]+"/,
      `property="og:description" content="${esDesc}"`
    );
    // Replace twitter:description
    html = html.replace(
      /name="twitter:description"\s+content="[^"]+"/,
      `name="twitter:description" content="${esDesc}"`
    );
    // Replace the main description
    html = html.replace(
      /name="description"\s+content="[^"]+"/,
      `name="description" content="${esDesc}"`
    );
  }
  return html;
}

// Update title tag to Spanish
function updateTitle(html, translations, articlePrefix) {
  const titleKey = `${articlePrefix}.title`;
  const translation = translations[titleKey];
  if (translation) {
    // Strip HTML tags from translation for <title>
    const plainTitle = translation.replace(/<[^>]+>/g, '');
    html = html.replace(
      /<title>[^<]+<\/title>/,
      `<title>${plainTitle} | Elio Navarrete</title>`
    );
    // Update og:title
    html = html.replace(
      /property="og:title"\s+content="[^"]+"/,
      `property="og:title" content="${plainTitle}"`
    );
    // Update twitter:title
    html = html.replace(
      /name="twitter:title"\s+content="[^"]+"/,
      `name="twitter:title" content="${plainTitle}"`
    );
  }
  return html;
}

// Update JSON-LD structured data to Spanish
function updateJsonLd(html, translations, articlePrefix, filename) {
  const baseName = path.basename(filename);
  const titleKey = articlePrefix + '.title';
  const esTitle = translations[titleKey];

  // Get Spanish description
  const descMatch = html.match(/name="description:es"\s+content="([^"]+)"/);
  const esDesc = descMatch ? descMatch[1] : null;

  // Find and update JSON-LD blocks
  html = html.replace(
    /(<script\s+type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    function(match, openTag, jsonContent, closeTag) {
      try {
        var data = JSON.parse(jsonContent);

        // Update BlogPosting
        if (data['@type'] === 'BlogPosting') {
          if (esTitle) data.headline = esTitle.replace(/<[^>]+>/g, '');
          if (esDesc) data.description = esDesc;
          if (data.mainEntityOfPage && data.mainEntityOfPage['@id']) {
            data.mainEntityOfPage['@id'] = 'https://elionavarrete.com/blog/es/' + baseName;
          }
          if (data.url) {
            data.url = 'https://elionavarrete.com/blog/es/' + baseName;
          }
          data.inLanguage = 'es';
        }

        // Update BreadcrumbList
        if (data['@type'] === 'BreadcrumbList' && data.itemListElement) {
          data.itemListElement.forEach(function(item) {
            if (item.item && typeof item.item === 'string' && item.item.includes('/blog/') && !item.item.endsWith('/blog/')) {
              item.item = 'https://elionavarrete.com/blog/es/' + baseName;
            }
            // Translate breadcrumb names
            if (item.name === 'Home') item.name = 'Inicio';
            if (item.name === 'Blog') item.name = 'Blog';
          });
        }

        return openTag + JSON.stringify(data) + closeTag;
      } catch (e) {
        return match; // Return unchanged if JSON parse fails
      }
    }
  );

  return html;
}

// Inject inline script before i18n.js to set language to Spanish
function injectLangScript(html) {
  // Insert a small inline script right before the i18n.js script tag
  // This ensures localStorage has 'es' before i18n.js reads it
  const langScript = '<script>localStorage.setItem("lang","es")</script>';
  html = html.replace(
    /<script defer src="[^"]*i18n\.js"><\/script>/,
    langScript + '<script defer src="../../assets/js/i18n.js"></script>'
  );
  return html;
}

// Update relative paths (../ → ../../) since ES pages are one level deeper
function updateRelativePaths(html) {
  // ../assets/ → ../../assets/
  html = html.replace(/\.\.\/assets\//g, '../../assets/');
  // ../index.html → ../../index.html
  html = html.replace(/\.\.\/index\.html/g, '../../index.html');
  // ../news.html → ../../news.html
  html = html.replace(/\.\.\/news\.html/g, '../../news.html');
  // ../profile.html → ../../profile.html
  html = html.replace(/\.\.\/profile\.html/g, '../../profile.html');
  // ../privacy.html → ../../privacy.html
  html = html.replace(/\.\.\/privacy\.html/g, '../../privacy.html');
  // href="./" (blog index) → href="../"
  html = html.replace(/href="\.\/"/g, 'href="../"');
  // href="./#" → href="../#"
  html = html.replace(/href="\.\/#/g, 'href="../#');
  return html;
}

// Detect the i18n prefix for a blog article (e.g., "blog.ai-maintenance")
function detectArticlePrefix(html) {
  const match = html.match(/data-i18n="(blog\.[a-z0-9-]+)\.title"/);
  if (match) return match[1];

  // Fallback: find first blog.X.Y pattern
  const fallback = html.match(/data-i18n="(blog\.[a-z0-9-]+)\./);
  if (fallback) return fallback[1];

  return null;
}

// Process a single blog article
function processArticle(filename, translations) {
  const filePath = path.join(BLOG_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf-8');

  const prefix = detectArticlePrefix(html);
  if (!prefix) {
    console.log(`  ⚠️  Skipping ${filename}: no i18n prefix found`);
    return false;
  }

  // Apply all transformations
  html = updateHtmlLang(html);
  html = updateCanonical(html, filename);
  html = updateHreflang(html, filename);
  html = updateOgMeta(html, filename);
  html = updateMetaDescription(html, translations, prefix);
  html = updateTitle(html, translations, prefix);
  html = updateJsonLd(html, translations, prefix, filename);
  html = replaceDataI18nRich(html, translations);
  html = replaceDataI18nHtml(html, translations);
  html = replaceDataI18nPlaceholder(html, translations);
  html = replaceDataI18n(html, translations);
  html = updateRelativePaths(html);
  html = injectLangScript(html);

  // Write output
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, html, 'utf-8');

  return true;
}

// Also update hreflang in the ENGLISH source files (replace ?lang=es with /es/ path)
function updateEnglishHreflang(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf-8');
  const baseName = path.basename(filename);

  // Replace ?lang=es URLs with /es/ path
  const oldHref = `https://elionavarrete.com/blog/${baseName}?lang=es`;
  const newHref = `https://elionavarrete.com/blog/es/${baseName}`;

  if (html.includes(oldHref)) {
    html = html.replace(new RegExp(oldHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newHref);
    fs.writeFileSync(filePath, html, 'utf-8');
    return true;
  }
  return false;
}

// Main
function main() {
  console.log('🔨 Building Spanish blog pages...\n');

  // Load translations
  const translations = loadTranslations();
  const translationCount = Object.keys(translations).length;
  console.log(`📖 Loaded ${translationCount} translation keys\n`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all blog articles (exclude index.html and es/ directory)
  const articles = fs.readdirSync(BLOG_DIR).filter(f =>
    f.endsWith('.html') && f !== 'index.html'
  );

  console.log(`📝 Processing ${articles.length} articles...\n`);

  let successCount = 0;
  let englishUpdated = 0;

  for (const article of articles) {
    const success = processArticle(article, translations);
    if (success) {
      console.log(`  ✅ ${article} → es/${article}`);
      successCount++;
    }

    // Update English source hreflang
    if (updateEnglishHreflang(article)) {
      englishUpdated++;
    }
  }

  // Also update blog/index.html hreflang
  const blogIndexPath = path.join(BLOG_DIR, 'index.html');
  let blogIndexHtml = fs.readFileSync(blogIndexPath, 'utf-8');
  const oldIndexHref = 'https://elionavarrete.com/blog/?lang=es';
  const newIndexHref = 'https://elionavarrete.com/blog/es/';
  if (blogIndexHtml.includes(oldIndexHref)) {
    blogIndexHtml = blogIndexHtml.replace(new RegExp(oldIndexHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newIndexHref);
    fs.writeFileSync(blogIndexPath, blogIndexHtml, 'utf-8');
    console.log(`\n  ✏️  Updated blog/index.html hreflang → /blog/es/`);
  }

  console.log(`\n✨ Done! ${successCount}/${articles.length} Spanish pages generated in blog/es/`);
  if (englishUpdated > 0) {
    console.log(`✏️  Updated hreflang in ${englishUpdated} English source files (?lang=es → /es/)`);
  }
}

main();
