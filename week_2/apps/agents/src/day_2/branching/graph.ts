import { Annotation, StateGraph, START, END, Command } from "@langchain/langgraph";

const ConditionalBranchingAnnotation = Annotation.Root({
    aggregate: Annotation<string[]>({
      reducer: (x, y) => x.concat(y),
    }),
    which: Annotation<string>({
      reducer: (x: string, y: string) => (y ?? x),
    })
  })
  
  // Create the graph
  const routingNode = (state: typeof ConditionalBranchingAnnotation.State) => {
    console.log(`Adding I'm A to ${state.aggregate}`);
    const goto = state.which === "cd" ? ["c", "d"] : ["b", "c"];
    return new Command({
        update: { aggregate: [`I'm A`] },
        goto,
    });
  };
  const nodeB2 = (state: typeof ConditionalBranchingAnnotation.State) => {
    console.log(`Adding I'm B to ${state.aggregate}`);
    return { aggregate: [`I'm B`] };
  };
  const nodeC2 = (state: typeof ConditionalBranchingAnnotation.State) => {
    console.log(`Adding I'm C to ${state.aggregate}`);
    return { aggregate: [`I'm C`] };
  };
  const nodeD2 = (state: typeof ConditionalBranchingAnnotation.State) => {
    console.log(`Adding I'm D to ${state.aggregate}`);
    return { aggregate: [`I'm D`] };
  };
  const nodeE2 = (state: typeof ConditionalBranchingAnnotation.State) => {
    console.log(`Adding I'm E to ${state.aggregate}`);
    return { aggregate: [`I'm E`] };
  };
  
  export const graph = new StateGraph(ConditionalBranchingAnnotation)
    .addNode("a", routingNode, { ends: ["b", "c", "d"] })
    .addEdge(START, "a")
    .addNode("b", nodeB2)
    .addNode("c", nodeC2)
    .addNode("d", nodeD2)
    .addNode("e", nodeE2)
    .addEdge("b", "e")
    .addEdge("c", "e")
    .addEdge("d", "e")
    .addEdge("e", END)
    .compile();