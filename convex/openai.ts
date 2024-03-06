// https://github.com/ianmacartney/convex-chat-gpt/blob/main/convex/openai.ts

// https://stack.convex.dev/full-stack-chatgpt-app
// Building a Full-Stack ChatGPT app

"use node";
import { internal } from "./_generated/api";
import {
  Configuration,
  CreateModerationResponseResultsInner,
  OpenAIApi,
} from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
const apiKey = process.env.OPENAI_API_KEY!;
const OrganizationID = process.env.OPENAI_API_ORG_ID;
if (!apiKey) {
  throw new Error(
    "Missing OPENAI_API_KEY in environment variables.\n" +
    "Set it in the project settings in the Convex dashboard:\n" +
    "    npx convex dashboard\n or https://dashboard.convex.dev"
  );
}
// const configuration = new Configuration({ apiKey });
// const openai = new OpenAIApi(configuration);

export const moderateIdentity = action({
  args: { name: v.string(), instructions: v.string() },
  handler: async (ctx, { name, instructions }) => {
    // Check if the message is offensive.
    const configuration = new Configuration({ apiKey:apiKey,organization:OrganizationID});
    const openai = new OpenAIApi(configuration);
    const modResponse = await openai.createModeration({
      input: name + ": " + instructions,
    });

    const modResult = modResponse.data.results[0];
    if (modResult.flagged) {
      return "Flagged: " + flaggedCategories(modResult).join(", ");
    }
    await ctx.runMutation(internal.identity.add, { name, instructions });
    return null;
  },
});

const flaggedCategories = (modResult: CreateModerationResponseResultsInner) => {
  return Object.entries(modResult.categories)
    .filter(([, flagged]) => flagged)
    .map(([category]) => category);
};

export const chat = action({
  args: {
    body: v.string(),
    identityName: v.string(),
    threadId: v.id("threads"),
  },
  handler: async (ctx, { body, identityName, threadId }) => {
    const { instructions, messages, userMessageId, botMessageId } =
      await ctx.runMutation(internal.messages.send, {
        body,
        identityName,
        threadId,
      });
    const fail = (reason: string) =>
      ctx
        .runMutation(internal.messages.update, {
          messageId: botMessageId,
          patch: {
            error: reason,
          },
        })
        .then(() => {
          throw new Error(reason);
        });

    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);
    try {
      const modResponse = await openai.createModeration({
        input: body,
      });
      const modResult = modResponse.data.results[0];
      if (modResult.flagged) {
        await ctx.runMutation(internal.messages.update, {
          messageId: userMessageId,
          patch: {
            error:
              "Your message was flagged: " +
              flaggedCategories(modResult).join(", "),
          },
        });
        return;
      }
    } catch (e) {
      await fail(`${e}`);
    }

    const gptMessages = [];
    let lastInstructions = null;
    for (const { body, author, instructions } of messages) {
      if (instructions && instructions !== lastInstructions) {
        gptMessages.push({
          role: "system" as const,
          content: instructions,
        });
        lastInstructions = instructions;
      }
      gptMessages.push({ role: author, content: body });
    }
    if (instructions !== lastInstructions) {
      gptMessages.push({
        role: "system" as const,
        content: instructions ?? "You are a helpful assistant",
      });
      lastInstructions = instructions;
    }
    // This will first send the messages with the send mutation we modified, getting in return the list of messages and message ID to update with the bot’s message. It will then make a request to the gpt-3.5-turbo model, passing in one system message with instructions (hard-coded for now), followed by each message. We’re turning our body & author fields into “role” and “content”. See their docs here for more details on the API.

    // model="gpt-4-vision-preview",
    // const OrganizationID = "org-oDhTiyLPDwjVt51BGoxAb50z"
    const OPENAI_MODEL = "gpt-3.5-turbo"
    //const OPENAI_MODEL = "gpt-4";
    try {
      const openaiResponse = await openai.createChatCompletion({
        model: OPENAI_MODEL,
        messages: gptMessages,
      });
      await ctx.runMutation(internal.messages.update, {
        messageId: botMessageId,
        patch: {
          body: openaiResponse.data.choices[0].message?.content,
          usage: openaiResponse.data.usage,
          updatedAt: Date.now(),
          ms: Number(openaiResponse.headers["openai-processing-ms"]),
        },
      });
    } catch (e) {
      await fail(`OpenAI error: ${e}`);
    }
  },
});
