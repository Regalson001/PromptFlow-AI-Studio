# PromptFlow AI Studio

**A browser-based AI prompt and workflow builder built with HTML5, CSS3, and JavaScript.**

PromptFlow AI Studio is a front-end project for designing reusable AI prompt workflows, configuring individual steps, and inspecting structured JSON before integrating an AI model or automation platform.

The project explores the interface patterns used in AI developer tools, workflow automation platforms, and LLM-powered applications.

## Features

- **Visual workflow builder:** Add, edit, reorder, and remove prompt steps.
- **Prompt configuration:** Define step names, task types, system instructions, and user prompts.
- **Live JSON preview:** View the workflow configuration update as you edit.
- **Reusable templates:** Start with document summarization, customer email classification, or structured data extraction.
- **Local persistence:** Save and restore workflow configurations using browser LocalStorage.
- **JSON export:** Download workflow configurations as JSON files.
- **Clipboard support:** Copy the generated JSON payload.
- **Responsive interface:** Adapt the workspace to desktop and smaller screens.
- **Accessible controls:** Use semantic HTML, visible focus indicators, descriptive labels, and status messages.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic application structure |
| CSS3 | Responsive layouts, styling, and interface components |
| JavaScript ES6+ | Workflow state, event handling, templates, and JSON generation |
| LocalStorage | Browser-based persistence |
| JSON | Portable workflow configuration format |
| Git and GitHub | Version control and project hosting |

## Project Structure

```text
PromptFlow-AI-Studio/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Getting Started

### Requirements

- A modern web browser.
- Visual Studio Code or another text editor.
- Git, if you want to clone and push the repository.

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Regalson001/PromptFlow-AI-Studio.git
   ```

2. Open the project directory:

   ```bash
   cd PromptFlow-AI-Studio
   ```

3. Open `index.html` in your browser, or use the Live Server extension in Visual Studio Code.

No package installation or build process is required.

## How to Use

1. Open PromptFlow AI Studio.
2. Select a prompt template or edit the default workflow.
3. Change the workflow name.
4. Select a step to configure its name, task type, system instructions, and user prompt.
5. Add steps or use the arrow controls to change their order.
6. Review the live JSON preview.
7. Save the workflow in your browser, copy the JSON, or export it to a file.

The `{{input}}` placeholder represents incoming text in the example prompt templates.

## Example Use Cases

### Document summarization

Prepare text and define instructions for producing a concise summary.

### Customer email classification

Configure a workflow to categorize incoming customer messages and describe the expected output.

### Structured data extraction

Design prompt steps that request fields from unstructured text and represent the expected result as JSON.

## Architecture and Limitations

PromptFlow AI Studio is a client-side prototype. It generates and manages workflow configuration data; it does not execute prompts against a live LLM.

- No live OpenAI or other LLM API integration is included.
- No backend, authentication, or remote database is included.
- Browser LocalStorage is local to the current browser and origin.
- The exported JSON is a configuration payload, not a guarantee that a third-party automation platform can import it without adaptation.
- API credentials should never be embedded in public front-end JavaScript.

## Future Improvements

- Integrate a secure backend for LLM execution.
- Add a visual drag-and-drop workflow canvas.
- Support conditional branches and workflow connections.
- Add JSON schema validation and configurable output formats.
- Add workflow import and version history.
- Integrate n8n or other automation platforms through secure server-side APIs.
- Add automated tests for workflow state and export behavior.

## Author

**Stephen Oyugi**  
Front-End Developer | AI Automation and Machine Learning

- GitHub: [@Regalson001](https://github.com/Regalson001)

## License

This project is intended for learning and portfolio demonstration. Add an MIT `LICENSE` file if you want to distribute the project under the MIT License.

---

*Designed to explore the intersection of front-end engineering, AI prompts, and workflow automation.*
