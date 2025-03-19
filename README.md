# LangGraph Examples Project

This project demonstrates various patterns and use cases for building applications with LangGraph. It includes both a web interface for chatting with agents and a studio interface for testing and debugging graphs.

## Project Structure

```
week_2/
├── apps/
│   ├── agents/             # Custom agent implementations
│   │   └── src/
│   │       ├── day_1/     # Day 1 agent implementations
│   │       │   ├── agents/    # Basic agent implementations
│   │       │   │   └── react-agent/     # React-based agent implementation
│   │       │   └── workflows/ # Basic workflow implementations
│   │       │       ├── parallelization/     # Parallel execution workflow
│   │       │       ├── evaluator-optimizer/ # Evaluation and optimization workflow
│   │       │       ├── orchestrator-worker/ # Orchestrator-worker pattern
│   │       │       ├── prompt-chaining/     # Prompt chaining workflow
│   │       │       └── routing/             # Dynamic routing workflow
│   │       └── day_2/     # Day 2 agent implementations
│   │           ├── branching/       # Branching pattern example
│   │           ├── command/         # Command pattern example
│   │           ├── map-reduce/      # Map-reduce pattern example
│   │           └── recursion-limit/ # Recursion control example
│   └── web/               # Web interface implementation
├── .env                   # Environment configuration
├── package.json          # Project dependencies and scripts
└── langgraph.json       # LangGraph configuration
```

## Available Custom Agents

1. **Branching Agent**: Demonstrates conditional routing and parallel execution
   - Uses scored nodes and dynamic path selection
   - Supports parallel execution of nodes

2. **Command Agent**: Shows how to use Commands for state and routing
   - Implements subgraph navigation
   - Demonstrates dynamic routing between nodes

3. **Map-Reduce Agent**: Implements parallel processing pattern
   - Generates jokes about topics using map-reduce
   - Shows parallel task execution and result aggregation

4. **Recursion-Limit Agent**: Shows how to control recursive flows
   - Implements counting with recursion limits
   - Demonstrates state management across iterations

5. **Orchestrator-Worker Agent**: Implements a workflow where an orchestrator manages multiple worker agents
   - Coordinates tasks and aggregates results from workers

6. **Evaluator-Optimizer Agent**: Implements a feedback-driven optimization system
   - Evaluates outputs and iteratively improves them based on defined criteria

7. **Parallelization Agent**: Demonstrates how to run multiple tasks in parallel
   - Efficiently manages concurrent executions to optimize performance

8. **Prompt Chaining Agent**: Shows how to chain multiple prompts together
   - Passes outputs from one prompt as inputs to the next for complex workflows

9. **Routing Agent**: Implements dynamic routing based on input conditions
   - Directs execution flow to different nodes based on user input or state

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

This will start:
- Web interface at http://localhost:3000
- LangGraph Studio at http://localhost:2024

## Using the Web Interface

The web interface provides two main ways to interact with agents:

1. **Chat Interface** (http://localhost:3000):
   - Select an agent from the dropdown
   - Currently supports basic chat functionality
   - Note: Custom model support is limited in the chat interface

2. **Studio Interface** (http://localhost:2024):
   - Full support for all custom agents
   - Provides visualization and debugging tools
   - Recommended for testing custom agents

### Environment Setup

Create a `.env` file with your API keys (you can copy from .env.example):
```env
OPENAI_API_KEY=your_key_here
```

## Custom Agents in Studio

While the chat interface has limited support for custom models, all custom agents are available in the LangGraph Studio:

1. Run the project with `npm run dev`
2. If you've set the env variables right, a tab will open on Langsmith Studio
3. Select an agent from the dropdown:
   - branching
   - command
   - map-reduce
   - recursion-limit
   - orchestrator-worker
   - evaluator-optimizer
   - parallelization
   - prompt_chaining
   - routing
4. Test the agent with different inputs
5. Use the visualization tools to debug and understand the flow

## Development

The project is organized by days, with different agent implementations for each day:

1. Day 1 (`apps/agents/src/day_1/`):
   - Initial agent implementations and basic patterns

2. Day 2 (`apps/agents/src/day_2/`):
   - Advanced agent implementations and patterns

To add a new agent implementation:

1. Create a new directory in the appropriate day folder
2. Implement the graph logic
3. Add configuration as needed
4. Update documentation to reflect the new implementation

## Troubleshooting

- If agents don't appear in the dropdown, restart the LangGraph server
- Clear browser cache if you see outdated agent names
- Check the console for any API key or configuration errors

## Contributing

Feel free to contribute by:
1. Adding new agent implementations
2. Improving existing implementations
3. Enhancing documentation
4. Adding tests

## License

MIT