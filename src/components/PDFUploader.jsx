"use client";

import { useState } from "react";
import { uploadPDF } from "@/services/chatApi";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";

export default function PDFUploader({ onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadedFile(file);

    try {
      const res = await uploadPDF(file);
      onUploaded?.(res);
      // Keep uploaded file visible for a moment
      setTimeout(() => {
        setUploadedFile(null);
      }, 3000);
    } catch (err) {
      console.error("PDF upload failed:", err);
      setError(err.message || "Failed to upload PDF. Please try again.");
      setUploadedFile(null);
    } finally {
      setLoading(false);
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={16} className="text-gray-600 dark:text-gray-400" />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          Upload Study Material (PDF)
        </label>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
          <div className="flex items-center gap-3 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 transition-colors bg-white dark:bg-gray-800">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Uploading...
                </span>
              </>
            ) : (
              <>
                <Upload size={18} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Choose PDF file or drag and drop
                </span>
              </>
            )}
          </div>
        </label>
      </div>

      {uploadedFile && !error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in">
          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300 flex-1">
            {uploadedFile.name} ({formatFileSize(uploadedFile.size)}) uploaded successfully
          </span>
          <button
            onClick={() => setUploadedFile(null)}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded"
          >
            <X size={14} className="text-green-600 dark:text-green-400" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded ml-auto"
          >
            <X size={14} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
}
