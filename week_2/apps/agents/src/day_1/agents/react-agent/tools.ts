import { tool } from "@langchain/core/tools"
import { z } from "zod"

const calculatorSchema = z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
    a: z.number(),
    b: z.number(),
})

export const calculator = tool(
    ({operation, a, b}) => {
    if (operation === "add") {
        return a + b;
    } else if (operation === "subtract") {
        return a - b;
    } else if (operation === "multiply") {
        return a * b;
    } else if (operation === "divide") {
        return a / b;
    }
    throw new Error("Invalid operation");
}, {
    name: "calculator",
    description: "A tool to calculate the sum, subtraction, multiplication, or division of two numbers",
    schema: calculatorSchema,
})

export const decomposeNumber = tool(
    ({number}) => {
        let splits = "";
        let strNumber = number.toString();
        let power = 0;
        for (let i = strNumber.length - 1; i >= 0; i--) {
            splits += parseInt(strNumber[i]) * Math.pow(10, power) + " + ";
            power++;
        }
        return splits;
    }, {
        name: "decomposeNumber",
        description: "A tool to decompose a number into units, tens, hundreds, etc.",
        schema: z.object({number: z.number()}),
    }
)

export const diceRoll = tool(
    ({size}) => {
        return Math.floor(Math.random() * size) + 1;
    }, {
        name: "diceRoll",
        description: "A tool to roll a dice of a given size",
        schema: z.object({size: z.number()}),
    }
)

export const TOOLS = [calculator, diceRoll, decomposeNumber]