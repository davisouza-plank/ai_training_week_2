import { HumanMessage } from "@langchain/core/messages";
import { RemoveMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, START, END, Command, GraphRecursionError } from "@langchain/langgraph";
import { filterMessages, trimMessages } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
});

const rootNode = async (state: typeof MessagesAnnotation.State) => {
    const messages = await llm.invoke(state.messages);
    console.log("messages");
    if ((state.messages.length + 1) > 3) {
        return new Command({ update: { messages: messages.content }, goto: "filter" });
    } else {
        return new Command({ update: { messages: messages.content }, goto: "trim" });
    }
};

const filterNode = async (state: typeof MessagesAnnotation.State) => {
    console.log("filtered messages", state.messages.length);
    
    filterMessages(state.messages, {
        excludeTypes: [
            "tool",
            "system",
        ],
    });
    return { };
};

const trimNode = async (state: typeof MessagesAnnotation.State) => {
    trimMessages(state.messages, {
        maxTokens: 1000,
        strategy: "last",
        tokenCounter: new ChatOpenAI({ modelName: "gpt-4o-mini" }),
    });
    console.log("trimmed messages");
    return { };
};

const deleterNode = async (state: typeof MessagesAnnotation.State) => {
    const messages = state.messages;
    if (messages.length > 3) {
        console.log("deleting messages");
        return { messages: messages.slice(0, -3).map(m => new RemoveMessage({ id: m.id! })) };
    }
    console.log("no messages to delete");
    return { };
};

export const graph = new StateGraph(MessagesAnnotation)
    .addNode("root", rootNode, { ends: ["filter", "trim"] })
    .addNode("filter", filterNode)
    .addNode("trim", trimNode)
    .addNode("deleter", deleterNode)
    .addEdge(START, "root")
    .addEdge("filter", "deleter")
    .addEdge("trim", END)
    .addEdge("deleter", END)
    .compile({ checkpointer });