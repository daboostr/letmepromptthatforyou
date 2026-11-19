// Each provider defines branding, the prefill URL and the snark.
// Add a new entry (e.g. "gemini") and it becomes available via ?p=gemini.
window.LMPTFY_PROVIDERS = {
  copilot: {
    id: "copilot",
    name: "Copilot",
    tagline: "For all those people who find it more convenient to ask you than to ask Copilot.",
    placeholder: "Message Copilot",
    buildUrl: (q) => "https://copilot.microsoft.com/?q=" + encodeURIComponent(q),
    theme: {
      bg: "#f7f5f2",
      surface: "#ffffff",
      text: "#1b1a19",
      muted: "#605e5c",
      accent: "#0f6cbd",
      gradient: "linear-gradient(135deg, #2b7de9 0%, #7f5af0 45%, #e3008c 75%, #ffb900 100%)"
    },
    steps: {
      open: "Step 1: Go to Copilot.",
      type: "Step 2: Type in your question.",
      send: "Step 3: Press the send button.",
      done: "Was that so hard?"
    },
    redirectNote: "Taking you to Copilot in {s}…"
  }
  // gemini: { ... coming soon ... }
};
