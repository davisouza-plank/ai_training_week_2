import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import {
  START,
  END,
  StateGraph,
  messagesStateReducer,
  Annotation,
  Command,
  MemorySaver,
  Send,
} from "@langchain/langgraph";
import { z } from "zod";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const LLM = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
});

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  step: Annotation<string>(),
});

const frontlineSchema = z.object({
  messages: z.string().describe("The customer's message better formatted to describe the problem to the next step"),
  step: z.enum(["billing", "technical", "__end__"]).describe("The step of the customer's message. Redirect to billing or technical support if it is billing or technical related. Otherwise, redirect to end."),
});

const refundTool = tool(
  () => {
    const rand = Math.random();
    return rand <= 0.3;
  },
  {
    name: "refund",
    description: "Refunds a customer",
    schema: z.object({
      amount: z.number(),
    }),
  }
);

const frontlineSupportNode = async (state: typeof GraphState.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1].content;
  const decision = await LLM.withStructuredOutput(frontlineSchema).invoke(
    `You are a frontline support agent for Australis, an antarctic SaaS company.
     You are given a customer's message. 
     You need to decide if the customer's problem is billing or technical related. 
    If it is not, you need to answer the customer's question as long as it is related to Australis, or guide the user conversation out of any non-Australis related topic.
    Customer's message: ${lastMessage}`
  );

  return new Command({
    update: {
      messages: new AIMessage(decision.messages)
    },
    goto: decision.step,
  });
};

const technicalSupportNode = async (state: typeof GraphState.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1].content;
  const decision = await LLM.invoke(
    [
        new SystemMessage(
            `You are a technical support agent for Australis, an antarctic SaaS company.
            You are given a customer's message about a technical issue.
            Answer the customer's question to the best of your ability.`
        ),
        new HumanMessage(lastMessage.toString())
    ]
  );

  return {
    messages: decision,
    technical: true,
  };
};

const billingSupportNode = async (state: typeof GraphState.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1].content;
  const decision = await LLM.bindTools([refundTool]).invoke(
    [
        new SystemMessage(
            `You are a billing support agent for Australis, an antarctic SaaS company. 
            You are given a customer's message. 
            You need to decide if the customer's problem is refund related. 
            If it is, you need to use the tools available to you to refund the customer.
            Your tools are:
            ${refundTool.name}: ${refundTool.description}
            If it is not, you must answer the customer's question.`
        ),
        new HumanMessage(lastMessage.toString())
    ]
  );
  return { messages: new AIMessage(decision) };
};

export const graph = new StateGraph(GraphState)
  .addNode("frontline", frontlineSupportNode, {
    ends: ["billing", "technical", END],
  })
  .addNode("billing", billingSupportNode)
  .addNode("technical", technicalSupportNode)
  .addEdge(START, "frontline")
  .addEdge("billing", END)
  .addEdge("technical", END)
  .compile({ checkpointer: new MemorySaver()});
