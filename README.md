# LangGraph Examples Project

This project demonstrates various patterns and use cases for building applications with LangGraph. It includes both a web interface for chatting with agents and a studio interface for testing and debugging graphs.

## Project Structure

```
.
├── week_2/                # Main project directory
│   ├── apps/
│   │   ├── agents/       # Custom agent implementations
│   │   │   └── src/
│   │   │       ├── day_1/  # Day 1 implementations
│   │   │       ├── day_2/  # Day 2 implementations
│   │   │       ├── day_3/  # Day 3 implementations
│   │   │       └── day_4/  # Day 4 implementations
│   │   └── web/         # Next.js web application
│   ├── .env             # Environment configuration
│   ├── package.json     # Project dependencies and scripts
│   └── langgraph.json   # LangGraph configuration
```

## Available Custom Agents

### Day 1 - Basic Patterns
1. **React Agent**: Basic ReAct pattern implementation
   - Implements tool usage and reasoning
   - Includes calculator, dice roll, and number decomposition tools

2. **Orchestrator-Worker**: Implements distributed task processing
   - Coordinates report generation across multiple workers
   - Demonstrates task distribution and result aggregation

3. **Routing Agent**: Implements dynamic routing based on input
   - Handles etymology, trivia, and acronym requests
   - Shows pattern matching and conditional routing

### Day 2 - Advanced Patterns
4. **Branching Agent**: Demonstrates conditional routing and parallel execution
   - Uses scored nodes and dynamic path selection
   - Supports parallel execution of nodes

5. **Command Agent**: Shows how to use Commands for state and routing
   - Implements subgraph navigation
   - Demonstrates dynamic routing between nodes

6. **Map-Reduce Agent**: Implements parallel processing pattern
   - Shows parallel task execution and result aggregation
   - Handles distributed processing workflows

7. **Recursion-Limit Agent**: Shows how to control recursive flows
   - Implements counting with recursion limits
   - Demonstrates state management across iterations

### Day 3 - State Management
8. **Persistence Agent**: Demonstrates state persistence
   - Implements memory saving and restoration
   - Shows how to maintain state across sessions

9. **Cross-Thread Agent**: Handles cross-thread communication
   - Manages state across different execution threads
   - Demonstrates thread-safe operations

10. **Postgres Persistence**: Implements database-backed persistence
    - Uses PostgreSQL for state storage
    - Shows database integration patterns

### Day 4 - Advanced Features
11. **History Management**: Implements conversation history management
    - Filters and manages message history
    - Demonstrates message deletion and cleanup

12. **Summarization Agent**: Provides conversation summarization
    - Generates summaries of chat history
    - Shows text processing and reduction

13. **Semantic Search**: Implements semantic search capabilities
    - Performs context-aware searching
    - Demonstrates vector-based retrieval

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

3. Day 3 (`apps/agents/src/day_3/`):
   - Further advanced implementations

4. Day 4 (`apps/agents/src/day_4/`):
   - Latest agent implementations

## Web Application

The web interface is built using:
- Next.js
- Tailwind CSS
- TypeScript

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