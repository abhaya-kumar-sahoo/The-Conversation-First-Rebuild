# CallCenter AI Workspace 

A conversational reimagining of a traditional Call Center Administration Panel.

## Setup Instructions

1. Ensure you have [Bun](https://bun.sh/) installed.
2. Clone this repository and navigate to the project root.
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server:
   ```bash
   bun dev
   ```
5. Open your browser to `http://localhost:5173`.

---

## Design Note: The Conversation-First Rebuild

### 1. The Original Product
The original product is a traditional **Call Center Administration Platform**. In its legacy form, it consists of dozens of nested menus, dense data tables, and complex configuration pages for managing call queues, interactive voice response (IVR) trees, agent assignments, and outbound campaigns. Users typically spend a lot of time clicking through deep navigation hierarchies just to make simple changes (like adding a new agent to a queue or pulling a weekly performance report).

### 2. Workflows Carried Over
To ensure full functional coverage, the core administrative workflows were carried over to the new paradigm:
- **Queue Management**: Creating, configuring, and updating routing strategies for call queues.
- **Agent Assignment**: Searching for agents and assigning them to specific queues.
- **IVR Configuration**: A visual node-based builder to manage call flows.
- **Outbound Campaigns**: Creating and scheduling predictive/progressive dialing campaigns.
- **Reporting & Analytics**: Pulling live dashboards, historical metrics, and call recordings.
- **Global Search**: Finding contacts, agents, or recordings instantly.

### 3. Key Interface Decisions
- **Conversation as Navigation**: Instead of a traditional sidebar with 20 links, the primary interaction mode is natural language. Users simply type what they want to do ("Create a Sales queue", "Show today's recordings"), and the AI handles the routing.
- **The Three-Pane Architecture**: I opted for a desktop-native 3-pane layout:
  1. **Left (Context)**: Chat history and quick commands.
  2. **Center (Conversation)**: The ongoing dialogue with the AI.
  3. **Right (Artifacts)**: The dynamic, structured UI pane.
- **Structured Artifacts**: Conversation alone is terrible for dense configurations. You don't want to type out a 15-node IVR tree in a text box. Therefore, when the user states an intent, the AI generates a structured, interactive UI (an "Artifact") on the right. The user can then click, drag, and type into a traditional GUI where it makes sense, seamlessly blending chat with direct manipulation.
- **Desktop Ergonomics**: The interface is optimized for desktop power users. It features dense typography, a 100dvh layout with no page reloads, and robust keyboard navigation (e.g., `Ctrl+K` for the command palette, `/` for inline slash commands).

### 4. Trade-offs Made
- **Mock AI vs. Real LLM**: The prompt explicitly stated that real LLM integration was out of scope. I traded a real OpenAI/Claude integration for a robust, predictable `MockProvider` using regular expressions. This allowed me to spend 100% of my time refining the UI, animations, and state management rather than wrestling with prompt engineering or API latency. (However, the architecture uses Dependency Injection, making it trivial to swap in a real LLM later).
- **Simulated Persistence**: I traded a real database for Redux state management. All artifacts and chats are maintained locally during the session. If the page is refreshed, the state resets. This was a deliberate choice to prioritize frontend interface design over backend plumbing.
- **Simulated Form Submissions**: While the Artifacts look like fully functional forms (e.g., the Queue Editor), hitting "Save" triggers a simulated success toast rather than actually mutating a mock database. The interface paths exist and feel complete, even if the data isn't permanently persisted.
