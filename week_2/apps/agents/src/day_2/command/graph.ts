import { Annotation, Command } from "@langchain/langgraph";
import { StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const LLM = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

// Define graph state
const StateAnnotation = Annotation.Root({
    messages: Annotation<string[]>,
    greeting: Annotation<string>,
});

// Define the nodes
const greetingNode = async (_state: typeof StateAnnotation.State) => {
  console.log("Called A");
  // this is a replacement for a real conditional edge function
  const goto = Math.random() > .5 ? "funnyGreeting" : "sadGreeting";
  // note how Command allows you to BOTH update the graph state AND route to the next node
  return new Command({
    // this is the state update
    update: {
      greeting: "Greeting: ",
    },
    // this is a replacement for an edge
    goto,
  });
};

// Nodes B and C are unchanged
const funnyGreeting = async (state: typeof StateAnnotation.State) => {
  const result = await LLM.invoke(`Write a funny greeting to the user`);
  return {
    messages: [result],
    greeting: state.greeting + result,
  };
}

const sadGreeting = async (state: typeof StateAnnotation.State) => {
  const result = await LLM.invoke(`Write a sad greeting to the user`);
  return {
    messages: [result],
    greeting: state.greeting + result,
  };
}


// NOTE: there are no edges between nodes A, B and C!
export const graph = new StateGraph(StateAnnotation)
  .addNode("greetingNode", greetingNode, {
    ends: ["funnyGreeting", "sadGreeting"],
  })
  .addNode("funnyGreeting", funnyGreeting)
  .addNode("sadGreeting", sadGreeting)
  .addEdge("__start__", "greetingNode")
  .compile();