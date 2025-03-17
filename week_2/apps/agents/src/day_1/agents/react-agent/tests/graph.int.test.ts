import { it, expect } from "@jest/globals";
import { BaseMessage } from "@langchain/core/messages";

import { graph } from "../graph.js";

it("Simple runthrough", async () => {
  const res = await graph.invoke({
    messages: [
      {
        role: "user",
        content: "Decompose 3462 and multiply its parts",
      },
    ],
  });
  expect(
    res.messages.find((message: BaseMessage) => message.getType() === "tool"),
  ).toBeDefined();
});
