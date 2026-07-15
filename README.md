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
- **🔍 Search**: Finding contacts or recordings quickly.

<br/>

### 🎨 3. Key Interface Decisions

- **💬 Chat over sidebars**: I got rid of the massive sidebar with 20 links. Now, you just type what you want (like "Create a Sales queue" or "Show today's recordings"), and the chat handles getting you to the right place.

- **🪟 3-Pane Layout**: I went with a 3-pane layout to make sure it feels like a real desktop app:
  1. **Left**: History and commands.
  2. **Center**: The actual chat.
  3. **Right**: The UI components that pop up based on what you asked for.

- **🧩 Artifacts (Forms & Tables)**: Chat is actually pretty bad for complex configs. Nobody wants to type out a 15-step IVR tree in a text box. So, when you ask for something, the app pops open a real UI component (an "Artifact") on the right. This lets you use normal dropdowns and inputs for the heavy lifting.

- **💻 Desktop feel**: I wanted it to feel like a pro tool, not a mobile chat app. I used a `100dvh` layout, tighter spacing, and added keyboard shortcuts like `Ctrl+K` for the command palette.

<br/>

### ⚖️ 4. Trade-offs Made

- **🤖 Fake AI (Regex) instead of OpenAI**: The assignment said a real LLM wasn't required. Instead of dealing with API latency and prompt engineering, I just wrote a `MockProvider` that uses regex to match keywords. This let me spend all my time on the actual UI and animations. It's set up with an interface though, so plugging in a real LLM later would be easy.

- **🚪 No Login Pages**: I skipped building an auth flow or a landing page. I figured you just want to see the core workspace and the UI interactions, so the app drops you straight into the chat view.

- **💾 Redux instead of a Database**: There is no backend. Everything is held in Redux state. If you refresh, it wipes the chat. Again, I chose to focus strictly on frontend design rather than setting up backend plumbing.

- **✅ Fake form submissions**: The forms (like the Queue Editor) look real and let you click around, but hitting "Save" just fires a toast notification instead of doing a database mutation. The UI paths are there, but the data isn't permanently saved.
