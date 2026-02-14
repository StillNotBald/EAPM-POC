# Nexus EAPM - Enterprise Application Portfolio Management

**Nexus EAPM** is a modern, AI-driven Enterprise Architecture tool designed to democratize portfolio management. It combines the rigorous data structuring of the **Dragon1** methodology with a "Notebook-style" aesthetic (inspired by NotebookLM) to make complex architectural data approachable and actionable.

## 🌟 Core Philosophy

The system separates the **Architecture Repository** (Data) from the **Architecture Atlas** (Visualizations).

1.  **Repository (The Registry)**: A high-density, structured view of all assets, focused on metadata, lifecycle, and cost.
2.  **Atlas (Topology & Landscape)**: Auto-generated diagrams that visualize dependencies, redundancy, and risk without manual drawing tools.
3.  **Intelligence (Strategy & AI)**: Automated rationalization logic (TIME Model) and Generative AI for strategic insights.

---

## 🏗️ Modules & Features

### 1. The Registry (`AppRegistry.tsx`)
The central nervous system of the application. It renders a high-density table grouped by **Business Capability**.
*   **Sticky Columns**: Name and Strategy Badge remain visible while scrolling.
*   **Strategy Engine**: Automatically computes the disposition strategy based on Business Value and Health:
    *   **INVEST** (High Value, High Health)
    *   **MIGRATE** (High Value, Low Health)
    *   **TOLERATE** (Low Value, High Health)
    *   **ELIMINATE** (Low Value, Low Health)
*   **Lifecycle Indicators**: Visual traffic lights for ACTIVE, PHASE_OUT, and EOL statuses.

### 2. Topology Map (`TopologyMap.tsx`)
An interactive dependency graph built with **React Flow**.
*   **Auto-Layout**: Nodes are automatically positioned into architectural tiers:
    *   **Channel**: User-facing interfaces.
    *   **Integration**: APIs and Middleware.
    *   **Core**: Systems of Record (ERP, CRM).
    *   **Infra**: Databases and Foundations.
*   **Smart Views**: Toggle between architectural lenses:
    *   **Security**: Highlights High-Risk PII flows in Red.
    *   **Tech Debt**: Scales nodes based on debt level.
    *   **Cost**: Heatmap visualization of TCO.

### 3. Landscape Blueprint (`LandscapeDashboard.tsx`)
A strategic "City Map" view for rationalization planning.
*   **Hierarchy**: Groups applications by `Domain` -> `Capability`.
*   **Redundancy Detection**: Automatically flags capabilities with >3 applications as "Redundant" (Amber Alert), signaling candidates for consolidation.
*   **Cost Aggregation**: Rolls up TCO at the Domain level.

### 4. Portfolio AI (`AIPanel.tsx`)
A Generative AI assistant powered by **Google Gemini**.
*   **Context-Aware**: The AI receives a sanitized JSON dump of the current portfolio state (Health, Value, Tier, PII status).
*   **Security**: Requires the user to input their own ephemeral API Key. Keys are never stored on a server.
*   **Use Cases**: Ask questions like *"Which Core systems are at risk?"* or *"Draft a migration plan for EOL apps."*

### 5. Data Management
*   **CSV Import**: Bulk ingestion wizard with validation logic for duplicates and missing owners.
*   **CSV Export**: Flattens nested architecture objects into a consumable spreadsheet format.
*   **Editor**: Comprehensive form for managing Dragon1 attributes (GDPR compliance, Data Sensitivity, Upstream/Downstream dependencies).

---

## 🛠️ Technical Stack

*   **Framework**: React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (custom "Notebook" color palette)
*   **Visualization**: React Flow (Nodes/Edges), standard SVG.
*   **AI**: `@google/genai` SDK.
*   **Data Processing**: `papaparse` for CSV handling.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js installed.
*   A Google Gemini API Key (for AI features).

### Installation
This project uses ES Modules via CDN (importmap) for a build-less development experience, but can be run via a simple server.

1.  **Dependencies**: The `index.html` imports React, ReactDOM, and libraries directly from `esm.sh`. No `npm install` is required for the runtime, just a static file server.

### Usage
1.  **Navigation**: Use the sidebar to switch between Registry, Landscape, and Topology views.
2.  **Add Data**: Click **+ New App** or **Import CSV** to populate the repository.
3.  **Analyze**:
    *   Go to **Topology** and toggle "Security" to see PII risks.
    *   Go to **Landscape** to find redundant applications.
4.  **AI Insights**: Click **✨ Ask Portfolio AI**, enter your Gemini API Key, and query your data.

---

## 📂 Project Structure

```text
/
├── components/
│   ├── business/       # Domain-specific logic (Registry, Topology, AI)
│   └── ui/             # Layout and generic UI components
├── services/           # External API integrations (Gemini)
├── hooks/              # State management (useApps)
├── types.ts            # TypeScript definitions (Application, Tier, Strategy)
├── constants.ts        # Mock data / Initial state
├── index.html          # Entry point & Import Maps
└── App.tsx             # Main Application Controller
```

## 🔐 License

Distributed under the MIT License. See `MIT-LICENSE.txt` for more information.
