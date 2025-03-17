/**
 * In the evaluator-optimizer workflow, one LLM call generates a response while another
 * provides evaluation and feedback in a loop.
 * 
 * When to use this workflow: This workflow is particularly effective when we have clear
 * evaluation criteria, and when iterative refinement provides measurable value. The two
 * signs of good fit are, first, that LLM responses can be demonstrably improved when a
 * human articulates their feedback; and second, that the LLM can provide such feedback.
 * This is analogous to the iterative writing process a human writer might go through
 * when producing a polished document.
 */

import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const LLM = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>,
    argument: Annotation<string>,
    feedback: Annotation<string>,
    appealingOrNot: Annotation<string>,
});

const feedbackSchema = z.object({
    feedback: z.string().describe("If the argument is not appealing, provide feedback on why it is not appealing."),
    appealingOrNot: z.enum(["appealing", "not appealing"]).describe("Whether the response is appealing or not"),
});

const evaluator = LLM.withStructuredOutput(feedbackSchema);

async function callGenerator(state: typeof StateAnnotation.State) {
    let msg;
    if (state.feedback) {
        msg = await LLM.invoke(`Write an appealing argument with a positive tone for the following topic: ${state.messages[state.messages.length - 1].content}. But take into account the following feedback: ${state.feedback}`);
    } else {
        msg = await LLM.invoke(`Write an appealing argument with a positive tone for the following topic: ${state.messages[state.messages.length - 1].content}`);
    }

    return {
        argument: msg.content,
        feedback: undefined,
        appealingOrNot: undefined,
    };
}

async function callEvaluator(state: typeof StateAnnotation.State) {
    const grade = await evaluator.invoke([
        { role: "system", content: "You are a helpful assistant that evaluates arguments." },
        { role: "user", content: `Evaluate the argument: ${state.argument} about the topic: ${state.messages[state.messages.length - 1].content}` },
    ]);

    if (grade.appealingOrNot === "appealing") {
        return {
            messages: [...state.messages, new AIMessage(state.argument)],
            feedback: grade.feedback,
            appealingOrNot: grade.appealingOrNot,
        };
    } else {
        return {
            feedback: grade.feedback,
            appealingOrNot: grade.appealingOrNot,
        };
    }
}

function isAppealing(state: typeof StateAnnotation.State) {
    return state.appealingOrNot === "appealing" ? "approved" : "rejected";
}

export const graph = new StateGraph(StateAnnotation)
    .addNode("generator", callGenerator)
    .addNode("evaluator", callEvaluator)
    .addEdge(START, "generator")
    .addEdge("generator", "evaluator")
    .addConditionalEdges("evaluator", isAppealing, {
        "approved": END,
        "rejected": "generator",
    })
    .compile();
