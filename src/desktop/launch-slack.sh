#!/bin/bash

# Get sleep duration in seconds from first parameter
# Default is 3 seconds
SLEEP_DURATION=${1:-3}

echo "🚀 Launching Slack with remote debugging..."

# Launch Slack with remote debugging
open /Applications/Slack.app/ --args --remote-debugging-port=8315 &

# Wait for Slack to start with specified duration
echo "⏳ Waiting ${SLEEP_DURATION} seconds for Slack to load..."
sleep "$SLEEP_DURATION"

echo "🔧 Applying Old School Slack modifications..."
if npm run update-desktop; then
  echo "✅ Successfully applied Old School Slack!"
else
  echo "❌ Failed to apply modifications"
  exit 1
fi
