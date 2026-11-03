
"use strict";

const STORAGE_KEY = "promptflow-ai-studio-workflow";

const templates = {
  summarizer: {
    name: "Document Summarizer",
    steps: [
      {
        name: "Prepare document",
        type: "text_generation",
        systemPrompt: "You prepare documents for summarization. Preserve the important facts and remove unnecessary formatting.",
        userPrompt: "Prepare this document for summarization:\n\n{{input}}"
      },
      {
        name: "Summarize content",
        type: "summarization",
        systemPrompt: "You are a careful document summarizer. Produce a clear, accurate summary without inventing information.",
        userPrompt: "Summarize the following content in five concise bullet points:\n\n{{input}}"
      }
    ]
  },
  classifier: {
    name: "Customer Email Classifier",
    steps: [
      {
        name: "Read customer email",
        type: "text_generation",
        systemPrompt: "You analyze customer emails. Identify the customer's main request and preserve relevant details.",
        userPrompt: "Analyze this customer email:\n\n{{input}}"
      },
      {
        name: "Classify email",
        type: "classification",
        systemPrompt: "Classify the email as Billing, Technical Support, Account, Sales, or Other. Return a JSON object with category, priority, and reason. Do not invent details.",
        userPrompt: "Classify this email and return valid JSON:\n\n{{input}}"
      }
    ]
  },
  extractor: {
    name: "Structured Data Extractor",
    steps: [
      {
        name: "Inspect source text",
        type: "text_generation",
        systemPrompt: "Inspect the provided text and identify the fields relevant to structured extraction. Do not infer missing values.",
        userPrompt: "Inspect this source text:\n\n{{input}}"
      },
      {
        name: "Extract structured fields",
        type: "data_extraction",
        systemPrompt: "Extract the name, email, phone, organization, and key request when present. Return valid JSON. Use null for unavailable fields.",
        userPrompt: "Extract the requested fields from this text:\n\n{{input}}"
      }
    ]
  }
};

const defaultWorkflow = {
  name: "Customer Support Assistant",
  steps: [
    {
      name: "Understand the request",
      type: "text_generation",
      systemPrompt: "You are a helpful customer support assistant. Identify the customer's main question, relevant context, and desired outcome. Do not invent facts.",
      userPrompt: "Review this customer message and identify the main request:\n\n{{input}}"
    },
    {
      name: "Draft a response",
      type: "text_generation",
      systemPrompt: "Write a clear, friendly, professional response. If essential information is missing, state what needs clarification. Never claim an action has been completed unless confirmed.",
      userPrompt: "Draft a helpful response to this customer message:\n\n{{input}}"
    }
  ]
};

const elements = {
  workflowName: document.querySelector("#workflowName"),
  stepsList: document.querySelector("#stepsList"),
  stepCount: document.querySelector("#stepCount"),
  stepEditor: document.querySelector("#stepEditor"),
  emptyEditor: document.querySelector("#emptyEditor"),
  editorHeading: document.querySelector("#editorHeading"),
  stepName: document.querySelector("#stepName"),
  stepType: document.querySelector("#stepType"),
  systemPrompt: document.querySelector("#systemPrompt"),
  userPrompt: document.querySelector("#userPrompt"),
  jsonPreview: document.querySelector("#jsonPreview"),
  jsonSize: document.querySelector("#jsonSize"),
  toast: document.querySelector("#toast"),
  templatesSection: document.querySelector("#templatesSection")
};

let workflow = clone(defaultWorkflow);
let selectedStepId = null;
let nextStepId = 1;
let toastTimeout;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createStep(data = {}) {
  return {
    id: `step-${nextStepId++}`,
    name: data.name || "New workflow step",
    type: data.type || "text_generation",
    systemPrompt: data.systemPrompt || "Describe the role and rules for this step.",
    userPrompt: data.userPrompt || "Process the following input:\n\n{{input}}"
  };
}

