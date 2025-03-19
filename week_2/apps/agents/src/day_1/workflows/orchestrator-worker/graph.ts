/**
 * In the orchestrator-workers workflow, a central LLM dynamically breaks down tasks,
 * delegates them to worker LLMs, and synthesizes their results.
 * 
 * When to use this workflow: This workflow is well-suited for complex tasks where you
 * can't predict the subtasks needed (in coding, for example, the number of files that
 * need to be changed and the nature of the change in each file likely depend on the
 * task). Whereas it's topographically similar, the key difference from parallelization
 * is its flexibility—subtasks aren't pre-defined, but determined by the orchestrator
 * based on the specific input.
 */

import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, START, END, Send } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const LLM = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});


const sectionSchema = z.object({
    name: z.string().describe("The name of the section"),
    description: z.string().describe("Brief overview of the section, the main topics and concepts to be covered in this section."),
});

const sectionsSchema = z.object({
    sections: z.array(sectionSchema).describe("Sections of the report")
});

const planner = LLM.withStructuredOutput(sectionsSchema);

// Graph State (Shared between nodes)
const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>,
    sections: Annotation<Array<z.infer<typeof sectionSchema>>>,
    completedSections: Annotation<string[]>({
        default: () => [],
        reducer: (a, b) => a.concat(b),
    }),
    finalReport: Annotation<string>,
});

// Worker State (Per-node state)
const WorkerStateAnnotation = Annotation.Root({
    section: Annotation<z.infer<typeof sectionSchema>>,
    completedSections: Annotation<string[]>({
        default: () => [],
        reducer: (a, b) => a.concat(b),
    }),
});

async function orchestrator(state: typeof StateAnnotation.State) {
    const reportSections = await planner.invoke([
        { role: "system", content: "You are a helpful assistant that plans reports. Generate a plan for the report" },
        { role: "user", content: `The topic of the report is: ${state.messages[state.messages.length - 1].content}` },
    ]);

    return {
        sections: reportSections.sections,
    };
}

async function worker(state: typeof WorkerStateAnnotation.State) {
    const section = await LLM.invoke([
        { role: "system", content: "You are a helpful assistant that writes report sections. Include no preamble for each section. Write a reporte section following the provided name and description." },
        { role: "user", content: `The section name is: ${state.section.name} and the description is: ${state.section.description}` }
    ]);

    return {
        completedSections: [section.content],
    };
}

async function synthesizer(state: typeof StateAnnotation.State) {
    const completedSections = state.completedSections;
    const completedReportSections = completedSections.join("\n\n");

    return {
        finalReport: completedReportSections,
        messages: [new AIMessage(completedReportSections)],
    };
}

function assignWorkers(state: typeof StateAnnotation.State) {
    return state.sections.map((section) => new Send("worker", { section }));
}

export const graph = new StateGraph(StateAnnotation)
    .addNode("orchestrator", orchestrator)
    .addNode("worker", worker)
    .addNode("synthesizer", synthesizer)
    .addEdge(START, "orchestrator")
    .addConditionalEdges("orchestrator", assignWorkers, ["worker"])
    .addEdge("worker", "synthesizer")
    .addEdge("synthesizer", END)
    .compile();


