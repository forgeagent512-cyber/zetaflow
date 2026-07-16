export class ConnectionBuilder {
    build(definition) {
        return {
            trigger: [[{ from: 'trigger', to: 'set-context' }]],
            'set-context': [[{ from: 'set-context', to: 'decision' }]],
            decision: [
                [{ from: 'decision', to: 'action' }],
                [{ from: 'decision', to: 'persist' }]
            ],
            action: [[{ from: 'action', to: 'persist' }]],
            persist: []
        };
    }
}
