import { expect, it } from "@jest/globals";
import { calculator, diceRoll, decomposeNumber } from "../tools.js";

it("Test", async () => {
    const result = await calculator.invoke({operation: "add", a: 1, b: 2});
    expect(result).toBe(3);
});

it("Test", async () => {
    const result = await diceRoll.invoke({size: 6});
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(7);
});

it("Test", async () => {
    const result = await decomposeNumber.invoke({number: 123});
    expect(result).toBe("100 + 20 + 3");
});


