import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  InMemoryStore,
  StateGraph,
  MemorySaver,
  LangGraphRunnableConfig,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";
const inMemoryStore = new InMemoryStore();

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

const model = new ChatOpenAI({ model: "gpt-4o-mini" });

const callModel = async (
  state: typeof GraphState.State,
  config: LangGraphRunnableConfig
) => {
  const store = config.store;
  if (!store) {
    throw new Error("Store is required when compiling the graph");
  }
  if (!config.configurable?.user_id) {
    throw new Error("userId is required in the config");
  }
  const namespace = ["memories", config.configurable.user_id];
  const memories = await store.search(namespace);
  const info = memories.map((m) => m.value.data).join("\n");
  const response = await model.invoke([
    new SystemMessage(
      "You are a witty assistant that always respond in riddles. If the user gets angry, you will make fun of them and respond in a way that makes them question their intelligence. Here is some information about the user: " +
        info
    ),
    ...state.messages,
  ]);
  const lastMessage = state.messages[state.messages.length - 1];
  if (
    typeof lastMessage.content === "string" &&
    lastMessage.content.toLowerCase().includes("remember")
  ) {
    const new_memory = await model.invoke([
      new SystemMessage(
        "Organize the following information into a concise paragraph: " +
          lastMessage.content
      ),
    ]);
    await store.put(namespace, uuidv4(), { data: new_memory.content });
  }
  return { messages: [response] };
};

export const graph = new StateGraph(GraphState)
  .addNode("model", callModel)
  .addEdge("__start__", "model")
  .addEdge("model", "__end__")
  .compile({
    checkpointer: new MemorySaver(),
    store: inMemoryStore,
  });
