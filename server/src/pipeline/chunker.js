const env = require('../config/env');

/**
 * Splits extracted pages into overlapping chunks with rich metadata.
 * @param {Array<{pageNumber: number, text: string}>} pages
 * @param {Object} documentMeta - { docId, fileName, category, department }
 * @returns {Array<Object>}
 */
const chunkDocumentPages = (pages, documentMeta) => {
  const chunkSize = env.CHUNK_SIZE || 800;
  const chunkOverlap = env.CHUNK_OVERLAP || 150;
  const chunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const text = (page.text || '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
    if (!text.trim()) continue;

    if (text.length <= chunkSize) {
      chunks.push({
        docId: documentMeta.docId,
        content: text.trim(),
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex++,
        metadata: {
          fileName: documentMeta.fileName,
          category: documentMeta.category || 'General',
          department: documentMeta.department || 'All',
          uploadTimestamp: new Date(),
        },
      });
      continue;
    }

    let start = 0;
    while (start < text.length) {
      let end = start + chunkSize;

      // Try to break on a sentence boundary or word boundary
      if (end < text.length) {
        const nextPeriod = text.lastIndexOf('. ', end);
        const nextNewline = text.lastIndexOf('\n', end);
        const bestBreak = Math.max(nextPeriod + 1, nextNewline);

        if (bestBreak > start + (chunkSize / 2)) {
          end = bestBreak + 1;
        } else {
          const nextSpace = text.lastIndexOf(' ', end);
          if (nextSpace > start + (chunkSize / 2)) {
            end = nextSpace;
          }
        }
      }

      const chunkSlice = text.slice(start, end).trim();
      if (chunkSlice.length > 20) {
        chunks.push({
          docId: documentMeta.docId,
          content: chunkSlice,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
          metadata: {
            fileName: documentMeta.fileName,
            category: documentMeta.category || 'General',
            department: documentMeta.department || 'All',
            uploadTimestamp: new Date(),
          },
        });
      }

      if (end >= text.length) break;
      start = end - chunkOverlap;
      if (start < 0) start = 0;
    }
  }

  return chunks;
};

module.exports = {
  chunkDocumentPages,
};
