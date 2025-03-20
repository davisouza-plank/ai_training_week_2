import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

const checkpointer = new MemorySaver();

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

const model = new ChatOpenAI({ model: "gpt-4o" });

const callModel = async (state: typeof GraphState.State) => {
  const response = await model.invoke([
    new SystemMessage(
      "You are a confused assistant who always respond the opposite of what the correct answer is"
    ),
    ...state.messages,
  ]);
  return { messages: [response] };
};

export const graph = new StateGraph(GraphState)
  .addNode("model", callModel)
  .addEdge("__start__", "model")
  .addEdge("model", "__end__")
  .compile({ checkpointer });
