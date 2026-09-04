const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

/**
 * Extracts structured pages and text from an uploaded document.
 * @param {string} filePath - Absolute path to document
 * @param {string} originalName - Original uploaded file name
 * @returns {Promise<{pages: Array<{pageNumber: number, text: string}>, ocrApplied: boolean, totalCharacters: number}>}
 */
const extractDocumentText = async (filePath, originalName) => {
  const ext = path.extname(originalName || filePath).toLowerCase();
  let pages = [];
  let ocrApplied = false;

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Custom page render to capture per-page text
    let pageNum = 0;
    const pageTextMap = new Map();

    const options = {
      pagerender: function (pageData) {
        return pageData.getTextContent().then(function (textContent) {
          pageNum++;
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += item.str + ' ';
            } else {
              text += '\n' + item.str + ' ';
            }
            lastY = item.transform[5];
          }
          pageTextMap.set(pageNum, text.trim());
          return text;
        });
      }
    };

    try {
      const parsed = await pdfParse(dataBuffer, options);
      
      if (pageTextMap.size > 0) {
        for (const [pNum, pText] of pageTextMap.entries()) {
          if (pText.length > 0) {
            pages.push({ pageNumber: pNum, text: pText });
          }
        }
      }

      // If PDF text extraction yielded almost nothing, run OCR fallback
      const totalExtractedLen = pages.reduce((acc, p) => acc + p.text.length, 0);
      if (totalExtractedLen < 50) {
        console.log(`[Extractor] PDF has minimal text (${totalExtractedLen} chars). Attempting OCR via Tesseract.js...`);
        try {
          const worker = await Tesseract.createWorker('eng');
          const ret = await worker.recognize(filePath);
          await worker.terminate();

          if (ret && ret.data && ret.data.text) {
            pages = [{ pageNumber: 1, text: ret.data.text.trim() }];
            ocrApplied = true;
          }
        } catch (ocrErr) {
          console.warn(`[Extractor] OCR fallback skipped or failed: ${ocrErr.message}`);
          if (pages.length === 0 && parsed.text) {
            pages = [{ pageNumber: 1, text: parsed.text.trim() }];
          }
        }
      }
    } catch (err) {
      console.warn(`[Extractor] Standard PDF parse error: ${err.message}. Trying direct raw read.`);
      const raw = fs.readFileSync(filePath, 'utf8');
      pages = [{ pageNumber: 1, text: raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim() }];
    }
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    const fullText = result.value || '';
    
    // Split DOCX into synthetic pages of ~2000 chars
    const rawPages = fullText.split(/\n\s*\n/);
    let currentPage = 1;
    let currentChunk = '';

    for (const paragraph of rawPages) {
      if ((currentChunk + paragraph).length > 2500 && currentChunk.length > 0) {
        pages.push({ pageNumber: currentPage++, text: currentChunk.trim() });
        currentChunk = paragraph + '\n\n';
      } else {
        currentChunk += paragraph + '\n\n';
      }
    }
    if (currentChunk.trim().length > 0) {
      pages.push({ pageNumber: currentPage, text: currentChunk.trim() });
    }
  } else {
    // Plain text or markdown
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = content.split(/(?=\n#{1,3}\s+)/g);
    
    if (sections.length > 1) {
      sections.forEach((sec, idx) => {
        if (sec.trim().length > 0) {
          pages.push({ pageNumber: idx + 1, text: sec.trim() });
        }
      });
    } else {
      pages = [{ pageNumber: 1, text: content.trim() }];
    }
  }

  // Ensure at least one page exists
  if (pages.length === 0) {
    pages.push({ pageNumber: 1, text: 'No text could be extracted from document.' });
  }

  const totalCharacters = pages.reduce((acc, p) => acc + p.text.length, 0);
  return { pages, ocrApplied, totalCharacters };
};

module.exports = {
  extractDocumentText,
};
