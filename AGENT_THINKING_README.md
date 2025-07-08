# Agent Thinking & Tool Calls Display

This feature enhances the chat interface to show the AI agent's thinking process and tool usage in real-time, providing users with transparency into how the agent arrives at its responses.

## Features

### 1. Real-time Tool Call Display
- Shows when tools are being called
- Displays tool execution status (running, completed, error)
- Shows execution time for each tool
- Expandable details showing tool arguments and results

### 2. Reasoning Process Visualization
- Displays the agent's step-by-step thinking process
- Shows confidence levels for each reasoning step
- Expandable reasoning details
- Sequential numbering for easy following

### 3. Live Feedback
- Real-time updates as the agent works
- Visual indicators for active processes
- Smooth animations for better UX

## How to Use

### Enabling Reasoning Mode
1. Click the "Enable Reasoning" button in the chat input area
2. The button will change to "Reasoning Enabled" with a brain icon
3. Send your message - the agent will now show its thinking process

### Understanding the Display

#### Thinking Process Section
- **Brain Icon**: Indicates reasoning steps
- **Step Numbers**: Sequential reasoning steps
- **Confidence**: Percentage confidence for each step
- **Expandable Details**: Click to see full reasoning text

#### Tools Used Section
- **Zap Icon**: Indicates tool usage
- **Status Icons**: 
  - 🔄 Spinning loader = Tool running
  - ✅ Check mark = Tool completed
  - ❌ Error icon = Tool failed
- **Execution Time**: Shows how long each tool took
- **Expandable Details**: Click to see tool arguments and results

## Technical Implementation

### Data Flow
1. **User Toggle**: User clicks "Enable Reasoning" button to set `reasoningEnabled` state
2. **API Request**: The `reasoning` parameter is sent to the backend API (`reasoning: true/false`)
3. **Streaming Events**: The backend streams `ToolCallStarted`, `ToolCallCompleted`, and `RunResponseContent` events
4. **State Management**: The `useAgentChat` hook tracks current tool calls and reasoning steps
5. **Real-time Updates**: The `AgentThinking` component displays live updates
6. **Message Integration**: Completed thinking process is embedded in the final message

### API Integration

The reasoning feature is properly integrated with the backend API:

```typescript
// Request payload sent to /reggie/api/v1/chat/stream/
{
  agent_id: "agent-id",
  message: "user message",
  session_id: "session-id",
  reasoning: true  // or false
}
```

The backend uses this parameter to enable/disable reasoning mode for the agent, which controls whether tool calls and reasoning steps are streamed to the client.

### Key Components

#### `useAgentChat` Hook
- Tracks `currentToolCalls` and `currentReasoningSteps`
- Parses streaming events for tool call and reasoning data
- Provides real-time state updates

#### `AgentThinking` Component
- Displays tool calls and reasoning steps
- Handles expandable sections
- Provides smooth animations
- Shows active status indicators

#### `ChatMessage` Component
- Integrates thinking process into message display
- Shows completed reasoning and tool calls
- Maintains backward compatibility

### Event Types Handled

#### ToolCallStarted
```json
{
  "event": "ToolCallStarted",
  "tool": {
    "tool_call_id": "call_123",
    "tool_name": "google_search",
    "tool_args": {"query": "Bitcoin news"}
  }
}
```

#### ToolCallCompleted
```json
{
  "event": "ToolCallCompleted",
  "tool": {
    "tool_call_id": "call_123",
    "result": "Search results...",
    "metrics": {"time": 0.76}
  }
}
```

#### RunResponseContent (with reasoning)
```json
{
  "event": "RunResponseContent",
  "content": "Response text...",
  "extra_data": {
    "reasoning_steps": [
      {
        "title": "Plan to get current Bitcoin news",
        "reasoning": "To generate a comprehensive report...",
        "action": "parallel execution of news search",
        "confidence": 0.9
      }
    ]
  }
}
```

## Benefits

1. **Transparency**: Users can see exactly how the agent works
2. **Trust**: Understanding the process builds confidence
3. **Debugging**: Easy to identify where issues occur
4. **Learning**: Users can learn from the agent's reasoning
5. **Performance**: See which tools take the most time

## Future Enhancements

- [ ] Tool call cancellation
- [ ] Detailed performance metrics
- [ ] Export thinking process
- [ ] Customizable display options
- [ ] Tool call history
- [ ] Reasoning step annotations

## Troubleshooting

### Reasoning Not Showing
- Ensure reasoning mode is enabled
- Check that the agent supports reasoning
- Verify backend streaming is working

### Tool Calls Not Displaying
- Check network connectivity
- Verify agent has access to tools
- Look for console errors

### Performance Issues
- Consider limiting the number of displayed steps
- Implement virtual scrolling for long processes
- Add loading states for better UX 