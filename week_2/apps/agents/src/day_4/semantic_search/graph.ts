import { OpenAIEmbeddings } from "@langchain/openai";
import { InMemoryStore, LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { tool } from "@langchain/core/tools";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const store = new InMemoryStore({
  index: {
    embeddings,
    dims: 1536,
  }
});

let namespace = ["user_123", "memories"]
let memoryKey = "favorite_food"
let memoryValue = {"text": "I love pizza"}

await store.put(namespace, memoryKey, memoryValue)

await store.put(
    ["user_123", "memories"],
    "italian_food",
    {"text": "I prefer Italian food"}
  )
  await store.put(
    ["user_123", "memories"],
    "spicy_food",
    {"text": "I don't like spicy food"}
  )
  await store.put(
    ["user_123", "memories"],
    "occupation",
    {"text": "I am an airline pilot"}
  )
  
  // That occupation is too lofty - let's overwrite
  // it with something more... down-to-earth
  await store.put(
    ["user_123", "memories"],
    "occupation",
    {"text": "I am a tunnel engineer"}
  )
  
  // now let's check that our occupation memory was overwritten
  const occupation = await store.get(["user_123", "memories"], "occupation")
  console.log(occupation?.value.text)

  const memories = await store.search(["user_123", "memories"], {
    query: "What is my occupation?",
    limit: 3,
  });
  
  for (const memory of memories) {
    console.log(`Memory: ${memory.value.text} (similarity: ${memory.score})`);
  }

const upsertMemoryTool = tool(async (
  { content },
  config: LangGraphRunnableConfig
): Promise<string> => {
  const store = config.store as InMemoryStore;
  if (!store) {
    throw new Error("No store provided to tool.");
  }
  await store.put(
    ["user_123", "memories"],
    uuidv4(), // give each memory its own unique ID
    { text: content }
  );
  return "Stored memory.";
}, {
  name: "upsert_memory",
  schema: z.object({
    content: z.string().describe("The content of the memory to store."),
  }),
  description: "Upsert long-term memories.",
});

import { MessagesAnnotation } from "@langchain/langgraph";

const addMemories = async (
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig
) => {
  const store = config.store as InMemoryStore;

  if (!store) {
    throw new Error("No store provided to state modifier.");
  }

  // Search based on user's last message
  const items = await store.search(
    ["user_123", "memories"], 
    { 
      // Assume it's not a complex message
      query: state.messages[state.messages.length - 1].content as string,
      limit: 4 
    }
  );


  const memories = items.length 
    ? `## Memories of user\n${
      items.map(item => `${item.value.text} (similarity: ${item.score})`).join("\n")
    }`
    : "";

  // Add retrieved memories to system message
  return [
    { role: "system", content: `You are a helpful assistant.\n${memories}` },
    ...state.messages
  ];
};

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const agent = createReactAgent({
  llm: new ChatOpenAI({ model: "gpt-4o-mini" }),
  tools: [upsertMemoryTool],
  prompt: addMemories,
  store: store
});

let result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: "I'm hungry. What should I eat?",
      },
    ],
  });

  import {
    BaseMessage,
    isSystemMessage,
    isAIMessage,
    isHumanMessage,
    isToolMessage,
    AIMessage,
    HumanMessage,
    ToolMessage,
    SystemMessage,
  } from "@langchain/core/messages";
  
  function printMessages(messages: BaseMessage[]) {
    for (const message of messages) {
      if (isSystemMessage(message)) {
        const systemMessage = message as SystemMessage;
        console.log(`System: ${systemMessage.content}`);
      } else if (isHumanMessage(message)) {
        const humanMessage = message as HumanMessage;
        console.log(`User: ${humanMessage.content}`);
      } else if (isAIMessage(message)) {
        const aiMessage = message as AIMessage;
        if (aiMessage.content) {
          console.log(`Assistant: ${aiMessage.content}`);
        }
        if (aiMessage.tool_calls) {
          for (const toolCall of aiMessage.tool_calls) {
            console.log(`\t${toolCall.name}(${JSON.stringify(toolCall.args)})`);
          }
        }
      } else if (isToolMessage(message)) {
        const toolMessage = message as ToolMessage;
        console.log(
          `\t\t${toolMessage.name} -> ${JSON.stringify(toolMessage.content)}`
        );
      }
    }
  }
  
  printMessages(result.messages);