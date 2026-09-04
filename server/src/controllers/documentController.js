const documentService = require('../services/documentService');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file to upload.' });
    }

    const { title, category, department } = req.body;
    const document = await documentService.createDocument(
      {
        title,
        category,
        department,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
      },
      req.user
    );

    res.status(202).json({
      success: true,
      message: 'Document uploaded and queued for vector embedding & indexing.',
      document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const { category, department, search, status, page, limit } = req.query;
    const result = await documentService.listDocuments({
      category,
      department,
      search,
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const reindexDocument = async (req, res, next) => {
  try {
    const result = await documentService.reindexDocument(req.params.id, req.user);
    res.status(202).json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  reindexDocument,
};
