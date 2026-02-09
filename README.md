---
title: AI Data Analyst
emoji: ⚡
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

# 📊 AI Data Analyst

An **AI-powered data analyst** built with **FastAPI** and **Google Gemini API**.
It accepts natural language questions and supporting files, then returns structured JSON answers, including data analysis and charts encoded as **base64 images**.

This app is designed for:

* 📊 Automated data analysis
* 📈 Chart generation (base64 PNGs)

## 🚀 Live Deployment

You can send POST requests to [https://lightrajat-ai-data-analyst.hf.space](https://lightrajat-ai-data-analyst.hf.space).

## ⚙️ Features

* ⚡ **FastAPI async server** – Handles multiple requests concurrently with high performance.
* 📝 **Per-request server logging** – Detailed logs for each request with request ID, client info, execution status, and timing.
* 🧠 **Powered by Gemini** – Leverages Google’s latest LLM for reasoning, analysis, and code generation.
* 🔀 **Load balancing** – Rotates across multiple Gemini API keys for improved stability and performance.
* 📂 **File handling** – Accepts both text (e.g., CSV, TXT, Markdown) and binary (e.g., images, PDFs) files.
* 🤖 **Dynamic code generation** – LLM generates Python code dynamically to answer questions.
* 🔄 **Automatic error correction** – Re-prompts Gemini to fix code when execution errors occur.

## 🛠️ Local Setup

1. Clone the repository
   ```bash
   git clone git@github.com:lightRajat/ai-data-analyst.git
   cd ai-data-analyst
   ```

2. Install dependencies
   ```bash
   uv sync
   ```

   > **Note:** If you don't have `uv` installed, you can install it using `curl -LsSf https://astral.sh/uv/install.sh | sh`.

3. Store your Gemini API keys inside `.env` file separated by commas.
   ```bash
   GEMINI_API_KEYS="key1,key2,key3"
   ```

4. Run the app
   ```bash
   uv run uvicorn main:app --host 0.0.0.0 --port 7860 --reload
   ```

## 📤 Example Request

### Request

```bash
curl "http://localhost:8000" \
     -F "questions.txt=@network.md" \
     -F "edges.csv=@edges.csv"
```

> All requests necessarily include `questions.txt`, with 0 or more supporting files.

### Example `network.md`

```md
Use the undirected network in `edges.csv`.

Return a JSON object with keys:
- `edge_count`: number
- `highest_degree_node`: string
- `average_degree`: number
- `density`: number
- `shortest_path_alice_eve`: number
- `network_graph`: base64 PNG string under 100kB
- `degree_histogram`: base64 PNG string under 100kB
```

### Example `edges.csv`

```csv
source,target
Alice,Bob
Alice,Carol
Bob,Carol
Bob,David
Bob,Eve
Carol,David
David,Eve
```

## 📥 Example Response

```json
{
    "edge_count": 7,
    "highest_degree_node": "Bob",
    "average_degree": 2.8,
    "density": 0.7,
    "shortest_path_alice_eve": 2,
    "network_graph": "iVBORw0KGgo...(response truncated)"
}
```

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.
