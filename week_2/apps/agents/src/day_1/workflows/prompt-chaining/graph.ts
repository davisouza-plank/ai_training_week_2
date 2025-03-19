/**
 * Prompt chaining decomposes a task into a sequence of steps, where each LLM call
 * processes the output of the previous one. You can add programmatic checks (see
 * "gate" in the diagram below) on any intermediate steps to ensure that the process
 * is still on track.
 *
 * When to use this workflow: This workflow is ideal for situations where the task
 * can be easily and cleanly decomposed into fixed subtasks. The main goal is to
 * trade off latency for higher accuracy, by making each LLM call an easier task.
 */
import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const LLM = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>,
    topic: Annotation<string>,
    essay: Annotation<string>,
    counter: Annotation<string>,
    conclusion: Annotation<string>,
})

async function generateTopic(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke([
        {
            role: "system",
            content: "You are a helpful assistant that can generate a topic for an essay from the user's question. The topic should be a single sentence that is no more than 10 words. You should allow for arguments and counter arguments."
        },
        {
            role: "user",
            content: state.messages[state.messages.length - 1].content
        }
    ])
    return { topic: messages.content };
}

async function generateEssay(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke(`Write a two paragraph essay about ${state.topic}`)
    return { essay: messages.content };
}

async function generateCounter(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke(`Write a counter argument to the essay ${state.essay}`)
    return { counter: messages.content };
}

async function generateConclusion(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke(`Write a conclusion to the essay ${state.essay} and ${state.counter}`)
    return { messages: [state.essay + "\n" + state.counter + "\n" + messages.content], conclusion: messages.content };
}

function isEssay(state: typeof StateAnnotation.State) {
    return state.messages[state.messages.length - 1].content.toString().includes("essay") ? "valid" : "invalid";
}

function isTopic(state: typeof StateAnnotation.State) {
    return state.messages[state.messages.length - 1].content.toString().split(" ").length < 10 ? "valid" : "invalid";
}

export const graph = new StateGraph(StateAnnotation)
    .addNode("generateTopic", generateTopic)
    .addNode("generateEssay", generateEssay)
    .addNode("generateCounter", generateCounter)
    .addNode("generateConclusion", generateConclusion)
    .addConditionalEdges(START, isEssay, {
        "valid": "generateTopic",
        "invalid": END
    })
    .addConditionalEdges("generateTopic", isTopic, {
        "valid": "generateEssay",
        "invalid": END
    })
    .addEdge("generateEssay", "generateCounter")
    .addEdge("generateCounter", "generateConclusion")
    .addEdge("generateConclusion", END)
    .compile();
