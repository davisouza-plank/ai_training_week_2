import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
}).bindTools(TOOLS);

const toolNode = new ToolNode(TOOLS);

function shouldContinue({messages}: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
        return "tools";
    } 

    return "__end__";
}

async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...state.messages
    ]);

    return {messages: [response]};
}

export const graph = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addNode("tools", toolNode)
  .addEdge("tools", "model")
  .addEdge("__start__", "model")
  .addConditionalEdges("model", shouldContinue)
  .compile();