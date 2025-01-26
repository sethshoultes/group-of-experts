# Expert UI Enhancement Specification

## Overview
Enhance the discussion interface to clearly visualize expert relationships, message references, and interaction patterns while maintaining a clean and intuitive user experience.

## Core Features

### 1. Expert Relationship Visualization
- Expert profile cards with relationship indicators
- Expertise overlap visualization
- Interaction history between experts
- Dynamic relationship strength indicators

### 2. Message Reference System
- Visual reference connections
- Interactive quote highlighting
- Reference preview tooltips
- Reference navigation shortcuts

### 3. Enhanced Message Threading
- Visual thread connections
- Expert-specific thread styling
- Collapsible thread groups
- Thread context indicators

## Technical Implementation

### 1. UI Components

#### Expert Relationship Panel
```typescript
interface ExpertRelationship {
  expertA: string;
  expertB: string;
  interactionCount: number;
  agreementRate: number;
  sharedExpertise: string[];
}

interface ExpertRelationshipPanelProps {
  experts: ExpertRole[];
  relationships: ExpertRelationship[];
  onExpertSelect: (expertId: string) => void;
}

function ExpertRelationshipPanel({
  experts,
  relationships,
  onExpertSelect
}: ExpertRelationshipPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Expert Relationships
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experts.map(expert => (
          <div
            key={expert.id}
            className="relative border rounded-lg p-4 hover:border-indigo-500 transition-colors"
          >
            {/* Expert Card Content */}
            <div className="flex items-center space-x-3 mb-3">
              <ExpertIcon icon={expert.icon} />
              <div>
                <h4 className="font-medium text-gray-900">{expert.name}</h4>
                <p className="text-sm text-gray-500">{expert.title}</p>
              </div>
            </div>
            
            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {expert.expertise.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800"
                >
                  {skill}
                </span>
              ))}
            </div>
            
            {/* Relationship Indicators */}
            <div className="border-t pt-3">
              <div className="text-sm text-gray-600">
                Interactions with:
                {relationships
                  .filter(r => r.expertA === expert.id || r.expertB === expert.id)
                  .map(r => {
                    const otherExpert = experts.find(e => 
                      e.id === (r.expertA === expert.id ? r.expertB : r.expertA)
                    );
                    return (
                      <div
                        key={r.expertA + r.expertB}
                        className="flex items-center justify-between mt-2"
                      >
                        <span>{otherExpert?.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {r.interactionCount} interactions
                          </span>
                          <div
                            className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden"
                            title={`${r.agreementRate}% agreement rate`}
                          >
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${r.agreementRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Referenced Message Display
```typescript
interface ReferencedMessageProps {
  message: ExpertMessage;
  references: MessageReference[];
  onReferenceClick: (reference: MessageReference) => void;
}

