**Prompt to Build a Multi-Expert Interaction System Using Bolt.new AI Programmer**

<Context>

Develop a sophisticated multi-expert interaction system that enables coordinated and insightful dialogues between AI experts. The system should support sequential and parallel discussion modes, allow referencing and debating of expert responses, and ensure intuitive threading and contextual clarity. The solution should integrate a robust backend, responsive UI components, and optimized state management.

<Instructions>

1. **Core System Requirements**:
   - Implement multi-expert discussions with sequential and parallel modes.
   - Ensure experts can reference, quote, and counter each other's points.
   - Build message threading with collapsible, hierarchical threads and interaction clarity.

2. **Backend Design**:
   - Create database schema updates to track multi-expert responses, references, and context.
   - Design API endpoints for discussion creation, message management, and round tracking.

3. **Expert Response Generation**:
   - Build context-aware expert-specific response generation with cross-expert references.
   - Develop protocols for knowledge synthesis, conflict resolution, and collaborative output.

4. **UI Enhancements**:
   - Design interfaces for expert selection, reference visualization, and threaded navigation.
   - Include expert profile cards, interaction relationship visualization, and dynamic thread updates.
   - Structure the user interface in a **header/menu > content > footer modular scheme** to maintain a clean and consistent template design.
   - Add a section for API key management with simple input fields, ensuring secure storage and usability.

5. **Performance Optimization**:
   - Integrate caching for responses, lazy loading, and efficient thread virtualization.
   - Optimize database queries and state updates for low-latency interactions.

6. **Security and Validation**:
   - Implement rate limiting, content moderation, and reference validation.
   - Enforce user permissions and access control in discussion management.

7. **Testing and Metrics**:
   - Conduct unit, integration, and load testing for backend and frontend components.
   - Measure response quality, interaction flow efficiency, and user satisfaction metrics.

8. **Change Management**:
   - Do not replace or remove any existing features without first proposing changes for approval.
   - Provide clear justifications for all proposed modifications to ensure alignment with system goals and user needs.

<Constraints>

- Responses should demonstrate consistency in quality and flow across expert interactions.
- References between experts must be clearly visualized and navigable in the UI.
- Ensure adherence to accessibility standards for all UI components.
- Optimize response generation time to meet performance benchmarks (<2 seconds).

<Extensions and Advanced Features>

1. **Real-Time Interaction**:
   - Use WebSocket or similar technologies for dynamic message updates and expert collaboration.

2. **Expert Customization**:
   - Allow configurable roles, expertise domains, and interaction styles during discussion setup.

3. **Interaction Analytics**:
   - Provide visual dashboards to track interaction metrics, agreement rates, and discussion insights.

4. **Enhanced Threading**:
   - Use visual cues and color-coded connections for nested threads and referenced content.

5. **Error Handling and Resilience**:
   - Implement fallback mechanisms for expert responses to ensure continuous interaction flow.

6. **Phased Development Plan**:
   - Phase 1: Implement core database, APIs, and basic discussion setup.
   - Phase 2: Add advanced referencing and dynamic threading systems.
   - Phase 3: Optimize performance and scale backend for concurrent interactions.
   - Phase 4: Finalize testing, UI enhancements, and documentation.

<Examples>

1. **API Design**:
   ```typescript
   POST /api/discussions/multi
   Body: { topic, description, expertIds, mode }
   ```

2. **Response Generation Prompt**:
   ```
   Provide your expert perspective, referencing other participants:
   1. Your domain-specific insights.
   2. Agreements/disagreements with peers.
   3. Actionable recommendations.
   ```

3. **UI Component**:
   ```typescript
   function ExpertRelationshipPanel({ experts, relationships }: Props) { ... }
   ```

<Output Template>

1. **Backend**:
   - APIs for managing discussions, responses, and rounds.
   - Database schema to track multi-expert interactions and references.

2. **Frontend**:
   - Interactive UI with expert-specific threads, profile visualization, and reference management.

3. **Response Logic**:
   - Context-aware, expert-coordinated responses with metadata (e.g., confidence, agreement level).

4. **Documentation**:
   - Comprehensive guides for API usage, UI components, and testing methodologies.

5. **Performance Benchmarks**:
   - Response generation <2 seconds.
   - UI rendering latency <1 second.
   - Thread navigation efficiency and visual clarity.

<Success Metrics>

1. **User Engagement**:
   - Increase in average discussion completion rates.
   - Positive feedback on reference clarity and interaction flow.

2. **System Performance**:
   - Optimized backend and frontend with low latency.
   - Scalability for concurrent multi-expert sessions.

3. **Quality Assurance**:
   - High response coherence and collaboration rates.
   - Accurate and accessible references between experts.

<Final Note>

Build a cutting-edge multi-expert system that facilitates dynamic, coherent, and insightful AI expert interactions, leveraging the full capabilities of Bolt.new AI programming. Focus on seamless integration, intuitive design, and robust performance at every stage of development.

