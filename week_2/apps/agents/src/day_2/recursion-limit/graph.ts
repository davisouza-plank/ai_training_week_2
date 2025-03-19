import { StateGraph, Annotation, GraphRecursionError } from "@langchain/langgraph";

// Define the state with a reducer
const StateAnnotationWithLoops = Annotation.Root({
  ongoingTaskId: Annotation<number>,
  tasks: Annotation<string[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),
  currentTask: Annotation<string[]>,
});

// Define nodes
const nodeA = async function (state: typeof StateAnnotationWithLoops.State) {
  console.log(`Node A sees ${state.tasks}`);
  if (state.ongoingTaskId === undefined) {
    return { currentTask: ["A"], ongoingTaskId: 1 };
  } else {
    return { currentTask: ["A"], ongoingTaskId: state.ongoingTaskId + 1, tasks: state.currentTask};
  }
}

const nodeB = async function (state: typeof StateAnnotationWithLoops.State) {
  console.log(`Node B sees ${state.tasks}`);
  return { currentTask: state.currentTask.concat(["B"]) };
}

const nodeC = async function (state: typeof StateAnnotationWithLoops.State) {
  console.log(`Node C sees ${state.tasks}`);
  return { tasks: state.currentTask.concat(["C"]) };
}

const nodeD = async function (state: typeof StateAnnotationWithLoops.State) {
  console.log(`Node D sees ${state.tasks}`);
  return { currentTask: state.currentTask.concat(["D"]) };
}

// Define edges
const loopRouter = async function (state: typeof StateAnnotationWithLoops.State) {
  if (state.ongoingTaskId < 2) {
    return "b";
  } else {
    return "__end__";
  }
}

// Define the graph
export const graph = new StateGraph(StateAnnotationWithLoops)
  .addNode("a", nodeA)
  .addNode("b", nodeB)
  .addNode("c", nodeC)
  .addNode("d", nodeD)
  .addEdge("__start__", "a")
  .addConditionalEdges("a", loopRouter)
  .addEdge("b", "c")
  .addEdge("c", "d")
  .addEdge("d", "a")
  .compile();


try {
  await graph.invoke({ tasks: [] }, { recursionLimit: 9 });
} catch (error) {
  if (error instanceof GraphRecursionError) {
    console.log("Recursion Error");
  } else {
    throw error;
  }
}