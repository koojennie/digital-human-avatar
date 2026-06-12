import ragService from "./rag.services.js";
class RagController {
  /* |-------------------------------------------------------------------------- | UPLOAD PDF |-------------------------------------------------------------------------- */
  async uploadPdf(req, res, next) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "File is required" });
      }

      const userId = req.user?.dataValues?.user_id || req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID tidak valid atau tidak ditemukan.",
        });
      }

      const result = await ragService.uploadAndIndexPdf(req.file, {
        category: req.body.category,
        uploaded_by: userId,
      });
      return res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  /* |-------------------------------------------------------------------------- | GET DOCUMENTS |-------------------------------------------------------------------------- */
  async getDocuments(req, res, next) {
    try {
      const result = await ragService.getDocuments(req.query);
      return res.status(200).json({
        success: true,
        message: "Documents fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  /* |-------------------------------------------------------------------------- | DELETE DOCUMENT |-------------------------------------------------------------------------- */
  async deleteDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      await ragService.deleteDocument(documentId);
      return res
        .status(200)
        .json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  /* |-------------------------------------------------------------------------- | RETRIEVE |-------------------------------------------------------------------------- */
  async retrieve(req, res, next) {
    try {
      const { question } = req.body;
      if (!question) {
        return res
          .status(400)
          .json({ success: false, message: "Question is required" });
      }
      const result = await ragService.retrieve(question);
      return res
        .status(200)
        .json({ success: true, message: "Retrieve success", data: result });
    } catch (error) {
      next(error);
    }
  }

  async retrievePlayGroundAndKnowledge(req, res, next) {
    try {
      const { question } = req.body;

      if (!question) {
        return res
          .status(400)
          .json({ success: false, message: "Question is required" });
      }
      const result = await ragService.retrievePlayGroundAndKnowledge(question);

      return res
        .status(200)
        .json({ success: true, message: "Retrieve success", data: result });
    } catch (error) {
      next(error);
    }
  }
}
export default new RagController();