function normalizeWorkflow(data) {
  const sourceSteps = Array.isArray(data.steps) ? data.steps : [];

  return {
    name: typeof data.name === "string" ? data.name : "Untitled Workflow",
    steps: sourceSteps.map((step) => ({
      name: String(step.name || "Untitled step"),
      type: String(step.type || "text_generation"),
      systemPrompt: String(step.systemPrompt || ""),
      userPrompt: String(step.userPrompt || "")
    }))
  };
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function selectedStep() {
  return workflow.steps.find((step) => step.id === selectedStepId) || null;
}

function renderSteps() {
  elements.stepsList.replaceChildren();

  workflow.steps.forEach((step, index) => {
    const card = document.createElement("div");
    card.className = "step-card";
    card.classList.toggle("selected", step.id === selectedStepId);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Edit step ${index + 1}: ${step.name}`);

    const number = document.createElement("span");
    number.className = "step-number";
    number.textContent = String(index + 1);

    const copy = document.createElement("div");
    copy.className = "step-copy";

    const name = document.createElement("strong");
    name.textContent = step.name || "Untitled step";

    const type = document.createElement("small");
    type.textContent = step.type.replaceAll("_", " ");

    copy.append(name, type);

    const controls = document.createElement("div");
    controls.className = "step-controls";

    const up = createIconButton("↑", "Move step up");
    up.dataset.action = "up";
    up.disabled = index === 0;

    const down = createIconButton("↓", "Move step down");
    down.dataset.action = "down";
    down.disabled = index === workflow.steps.length - 1;

    controls.append(up, down);
    card.append(number, copy, controls);

    card.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");

      if (actionButton) {
        event.stopPropagation();
        moveStep(step.id, actionButton.dataset.action);
        return;
      }

      selectStep(step.id);
    });

    card.addEventListener("keydown", (event) => {
      if (event.target !== card) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectStep(step.id);
      }
    });

    elements.stepsList.append(card);
  });

  elements.stepCount.textContent =
    `${workflow.steps.length} ${workflow.steps.length === 1 ? "step" : "steps"}`;

  document.querySelector("#addStepBtn").disabled = workflow.steps.length >= 20;
}

function createIconButton(symbol, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button";
  button.textContent = symbol;
  button.title = label;
  button.setAttribute("aria-label", label);
  return button;
}

function selectStep(id) {
  selectedStepId = id;
  renderSteps();
  renderEditor();
}

function renderEditor() {
  const step = selectedStep();

  elements.stepEditor.hidden = !step;
  elements.emptyEditor.hidden = Boolean(step);
  elements.editorHeading.textContent = step ? "Configure your step" : "No step selected";

  if (!step) return;

  elements.stepName.value = step.name;
  elements.stepType.value = step.type;
  elements.systemPrompt.value = step.systemPrompt;
  elements.userPrompt.value = step.userPrompt;
}

function syncSelectedStep() {
  const step = selectedStep();
  if (!step) return;

  step.name = elements.stepName.value;
  step.type = elements.stepType.value;
  step.systemPrompt = elements.systemPrompt.value;
  step.userPrompt = elements.userPrompt.value;

  renderSteps();
  renderJSON();
}

function moveStep(id, direction) {
  const index = workflow.steps.findIndex((step) => step.id === id);
  if (index < 0) return;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= workflow.steps.length) return;

  [workflow.steps[index], workflow.steps[targetIndex]] =
    [workflow.steps[targetIndex], workflow.steps[index]];

  renderSteps();
  renderJSON();
}

function addStep() {
  if (workflow.steps.length >= 20) {
    showToast("A workflow can contain up to 20 steps.");
    return;
  }

  const step = createStep();
  workflow.steps.push(step);
  selectStep(step.id);
  renderJSON();
  showToast("Workflow step added.");
}

function deleteSelectedStep() {
  if (!selectedStepId) return;

  workflow.steps = workflow.steps.filter((step) => step.id !== selectedStepId);
  selectedStepId = workflow.steps[0]?.id || null;

  renderSteps();
  renderEditor();
  renderJSON();
  showToast("Workflow step deleted.");
}

function applyTemplate(templateKey) {
  const template = templates[templateKey];
  if (!template) return;

  workflow = {
    name: template.name,
    steps: template.steps.map((step) => createStep(step))
  };

  selectedStepId = workflow.steps[0]?.id || null;
  elements.workflowName.value = workflow.name;

  renderSteps();
  renderEditor();
  renderJSON();
  showToast(`${template.name} template loaded.`);
}

function buildPayload() {
  return {
    workflowName: elements.workflowName.value.trim() || "Untitled Workflow",
    version: "1.0",
    description: "Prompt workflow configuration created in PromptFlow AI Studio.",
    steps: workflow.steps.map((step, index) => ({
      order: index + 1,
      name: step.name,
      taskType: step.type,
      systemPrompt: step.systemPrompt,
      userPrompt: step.userPrompt,
      inputVariable: "{{input}}"
    }))
  };
}

function renderJSON() {
  const json = JSON.stringify(buildPayload(), null, 2);
  elements.jsonPreview.textContent = json;
  elements.jsonSize.textContent = `${new Blob([json]).size} bytes`;
}

function saveWorkflow() {
  try {
    const savedData = {
      name: elements.workflowName.value,
      steps: workflow.steps.map((step) => ({
        name: step.name,
        type: step.type,
        systemPrompt: step.systemPrompt,
        userPrompt: step.userPrompt
      }))
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    showToast("Workflow saved in this browser.");
  } catch (error) {
    showToast("Could not save. Browser storage may be unavailable.");
  }
}

function loadSavedWorkflow() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.steps)) {
      return false;
    }

    const normalized = normalizeWorkflow(parsed);
    workflow = {
      name: normalized.name,
      steps: normalized.steps.map((step) => createStep(step))
    };

    elements.workflowName.value = workflow.name;
    selectedStepId = workflow.steps[0]?.id || null;
    return true;
  } catch (error) {
    return false;
  }
}

function resetWorkflow() {
  workflow = clone(defaultWorkflow);
  workflow.steps = workflow.steps.map((step) => createStep(step));
  elements.workflowName.value = workflow.name;
  selectedStepId = workflow.steps[0]?.id || null;

  renderSteps();
  renderEditor();
  renderJSON();
  showToast("Default workflow restored. Saved browser data was not deleted.");
}

async function copyJSON() {
  const json = elements.jsonPreview.textContent;

  try {
    await navigator.clipboard.writeText(json);
    showToast("JSON copied to clipboard.");
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = json;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();

    const copied = document.execCommand("copy");
    textArea.remove();

    showToast(copied ? "JSON copied to clipboard." : "Copy failed. Select the JSON and copy it manually.");
  }
}

function exportJSON() {
  const data = JSON.stringify(buildPayload(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeName = (elements.workflowName.value.trim() || "workflow")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "workflow";

  link.href = url;
  link.download = `${safeName}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast("Workflow JSON exported.");
}

elements.workflowName.addEventListener("input", () => {
  workflow.name = elements.workflowName.value;
  renderJSON();
});

[
  elements.stepName,
  elements.stepType,
  elements.systemPrompt,
  elements.userPrompt
].forEach((element) => {
  element.addEventListener("input", syncSelectedStep);
  element.addEventListener("change", syncSelectedStep);
});

document.querySelector("#addStepBtn").addEventListener("click", addStep);
document.querySelector("#deleteStepBtn").addEventListener("click", deleteSelectedStep);
document.querySelector("#saveBtn").addEventListener("click", saveWorkflow);
document.querySelector("#resetBtn").addEventListener("click", resetWorkflow);
document.querySelector("#copyJsonBtn").addEventListener("click", copyJSON);
document.querySelector("#exportBtn").addEventListener("click", exportJSON);

document.querySelectorAll("[data-template]").forEach((button) => {
  button.addEventListener("click", () => applyTemplate(button.dataset.template));
});

document.querySelector("#templatesNav").addEventListener("click", () => {
  elements.templatesSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

const restored = loadSavedWorkflow();

if (!restored) {
  workflow = {
    name: defaultWorkflow.name,
    steps: defaultWorkflow.steps.map((step) => createStep(step))
  };
  elements.workflowName.value = workflow.name;
  selectedStepId = workflow.steps[0]?.id || null;
}

renderSteps();
renderEditor();
renderJSON();
