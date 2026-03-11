import { tool } from "ai";
import { z } from "zod";

export const hitlDemoAction = tool({
  description:
    "Human-in-the-loop demo action for high-risk operations. Use this for risky/irreversible requests or when user includes [HITL]. Always requires approval before execution. This is demo-only and should not perform real destructive side effects.",
  inputSchema: z.object({
    action: z.string().describe("The action to execute after human approval"),
  }),
  needsApproval: true,
  execute: async ({ action }) => {
    return {
      status: "executed",
      action,
      executedAt: new Date().toISOString(),
      note: "This is a demo tool execution after human approval.",
    };
  },
});
