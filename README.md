<a href="https://chat.vercel.ai/">
  <img alt="Chatbot" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chatbot</h1>
</a>

<p align="center">
    Chatbot (formerly AI Chatbot) is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chatbot.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports OpenAI, Anthropic, Google, xAI, and other model providers via AI Gateway
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

This fork uses [DeepSeek](https://platform.deepseek.com) directly through the AI SDK OpenAI-compatible provider.

### DeepSeek Authentication

Set `DEEPSEEK_API_KEY` in your `.env.local` for local/non-Vercel deployments.
You can optionally set `DEEPSEEK_BASE_URL` (default: `https://api.deepseek.com/v1`).

## HITL Implementation Guide (AI SDK + React Agent)

This project includes a minimal **Human-in-the-Loop (HITL)** flow you can reuse in any new AI SDK + React agent app.

### Goal

Add an approval gate for high-risk actions (e.g. deleting production data) so the agent must wait for a human decision before execution.

### Architecture (minimal)

1. **Tool definition**: mark risky tool with `needsApproval: true`
2. **Server route**: register the tool in `streamText({ tools })`
3. **Client UI**: render tool states (`approval-requested`, `output-available`, `output-denied`)
4. **User action**: call `addToolApprovalResponse({ approved: true|false })`
5. **Auto-continue**: use `sendAutomaticallyWhen` to resume generation after approval

### Step-by-step (with file links)

1. **Create a HITL tool (server)**
   - File: [`lib/ai/tools/hitl-demo-action.ts`](lib/ai/tools/hitl-demo-action.ts)
   - Key points:
     - define `inputSchema`
     - set `needsApproval: true`
     - keep side effects safe for demo / controlled for production

2. **Register tool in chat API route**
   - File: [`app/(chat)/api/chat/route.ts`](app/(chat)/api/chat/route.ts)
   - Key points:
     - add tool to `experimental_activeTools`
     - add tool to `tools: { ... }`
     - stream via `result.toUIMessageStream(...)`

3. **Add trigger policy in prompt (risk-based)**
   - File: [`lib/ai/prompts.ts`](lib/ai/prompts.ts)
   - Key points:
     - define when model should call HITL tool (high-risk / irreversible actions)
     - keep explicit override token (like `[HITL]`) if you want deterministic demos

4. **Wire approval logic in chat hook**
   - File: [`components/chat.tsx`](components/chat.tsx)
   - Key points:
     - use `addToolApprovalResponse`
     - use `sendAutomaticallyWhen` to continue after approval state update

5. **Render approval UI in message renderer**
   - File: [`components/message.tsx`](components/message.tsx)
   - Key points:
     - handle `tool-hitlDemoAction`
     - render `Approve` / `Deny` buttons for `approval-requested`
     - render final states for `output-available` and `output-denied`

6. **Shared tool-state UI components (optional reuse)**
   - File: [`components/elements/tool.tsx`](components/elements/tool.tsx)

### Practical notes for new projects

- Start with one risky tool first (small blast radius).
- Keep tool execution idempotent where possible.
- Log who approved, when, and why (audit trail) before production rollout.
- Add E2E tests for both paths: **Approve** and **Deny**.

## Deploy Your Own

You can deploy your own version of Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/chatbot)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm db:migrate # Setup database or apply latest database changes
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).
