import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({ model: "gpt-4o-mini" });
// ... define the graph
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

const rootNode = async (state: typeof GraphState.State) => {
  const response = await model.invoke([
    new SystemMessage("You are a helpful assistant"),
    ...state.messages,
  ]);
  return { messages: [response] };
};

import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}
const pool = new Pool({
  connectionString: connectionString,
});

const checkpointer = new PostgresSaver(pool); // postgres checkpointer (see examples below)


try {
  await checkpointer.setup();
} catch (e) {
  // ignore, it's ok if the table already exists
}

export const graph = new StateGraph(GraphState)
  .addNode("root", rootNode)
  .addEdge("__start__", "root")
  .addEdge("root", "__end__")
  .compile({ checkpointer });
