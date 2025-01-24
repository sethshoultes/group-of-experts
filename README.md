# AI Mastermind - Expert Discussion System

A React-based expert discussion system that facilitates multi-expert conversations using AI. The system allows users to create discussions, get AI expert responses, and generate summaries.

## Discussion Modes

The system supports two discussion modes:

### Sequential Mode
- Experts respond one after another in a defined order
- Only one expert can respond per round
- Must wait for the current expert to respond before the next expert can participate
- Once all experts have responded in a round, you can advance to the next round
- The "Next Round" button appears when all experts have responded

### Parallel Mode
- All experts can respond simultaneously in each round
- Choose any expert at any time
- Multiple experts can provide responses without waiting for others
- More suitable for getting diverse perspectives quickly

## How Rounds Work

### Round Structure
- Each discussion starts at Round 1
- Current round is displayed at the top of the expert selection panel
- Messages are grouped by rounds internally

### Sequential Mode Flow
```
Round 1:
1. User asks question
2. Expert A responds
3. Expert B responds
4. Expert C responds
5. "Next Round" button appears
6. Click "Next Round" to advance to Round 2

Round 2:
1. User asks follow-up
2. Process repeats...
```

### Parallel Mode Flow
```
Round 1:
1. User asks question
2. Can get responses from any/all experts
3. Experts can respond in any order
4. All experts can participate simultaneously

Round 2:
1. User asks follow-up
2. Process repeats...
```

## Usage Guide

### Using Sequential Mode
1. Start with your question
2. Only the next available expert in sequence will be selectable
3. Wait for each expert's response
4. Once all experts have responded, click "Next Round"
5. Ask your follow-up question to start the next round

### Using Parallel Mode
1. Start with your question
2. Select any available expert to get their perspective
3. Can immediately select another expert for their view
4. All experts are available simultaneously
5. More flexible for gathering multiple viewpoints quickly

The interface adapts to each mode:
- Sequential: Shows only the next available expert
- Parallel: Shows all experts simultaneously
- Round indicator shows current round number
- "Next Round" button appears in sequential mode when appropriate