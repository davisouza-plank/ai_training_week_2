/**
 * Routing classifies an input and directs it to a specialized followup task. This
 * workflow allows for separation of concerns, and building more specialized prompts.
 * Without this workflow, optimizing for one kind of input can hurt performance on
 * other inputs.
 *
 * When to use this workflow: Routing works well for complex tasks where there are
 * distinct categories that are better handled separately, and where classification
 * can be handled accurately, either by an LLM or a more traditional classification
 * model/algorithm.
 */

import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PROMPTS } from "./prompts.js";
import { HumanMessage } from "@langchain/core/messages";
const LLM = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

const routeSchema = z.object({
    step: z.enum(["etymology", "trivia", "acronym"]).describe("The next step to take in the workflow"),
});

const router = LLM.withStructuredOutput(routeSchema);

const StateAnnotation = Annotation.Root({
    messages: Annotation<HumanMessage[]>,
    decision: Annotation<string>,
    output: Annotation<string>,
});

async function callRouter(state: typeof StateAnnotation.State) {
    console.log("state", state);
    const response = await router.invoke([
        {
            role: "system",
            content: PROMPTS[0],
        },
        {
            role: "user",
            content: state.messages[0].content,
        },
    ]);
    return { decision: response.step };
}

async function callEtymology(state: typeof StateAnnotation.State) {
    const response = await LLM.invoke([
        {
            role: "system",
            content: PROMPTS[1],
        },
        {
            role: "user",
            content: state.messages[0].content,
        },
    ]);
    return { messages: [response] };
}

async function callTrivia(state: typeof StateAnnotation.State) {
    const response = await LLM.invoke([
        {
            role: "system",
            content: PROMPTS[2],
        },
        {
            role: "user",
            content: state.messages[0].content,
        },
    ]);
    return { messages: [response] };
}

async function callAcronym(state: typeof StateAnnotation.State) {
    const response = await LLM.invoke([
        {
            role: "system",
            content: PROMPTS[3],
        },
        {
            role: "user",
            content: state.messages[0].content,
        },
    ]);
    return { messages: [response] };
}

function routeMessage(state: typeof StateAnnotation.State) {
    if (state.decision === "etymology") {
        return "callEtymology";
    }
    if (state.decision === "trivia") {
        return "callTrivia";
    }
    if (state.decision === "acronym") {
        return "callAcronym";
    }
    return END;
}

export const graph = new StateGraph(StateAnnotation)
    .addNode("callRouter", callRouter)
    .addNode("callEtymology", callEtymology)
    .addNode("callTrivia", callTrivia)
    .addNode("callAcronym", callAcronym)
    .addEdge(START, "callRouter")
    .addEdge("callEtymology", END)
    .addEdge("callTrivia", END)
    .addEdge("callAcronym", END)
    .addConditionalEdges("callRouter", routeMessage)
    .compile();


