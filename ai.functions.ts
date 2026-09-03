import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLovableAI, type ChatMessage } from "./ai-gateway.server";

const SYSTEM_PROMPT = `You are NyaySakhi, an AI legal awareness assistant for women in India.
- You provide EDUCATIONAL information about Indian laws (IPC, PWDVA 2005, POSH 2013, IT Act, Dowry Prohibition Act, MTP Act, Hindu Succession Act etc.).
- Use simple, empathetic language. Prefer bullet points and short paragraphs.
- Always mention relevant Indian sections/acts when applicable.
- Suggest the right helpline (1091, 181, 1930, 112, 1098) whenever the user is in immediate danger.
- End every substantive answer with a one-line disclaimer: "This is general legal awareness, not a substitute for professional legal advice."
- Never make up laws that do not exist. If unsure, say so.`;

// ============ Chat assistant ============
const ChatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).min(1).max(20),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...data.messages,
    ];
    const reply = await callLovableAI({ messages, temperature: 0.5 });
    return { reply };
  });

// ============ Complaint generator (structured output) ============
const ComplaintInput = z.object({
  situation: z.string().min(20).max(3000),
});

const complaintSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", description: "e.g. Domestic Violence, Cyber Crime, POSH" },
    risk_level: { type: "string", enum: ["Low", "Medium", "High"] },
    complaint_title: { type: "string" },
    applicable_laws: { type: "array", items: { type: "string" } },
    rights: { type: "array", items: { type: "string" } },
    complaint_letter: { type: "string", description: "Formal complaint letter body" },
    required_evidence: { type: "array", items: { type: "string" } },
    next_steps: { type: "array", items: { type: "string" } },
    emergency_contact: { type: "string" },
    scheme_recommendations: { type: "array", items: { type: "string" } },
  },
  required: [
    "category","risk_level","complaint_title","applicable_laws","rights",
    "complaint_letter","required_evidence","next_steps","emergency_contact","scheme_recommendations",
  ],
} as const;

export const generateComplaint = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ComplaintInput.parse(input))
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nYou will now analyse a situation described by a woman in India and produce a structured complaint packet. Always ground it in Indian law. Use plain, respectful language in the complaint letter, addressed to the SHO. Include placeholders like [Your Name], [Address], [Date] where personal info is needed.` },
      { role: "user", content: `Analyse the following situation and produce the structured complaint output.\n\nSituation:\n"""${data.situation}"""` },
    ];
    const raw = await callLovableAI({
      messages,
      temperature: 0.3,
      jsonSchema: { name: "complaint_packet", schema: complaintSchema },
    });
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("AI returned an invalid response. Please try again.");
    }
  });