function ReferencedMessage({
  message,
  references,
  onReferenceClick
}: ReferencedMessageProps) {
  return (
    <div className="relative group">
      {/* Message Content */}
      <div className="rounded-lg bg-white shadow-sm p-4">
        <div className="flex items-center space-x-2 mb-2">
          <ExpertIcon icon={message.expert.icon} />
          <span className="font-medium text-gray-900">
            {message.expert.name}
          </span>
        </div>
        
        {/* Referenced Content */}
        {references.length > 0 && (
          <div className="mb-3 pl-4 border-l-2 border-gray-200">
            {references.map(ref => (
              <div
                key={ref.messageId}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                onClick={() => onReferenceClick(ref)}
              >
                <span className="text-xs text-gray-400">
                  Re: {ref.expert.name}
                </span>
                <p className="mt-1">{ref.quote || ref.summary}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Main Message */}
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
        
        {/* Reference Indicators */}
        <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {message.metadata.interactionType && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100">
              {message.metadata.interactionType}
            </span>
          )}
        </div>
      </div>
      
      {/* Reference Lines */}
      {references.map(ref => (
        <div
          key={ref.messageId}
          className="absolute left-0 w-px bg-indigo-200 group-hover:bg-indigo-400 transition-colors"
          style={{
            top: '0',
            height: '100%',
            transform: `translateX(${ref.level * 16}px)`
          }}
        />
      ))}
    </div>
  );
}
```

#### Thread Visualization
```typescript
interface ThreadVisualizationProps {
  thread: MessageThread;
  onThreadCollapse: (threadId: string) => void;
  onMessageSelect: (messageId: string) => void;
}

function ThreadVisualization({
  thread,
  onThreadCollapse,
  onMessageSelect
}: ThreadVisualizationProps) {
  return (
    <div className="relative">
      {/* Thread Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onThreadCollapse(thread.id)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Thread: {thread.messages[0].expert.name}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {thread.messages.length} messages
        </span>
      </div>
      
      {/* Thread Messages */}
      <div className="space-y-4 pl-6 border-l-2 border-gray-100">
        {thread.messages.map(message => (
          <div
            key={message.id}
            className="relative"
            onClick={() => onMessageSelect(message.id)}
          >
            <div className="absolute -left-6 top-1/2 w-6 h-px bg-gray-200" />
            <ReferencedMessage
              message={message}
              references={message.references}
              onReferenceClick={ref => onMessageSelect(ref.messageId)}
            />
          </div>
        ))}
      </div>
      
      {/* Child Threads */}
      {thread.childThreads.map(childThread => (
        <div key={childThread.id} className="ml-6 mt-4">
          <ThreadVisualization
            thread={childThread}
            onThreadCollapse={onThreadCollapse}
            onMessageSelect={onMessageSelect}
          />
        </div>
      ))}
    </div>
  );
}
```

### 2. Interaction Patterns

#### Expert Selection Flow
```typescript
interface ExpertSelectionFlowProps {
  experts: ExpertRole[];
  selectedExperts: string[];
  onExpertSelect: (expertId: string) => void;
  onExpertDeselect: (expertId: string) => void;
}

function ExpertSelectionFlow({
  experts,
  selectedExperts,
  onExpertSelect,
  onExpertDeselect
}: ExpertSelectionFlowProps) {
  return (
    <div className="space-y-4">
      {/* Selected Experts */}
      <div className="flex flex-wrap gap-2">
        {selectedExperts.map(expertId => {
          const expert = experts.find(e => e.id === expertId);
          return (
            <div
              key={expertId}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-100"
            >
              <ExpertIcon icon={expert?.icon} className="h-4 w-4" />
              <span className="text-sm text-indigo-900">{expert?.name}</span>
              <button
                onClick={() => onExpertDeselect(expertId)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Expert Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {experts
          .filter(e => !selectedExperts.includes(e.id))
          .map(expert => (
            <button
              key={expert.id}
              onClick={() => onExpertSelect(expert.id)}
              className="text-left p-4 rounded-lg border hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ExpertIcon icon={expert.icon} />
                <div>
                  <h4 className="font-medium text-gray-900">{expert.name}</h4>
                  <p className="text-sm text-gray-500">{expert.title}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {expert.expertise.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
```

## Visual Design Guidelines

### 1. Expert Identification
- Consistent color coding per expert
- Distinctive icons for different roles
- Clear visual hierarchy in threads
- Expert badges and indicators

### 2. Reference Visualization
- Clear connection lines
- Hover states for references
- Quote highlighting
- Reference preview cards

### 3. Thread Organization
- Indentation for nested threads
- Visual separators between threads
- Collapse/expand controls
- Thread depth indicators

## Interaction Patterns

### 1. Expert Selection
- Multi-select capability
- Expertise filtering
- Relationship-based suggestions
- Clear selection indicators

### 2. Reference Creation
- Text selection for quotes
- Reference preview
- Multiple reference support
- Reference type selection

### 3. Thread Navigation
- Smooth scrolling to references
- Keyboard shortcuts
- Thread jumping
- Context preservation

## Performance Considerations

### 1. Rendering Optimization
- Virtualized thread lists
- Lazy loading of references
- Efficient SVG rendering
- Animation performance

### 2. State Management
- Normalized thread data
- Cached reference lookups
- Optimistic updates
- Efficient re-renders

### 3. Interaction Handling
- Debounced updates
- Throttled animations
- Efficient event delegation
- Memory management

## Accessibility Requirements

### 1. Keyboard Navigation
- Focus management
- Keyboard shortcuts
- ARIA landmarks
- Focus trapping

### 2. Screen Readers
- Semantic markup
- ARIA labels
- Live regions
- Status announcements

### 3. Visual Accessibility
- Color contrast
- Focus indicators
- Text scaling
- Motion reduction

## Implementation Phases

### Phase 1: Core UI
1. Expert relationship panel
2. Basic message threading
3. Simple reference display
4. Essential interactions

### Phase 2: Enhanced Visualization
1. Advanced thread visualization
2. Rich reference display
3. Expert relationship indicators
4. Interaction patterns

### Phase 3: Optimization
1. Performance improvements
2. Accessibility enhancements
3. Animation refinements
4. State management

### Phase 4: Polish
1. Visual refinements
2. Interaction improvements
3. Edge case handling
4. Final testing

## Success Metrics

### 1. User Experience
- Time to select experts
- Reference creation speed
- Thread navigation efficiency
- User satisfaction scores

### 2. Performance
- Initial render time
- Interaction latency
- Memory usage
- Animation FPS

### 3. Accessibility
- Keyboard navigation success
- Screen reader compatibility
- WCAG compliance
- User feedback

## Next Steps

1. Component Development
   - Build core UI components
   - Implement basic interactions
   - Set up state management
   - Create initial styles

2. Visual Design
   - Finalize color scheme
   - Create expert icons
   - Design reference indicators
   - Define animations

3. Interaction Testing
   - User flow validation
   - Performance testing
   - Accessibility audit
   - Cross-browser testing

4. Documentation
   - Component documentation
   - Interaction guidelines
   - Accessibility notes
   - Performance recommendations