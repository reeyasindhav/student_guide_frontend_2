"use client";
import { useState } from "react";
import { uploadPDF } from "@/services/chatApi";

export default function PDFUploader({ onUploaded }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const res = await uploadPDF(file);
    setLoading(false);

    onUploaded(res);
  }

  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-2">📚 Upload Study Material</h3>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      {loading && <p className="text-sm text-gray-500 mt-2">Processing PDF…</p>}
    </div>
  );
}
