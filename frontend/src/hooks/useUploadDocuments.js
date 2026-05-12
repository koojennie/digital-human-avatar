import { useState } from "react";
import { DocumentServices } from "../services/document.services";

export const uploadDocument = () => {
  const documentServices = new DocumentServices();

  const [loadingUploadDocument, setLoadingUploadDocument] = useState(false);

  const [errorUploadDocument, setErrorUploadDocument] = useState("");

  const [successUploadDocument, setSuccessUploadDocument] = useState("");

  const upload = async (file, metadata = {}) => {
    setErrorUploadDocument("");

    const validationError = validatorPdfFile(file);

    if (validationError) {
      setErrorUploadDocument(validationError);
      return;
    }

    try {
      setLoadingUploadDocument(true);

      const result = await documentServices.uploadFileKnowledge(file, metadata);

      setSuccessUploadDocument(
        `PDF berhasil diindex (${result.chunkCount} chunks)`,
      );

      console.log(result);
      
      
      return result;
    } catch (error) {
      setErrorUploadDocument(
        error?.response?.data?.message || error.message || "Upload gagal",
      );
    } finally {
      setLoadingUploadDocument(false);
    }
  };

  return {
    upload,
    loadingUploadDocument,
    errorUploadDocument,
    successUploadDocument,
  };
};

const validatorPdfFile = (file) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  if (!file) {
    return "File wajib dipilih!";
  }

  if (file.type !== "application/pdf") {
    return "Harap upload file PDF saja";
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Format file harus .pdf";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File tidak bisa lebih dari 10 MB";
  }

  return null;
};
