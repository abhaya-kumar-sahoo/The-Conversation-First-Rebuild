# 🎧 CallCenter AI Workspace 

> A chat-first approach to a Call Center Admin Panel.

---

## 🚀 Setup Instructions

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

## ⌨️ Supported Commands Cheat Sheet

The AI Workspace uses natural language processing to understand your goals. You don't have to memorize exact phrases—just type or speak conversationally! 

Below is a section-by-section breakdown of the actions the AI supports, along with examples of how to trigger them.

---

### 📞 Queues & Routing Management
*The core engine for routing calls to the right agents.*

| Action | Example Commands |
| :--- | :--- |
| **Create a Queue** | `"Create VIP queue"`, `"Add a Sales queue"`, `"Create Support queue"` |
| **Edit a Queue** | `"Edit the Support queue"`, `"Update my queue"`, `"Modify queue routing"` |
| **Delete a Queue** | `"Delete this queue"`, `"Remove the legacy queue"`, `"Disable queue"` |
| **List all Queues** | `"Show all queues"`, `"List queues"`, `"View queues"` |
| **Assign Agents** | `"Assign agents to Sales"`, `"Add John to the queue"`, `"Put agents on Support"` |
| **Unassign Agents** | `"Unassign agents from Billing"`, `"Remove agent"` |

---

### 🔀 IVR (Interactive Voice Response)
*Visual builders for automated phone menus.*

| Action | Example Commands |
| :--- | :--- |
| **Create / Open IVR** | `"Create an IVR"`, `"Open IVR"`, `"Build a new IVR flow"` |
| **Edit IVR** | `"Edit the Sales IVR"`, `"Update IVR tree"`, `"Modify IVR"` |

---

### 👥 Directory & Staff
*Manage your workforce and contacts.*

| Action | Example Commands |
| :--- | :--- |
| **Show Agents / Contacts** | `"Show all agents"`, `"List my contacts"`, `"Agent list"` |
| **Show Managers** | `"Show managers"`, `"List management team"`, `"All managers"` |

---

### 📊 Dashboards & Analytics
*Monitor live performance and historical trends.*

| Action | Example Commands |
| :--- | :--- |
| **Live Dashboard** | `"Show dashboard"`, `"Today's stats"`, `"Live metrics"`, `"KPI overview"` |
| **Detailed Analytics** | `"Show analytics"`, `"Analyze call volume"`, `"Show metrics and trends"` |
| **Generate Reports** | `"Generate weekly report"`, `"Monthly performance summary"`, `"Create report"` |

---

### 🎧 Call Activity & Quality
*Review individual interactions and lifecycles.*

| Action | Example Commands |
| :--- | :--- |
| **Call Recordings** | `"Show call recordings"`, `"Listen to recorded calls"`, `"Call records"` |
| **Customer Timeline** | `"Show customer timeline"`, `"View activity log"`, `"Journey history"` |

---

### 🎯 Campaigns & Outbound
*Manage proactive customer outreach.*

| Action | Example Commands |
| :--- | :--- |
| **Create Campaign** | `"Create a new campaign"`, `"Build an outbound campaign"` |

---

### 🛡️ Approvals & Security
*Review administrative actions that require sign-off.*

| Action | Example Commands |
| :--- | :--- |
| **View Approvals** | `"Show pending approvals"`, `"Review requests"`, `"Pending requests"` |



> [!TIP]
> **Pro Tip:** You can also use the **Command Palette (`Cmd + K` or `Ctrl + K`)** to instantly access many of these actions without typing them out in the chat!


---

## 📝 Design Note: The Conversation-First Rebuild

### 🏢 1. The Original Product
The original product I work on is a Call Center Admin Platform. It has a lot of nested menus, heavy data tables, and complicated forms for managing call queues, IVRs, and agents. 

Right now, users have to click through 4 or 5 different pages just to do simple things like adding an agent to a queue or pulling a basic report.

<br/>

### 🔄 2. Workflows Carried Over
I made sure to cover the main workflows our users actually care about:

- **👥 Queue Management**: Creating queues and setting routing strategies.
- **🎧 Agent Assignment**: Searching for agents and putting them in queues.
- **☎️ IVR Configuration**: A visual builder for call flows.
- **🎯 Outbound Campaigns**: Creating and scheduling campaigns.
- **📊 Reporting & Analytics**: Viewing dashboards and playing call recordings.

<br/>

### 🎨 3. Key Interface Decisions

- **💬 Chat over sidebars**: I got rid of the massive sidebar with 20 links. Now, you just type what you want (like "Create a Sales queue" or "Show today's recordings"), and the chat handles getting you to the right place.

- **🪟 3-Pane Layout**: I went with a 3-pane layout to make sure it feels like a real desktop app:
  1. **Left**: History and commands.
  2. **Center**: The actual chat.
  3. **Right**: The UI components that pop up based on what you asked for.

- **🧩 Artifacts (Forms & Tables)**: Chat is actually pretty bad for complex configs. Nobody wants to type out a 15-step IVR tree in a text box. So, when you ask for something, the app pops open a real UI component (an "Artifact") on the right. This lets you use normal dropdowns and inputs for the heavy lifting.

- **🧠 Context-Aware AI**: The chat doesn't exist in a vacuum. It watches what tab (Artifact) you currently have open on the right side of the screen. If you're looking at a Queue Editor and you type `"Add Aman"` or `"Change strategy to round robin"`, it automatically knows you are referring to the active queue and updates it—without you needing to explicitly say the word "queue" again.

- **💻 Desktop feel**: I wanted it to feel like a pro tool, not a mobile chat app. I used a `100dvh` layout, tighter spacing, and added keyboard shortcuts like `Cmd+K` for the command palette.

<br/>

### ⚖️ 4. Trade-offs Made

- **🤖 Mockable AI vs Real LLMs**: The assignment said a real LLM wasn't strictly required. While I implemented real API integrations for both **Google Gemini** and **local Ollama** to parse intents, I also built a fallback `MockProvider` that uses regex. This guarantees the prototype is always perfectly functional for reviewers, even without an API key or local model running, while still proving the architecture supports real LLMs seamlessly.

- **🚪 No Login Pages**: I skipped building an auth flow or a landing page. I figured you just want to see the core workspace and the UI interactions, so the app drops you straight into the chat view.

- **💾 Redux instead of a Database**: There is no backend. Everything is held in Redux state. If you refresh, it wipes the chat. Again, I chose to focus strictly on frontend design rather than setting up backend plumbing.

- **✅ Local State Management**: The forms (like the Queue Editor) look real and let you click around. If you change a setting and hit "Save", or if you ask the AI to change a setting for you (e.g., "Change ring time to 45 seconds"), the Redux store seamlessly updates the UI in place! There is no real database backend, but the state persists as long as the tab is open.
