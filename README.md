# Axiom TaskPilot

### An approval-first AI workflow assistant
**Built by Tierra AI Labs | Amazon Developer Hackathon 2026**

Axiom TaskPilot is a prototype that helps users turn everyday requests into structured, actionable workflows.

The application demonstrates an Alexa+-style assistant experience using a custom web interface and Google Gemini.

**Important:** This is a simulated Alexa+-style experience. It does not connect to Amazon Alexa+, send emails, update calendars, or perform real external actions.

## What TaskPilot Does

1. Accepts a natural-language request.
2. Uses Gemini AI to generate a three-step workflow.
3. Presents the plan for human review.
4. Allows the user to approve or reject the plan.
5. Simulates approved workflow execution.
6. Saves workflow history in browser localStorage.

## Features

- Gemini-powered workflow planning
- Conversation-style interface
- Three guided demonstration prompts
- Human-in-the-loop approval
- Explicit simulated execution
- Workflow history persistence
- Responsive Next.js interface

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Google Gemini API
- Browser localStorage

## Getting Started

Requirements:
- Node.js and npm
- A Google Gemini API key

Clone the repository:

```bash
git clone https://github.com/kenlora-7796/axiom-taskpilot-amazon.git
cd axiom-taskpilot-amazon
npm install
```

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Do not commit your API key to GitHub.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Demonstration Workflow

1. Select a guided example or type your own request.
2. Click **Send to TaskPilot**.
3. Review the AI-generated three-step plan.
4. Select **Approve Plan** or **Reject**.
5. For approved plans, click **Run Simulation**.
6. Refresh the browser to verify saved workflow history.

The simulation produces demonstration results only. It does not perform real-world actions.

## Architecture

User request
→ Next.js frontend
→ `/api/plan`
→ Gemini API
→ Three-step workflow
→ Human approval
→ Local simulation
→ Browser-local history

The Gemini API key remains server-side in the environment configuration.

## Development Friction Log

The project was developed through an AI-assisted, PowerShell-driven workflow.

Challenges encountered:

- Resolving initial development and dependency setup issues.
- Managing separate development and public GitHub repositories.
- Preserving existing workflow functionality during interface upgrades.
- Fixing a source-code replacement that failed because of whitespace matching.
- Troubleshooting why new demo buttons were not immediately visible.
- Correcting a text-encoding issue in the simulation heading.
- Verifying TypeScript compilation and production builds.

These challenges informed improvements to the development and testing process.

## Limitations

- No direct Alexa+ integration.
- No actual email, calendar, or third-party execution.
- No user authentication.
- Workflow history is stored locally in the browser.
- AI output depends on Gemini API availability.

## Future Development

Potential enhancements include voice input, integrations with external tools, more advanced workflow orchestration, and expanded approval controls.

## License

MIT License. See `LICENSE`.

## Developer

**Tierra AI Labs**

Project: Axiom TaskPilot