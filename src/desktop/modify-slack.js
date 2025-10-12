const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

function loadUserscriptCode() {
  const userscriptPath = path.join(
    __dirname,
    "..",
    "userscript",
    "old-school-slack.user.js"
  );

  if (!fs.existsSync(userscriptPath)) {
    throw new Error(`Userscript not found at: ${userscriptPath}`);
  }

  const content = fs.readFileSync(userscriptPath, "utf8");

  // Extract the main function from the userscript (remove the wrapper)
  const startMarker = "(function () {";
  const endMarker = "})();";

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.lastIndexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Could not extract userscript function");
  }

  // Get the function body without the wrapper
  const functionBody = content.slice(startIndex + startMarker.length, endIndex);

  return functionBody;
}

async function modifySlackCSS() {
  try {
    console.log("Getting target information...");

    // Get the list of available targets
    const response = await fetch("http://localhost:8315/json");
    const targets = await response.json();

    // Find the main Slack window
    const target = targets.find(
      (t) =>
        t.type === "page" && (t.url.includes("slack") || t.url.includes("app"))
    );

    if (!target) {
      console.log("No Slack target found");
      return;
    }

    console.log("Found target:", target.title);

    // Connect directly to the WebSocket
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    return new Promise((resolve, reject) => {
      ws.on("open", () => {
        console.log("Connected to DevTools WebSocket");

        // Enable Runtime domain
        ws.send(
          JSON.stringify({
            id: 1,
            method: "Runtime.enable",
          })
        );

        // Load and inject the userscript after a short delay
        setTimeout(() => {
          try {
            const userscriptCode = loadUserscriptCode();
            console.log("💉 Injecting Old School Slack userscript...");

            ws.send(
              JSON.stringify({
                id: 2,
                method: "Runtime.evaluate",
                params: {
                  expression: `
                    (function() {
                      try {
                        ${userscriptCode}
                        return 'Old School Slack userscript injected successfully';
                      } catch (error) {
                        console.error('Userscript execution error:', error);
                        return 'Error: ' + error.message;
                      }
                    })()
                  `,
                  awaitPromise: true,
                },
              })
            );
          } catch (error) {
            console.error("Error loading userscript:", error);
            ws.close();
            reject(error);
          }
        }, 100);
      });

      ws.on("message", (data) => {
        const message = JSON.parse(data);
        if (message.id === 2) {
          if (message.result?.exceptionDetails) {
            console.error("Script execution failed:", message.result.exceptionDetails);
            reject(new Error(message.result.exceptionDetails.text));
          } else {
            console.log("✅", message.result?.value || "Success");
            ws.close();
            resolve();
          }
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

modifySlackCSS();
