import { config } from "dotenv";
config();

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse";
import { z } from "zod";
import Groq from "groq-sdk";

// Initialize Groq with Helicone proxy headers
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://groq.helicone.ai",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY || ""}`,
  },
});

// Initialize MCP Server
const server = new McpServer({
  name: "Sentiment Analysis Agent",
  version: "1.0.0",
});

// Define the sentiment analysis tool
server.tool(
  "analyzeSentiment",
  { text: z.string().min(1).max(1000) },
  async ({ text }) => {
    try {
      const sanitizedText = text.trim();
      if (!sanitizedText) {
        return {
          content: [
            { type: "text", text: "Error: Empty text provided" },
          ],
        };
      }

      // Send prompt to Groq via Helicone
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Analyze the sentiment of the following text and respond in JSON format with fields for "sentiment" (positive/neutral/negative), "confidence" (0-1), and "explanation". Text: "${sanitizedText}"`,
          },
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.4,
        max_tokens: 1000,
      });

      const responseText = completion.choices?.[0]?.message?.content || "";

      let parsedResponse;
      try {
        const match = responseText.match(/\{[\s\S]*\}/);
        parsedResponse = match ? JSON.parse(match[0]) : null;
      } catch (e) {
        parsedResponse = null;
      }

      return {
        content: [
          {
            type: "text",
            text: parsedResponse
              ? `Sentiment: ${parsedResponse.sentiment}\nConfidence: ${parsedResponse.confidence}\n\n${parsedResponse.explanation}`
              : responseText,
          },
        ],
      };
    } catch (err: any) {
      console.error("[MCP] Sentiment error:", err);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${err.message || String(err)}`,
          },
        ],
      };
    }
  }
);

const app = express();
let transport: SSEServerTransport | null = null;

// Set up SSE endpoint
app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});


app.post("/messages", (req, res) => {
  if (transport && typeof transport.handlePostMessage === "function") {
    transport.handlePostMessage(req, res);
  } else {
    res.status(500).send("Transport not initialized or method unavailable");
  }
});

app.listen(3000, () => {
  console.log("Sentiment Agent MCP running at http://localhost:3000/sse");
});