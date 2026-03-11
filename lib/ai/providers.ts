import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const deepseek = createOpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

function resolveDeepSeekModel(modelId: string) {
  const normalized = modelId.toLowerCase();

  if (
    normalized.includes("reasoning") ||
    normalized.includes("thinking") ||
    normalized.includes("reasoner")
  ) {
    return "deepseek-reasoner";
  }

  return "deepseek-chat";
}

function assertDeepSeekKey() {
  if (!DEEPSEEK_API_KEY) {
    throw new Error(
      "DEEPSEEK_API_KEY is missing. Please set it in .env.local for non-test environments."
    );
  }
}

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  assertDeepSeekKey();

  const resolved = resolveDeepSeekModel(modelId);

  if (resolved === "deepseek-reasoner") {
    return wrapLanguageModel({
      model: deepseek.chat(resolved),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return deepseek.chat(resolved);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  assertDeepSeekKey();
  return deepseek.chat("deepseek-chat");
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }

  assertDeepSeekKey();
  return deepseek.chat("deepseek-chat");
}
