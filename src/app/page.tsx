"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  request: string;
  steps: string[];
  status: "pending" | "approved" | "rejected";
  simulation?: {
    completedAt: string;
    results: string[];
  };
};

function planTask(request: string): string[] {
  const value = request.toLowerCase();

  if (value.includes("email")) {
    return [
      "Identify the intended recipient and purpose",
      "Prepare a draft email",
      "Review the draft before sending",
    ];
  }

  if (value.includes("project")) {
    return [
      "Identify the project objectives",
      "Organize tasks by priority",
      "Prepare a project progress summary",
    ];
  }

  if (value.includes("meeting")) {
    return [
      "Identify meeting objectives",
      "Prepare an agenda",
      "Create a follow-up checklist",
    ];
  }

  return [
    "Review the requested objective",
    "Break the request into actionable steps",
    "Prepare a summary for approval",
  ];
}

export default function Home() {
  const [request, setRequest] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("taskpilot-workflows-v1");

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const validTasks = parsed.filter(
            (item): item is Task =>
              item !== null &&
              typeof item === "object" &&
              typeof item.id === "number" && Number.isFinite(item.id) &&
              typeof item.request === "string" &&
              Array.isArray(item.steps) &&
              item.steps.every((step: unknown) => typeof step === "string") &&
              ["pending", "approved", "rejected"].includes(item.status)
          );

          setTasks(validTasks);
        }
      }
    } catch (error) {
      console.error("Unable to load TaskPilot workflow history:", error);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;

    try {
      window.localStorage.setItem(
        "taskpilot-workflows-v1",
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.error("Unable to save TaskPilot workflow history:", error);
    }
  }, [tasks, historyLoaded]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createTask() {
    const value = request.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: value })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI planning failed");
      }

      setTasks((previous) => [
        {
          id: Date.now(),
          request: value,
          steps: data.steps,
          status: "pending"
        },
        ...previous
      ]);

      setRequest("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error"
      );
    } finally {
      setLoading(false);
    }
  }
  function runSimulation(id: number) {
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== id || task.status !== "approved") {
          return task;
        }

        return {
          ...task,
          simulation: {
            completedAt: new Date().toISOString(),
            results: task.steps.map(
              (step, index) =>
                `Step ${index + 1}: SIMULATED - ${step}`
            )
          }
        };
      })
    );
  }
  function updateStatus(id: number, status: Task["status"]) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-cyan-400">
              TIERRA AI LABS
            </p>
            <h1 className="mt-2 text-4xl font-bold">
              Axiom TaskPilot
            </h1>
            <p className="mt-2 text-slate-400">
              Your workflow automation command center
            </p>
          </div>

          <span className="rounded-full border border-cyan-700 px-4 py-2 text-sm text-cyan-300">
            Local Prototype v0.1
          </span>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Total Requests", tasks.length],
            ["Pending Approval", tasks.filter((t) => t.status === "pending").length],
            ["Approved Plans", tasks.filter((t) => t.status === "approved").length],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            TaskPilot Conversation
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Talk to TaskPilot. Describe your goal and review the AI-generated plan before approving execution.
          </p>

          <div className="mt-6 max-h-96 space-y-4 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-4">
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400">
                TaskPilot: Hi! What would you like help organizing today?
              </p>
            ) : (
              [...tasks].reverse().map((task) => (
                <div key={task.id} className="space-y-3">
                  <div className="ml-auto max-w-[85%] rounded-xl bg-cyan-900 p-3 text-sm">
                    <p className="mb-1 text-xs font-semibold text-cyan-300">You</p>
                    {task.request}
                  </div>

                  <div className="mr-auto max-w-[90%] rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm">
                    <p className="mb-2 text-xs font-semibold text-emerald-400">
                      TaskPilot
                    </p>
                    <p>I prepared a proposed workflow for your request. Please review the steps and approve the plan below before running a simulation.</p>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-slate-300">
                      {task.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                    <p className="mt-3 text-xs text-slate-400">
                      Status: {task.status}
                      {task.simulation ? " | Simulation complete" : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold text-cyan-300">
              Try a demo request
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Help me organize tomorrow: review emails, prepare for a meeting, and work on my business.",
                "Help me prepare a professional follow-up email after a client meeting.",
                "Plan the next steps for launching my small business project."
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setRequest(example)}
                  className="rounded-lg border border-cyan-800 bg-slate-950 px-4 py-3 text-left text-sm text-cyan-200 hover:bg-slate-800"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="Ask TaskPilot to plan something..."
            className="mt-5 min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-400"
          />

          <button
            onClick={createTask}
            disabled={!request.trim() || loading}
            className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"
          >
            {loading ? "TaskPilot is thinking..." : "Send to TaskPilot"}
          </button>
          {error && <p role="alert" className="mt-3 text-red-400">{error}</p>}
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-semibold">
            Workflow Activity
          </h2>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              No workflows yet. Create your first request above.
            </div>
          ) : (
            <div className="space-y-5">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">
                      {task.request}
                    </h3>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm capitalize text-cyan-300">
                      {task.status}
                    </span>
                  </div>

                  <ol className="mt-5 list-inside list-decimal space-y-2 text-slate-300">
                    {task.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>

                  {task.status === "pending" && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => updateStatus(task.id, "approved")}
                        className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-950"
                      >
                        Approve Plan
                      </button>
                      <button
                        onClick={() => updateStatus(task.id, "rejected")}
                        className="rounded-lg border border-slate-600 px-5 py-2"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {task.status === "approved" && (
                    <div className="mt-5 space-y-4">
                      <p className="text-sm text-emerald-400">
                        Human approval confirmed.
                      </p>

                      <button
                        onClick={() => runSimulation(task.id)}
                        className="rounded-lg bg-cyan-400 px-5 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
                      >
                        Run Simulation
                      </button>

                      {task.simulation && (
                        <div className="rounded-xl border border-cyan-800 bg-slate-950 p-4">
                          <p className="font-semibold text-cyan-300">
                            Simulation Complete - No External Actions
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(task.simulation.completedAt).toLocaleString()}
                          </p>

                          <ul className="mt-3 space-y-2 text-sm text-slate-300">
                            {task.simulation.results.map((result, index) => (
                              <li key={index}>{result}</li>
                            ))}
                          </ul>

                          <p className="mt-4 text-xs text-amber-300">
                            Demo only. No external actions performed.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-slate-800 pt-6 text-sm text-slate-500">
          Developed by Tierra AI Labs | Amazon Developer Hackathon 2026
        </footer>
      </div>
    </main>
  );
}

