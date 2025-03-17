/**
 * LLMs can sometimes work simultaneously on a task and have their outputs aggregated
 * programmatically. This workflow, parallelization, manifests in two key variations:
 * Sectioning: Breaking a task into independent subtasks run in parallel. Voting:
 * Running the same task multiple times to get diverse outputs.
 *
 * When to use this workflow: Parallelization is effective when the divided subtasks
 * can be parallelized for speed, or when multiple perspectives or attempts are needed
 * for higher confidence results. For complex tasks with multiple considerations, LLMs
 * generally perform better when each consideration is handled by a separate LLM call,
 * allowing focused attention on each specific aspect.
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
    pro_essay: Annotation<string>,
    counter_essay: Annotation<string>,
    neutral_essay: Annotation<string>,
})

async function generateProEssay(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke(`Write a essay of two paragraphs favorable about ${state.messages[state.messages.length - 1].content}, you should be very positive about the topic`)
    return { pro_essay: messages.content };
}

async function generateCounterEssay(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke(`Write a essay of two paragraphs counter to the ${state.messages[state.messages.length - 1].content}, you should be very negative about the topic`)
    return { counter_essay: messages.content };
}

async function generateNeutralEssay(state: typeof StateAnnotation.State) {
    const messages = await LLM.invoke(`Write a essay of two paragraphs neutral to the ${state.messages[state.messages.length - 1].content}`)
    return { neutral_essay: messages.content };
}

async function generateConclusion(state: typeof StateAnnotation.State) {
    return { messages: ["Pro Essay: " + state.pro_essay + "\n\nCounter Essay: " + state.counter_essay + "\n\nNeutral Essay: " + state.neutral_essay] };
}

export const graph = new StateGraph(StateAnnotation)
    .addNode("generateProEssay", generateProEssay)
    .addNode("generateCounterEssay", generateCounterEssay)
    .addNode("generateNeutralEssay", generateNeutralEssay)
    .addNode("generateConclusion", generateConclusion)
    .addEdge(START, "generateProEssay")
    .addEdge(START, "generateCounterEssay")
    .addEdge(START, "generateNeutralEssay")
    .addEdge("generateProEssay", "generateConclusion")
    .addEdge("generateCounterEssay", "generateConclusion")
    .addEdge("generateNeutralEssay", "generateConclusion")
    .addEdge("generateConclusion", END)
    .compile();