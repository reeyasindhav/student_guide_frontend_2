import { API_BASE_URL } from "../config/api";

export async function generateQuiz(file, difficulty = "medium") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("difficulty", difficulty);

  const res = await fetch(`${API_BASE_URL}/quiz/generate`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}
