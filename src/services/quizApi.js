export async function generateQuiz(file, difficulty = "medium") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("difficulty", difficulty);

  const res = await fetch("http://localhost:8000/quiz/generate", {
    method: "POST",
    body: formData,
  });

  return await res.json();
}
