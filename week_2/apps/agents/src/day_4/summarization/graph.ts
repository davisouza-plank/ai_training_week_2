import { HumanMessage, RemoveMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, START, END, Command, GraphRecursionError } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
});

const rootNode = async (state: typeof MessagesAnnotation.State) => {
    const messages = await llm.invoke(`Just add questions to the conversation, someone will answer. ${state.messages[state.messages.length - 1].content }`);
    console.log(state.messages.length);
    console.log(messages.content);
    if (state.messages.length < 5) {
        return new Command({ update: { messages: messages.content }, goto: "text" });
    } else {
        return new Command({ update: { messages: messages.content }, goto: "summarize" });
    }
};

const textNode = async (state: typeof MessagesAnnotation.State) => {
    const messages = await llm.invoke(`Answer the question asked: ${state.messages[state.messages.length - 1].content}`);
    console.log(messages.content);
    return { messages };
};

const summarizeNode = async (state: typeof MessagesAnnotation.State) => {
    const messages = await llm.invoke(`Summarize the content of the discussion: \n ${state.messages.map(m => m.content).join("\n")}`);
    const newMessages = [...state.messages.map(m => new RemoveMessage({ id: m.id! })), new HumanMessage(messages.content.toString())];
    return { messages: newMessages };
};

export const graph = new StateGraph(MessagesAnnotation)
    .addNode("root", rootNode, { ends: ["text", "summarize"] })
    .addNode("text", textNode)
    .addNode("summarize", summarizeNode)
    .addEdge(START, "root")
    .addEdge("text", "root")
    .addEdge("summarize", END)
    .compile();

    try{
        await graph.invoke({ messages: [new HumanMessage("Hello, talk about philosophy of the mind")] }, { recursionLimit: 9, configurable: { thread_id: "1" } });
    } catch (error) {
        if (error instanceof GraphRecursionError) {
            console.log("Recursion Error");
        } else {
            console.log(error);
        }
    }