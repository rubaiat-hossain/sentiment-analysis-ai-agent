# 🧠 Sentiment Analysis Agent (MCP + Groq + Helicone)

This is a simple, MCP-compatible AI agent that performs sentiment analysis using [Groq's LLMs](https://groq.com/) and tracks observability through [Helicone](https://www.helicone.ai/). It’s designed to integrate easily with [Cursor](https://cursor.sh) or other MCP clients.

---

## 🔧 Features

- ✅ **MCP-compatible server** using `@modelcontextprotocol/sdk`
- 🧠 **Sentiment analysis** with LLaMA-4 via Groq API
- 🔍 **Observability** with full request tracing via Helicone
- 📡 Real-time interaction via Server-Sent Events (SSE)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/rubaiat-hossain/sentiment-analysis-ai-agent
cd sentiment-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```bash
GROQ_API_KEY=your_groq_api_key
HELICONE_API_KEY=your_helicone_api_key
HELICONE_BASE_URL=https://oai.helicone.ai/v1
```

### 4. Run the agent

```bash
npx tsx main.ts
```

The agent will be available at `http://localhost:3000/sse`. Add this URL to your MCP-compatible development environment (like Cursor) to register the MCP and use the sentiment analysis agent directly from your IDE.
