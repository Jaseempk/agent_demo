// {
//     lc_serializable: false,
//     lc_kwargs: {
//       checkpointer: MemorySaver {
//         serde: JsonPlusSerializer {},
//         storage: [Object],
//         writes: [Object]
//       },
//       interruptAfter: undefined,
//       interruptBefore: undefined,
//       autoValidate: false,
//       nodes: {
//         __start__: [PregelNode],
//         agent: [PregelNode],
//         tools: [PregelNode]
//       },
//       channels: {
//         messages: [BinaryOperatorAggregate],
//         structuredResponse: [LastValue],
//         __start__: [EphemeralValue],
//         agent: [EphemeralValue],
//         tools: [EphemeralValue],
//         'branch:__start__:__self__:agent': [EphemeralValue],
//         'branch:__start__:__self__:tools': [EphemeralValue],
//         'branch:agent:__self__:agent': [EphemeralValue],
//         'branch:agent:__self__:tools': [EphemeralValue],
//         'branch:tools:__self__:agent': [EphemeralValue],
//         'branch:tools:__self__:tools': [EphemeralValue],
//         '__start__:agent': [EphemeralValue],
//         'branch:agent:condition:tools': [EphemeralValue]
//       },
//       inputChannels: '__start__',
//       outputChannels: [ 'messages', 'structuredResponse' ],
//       streamChannels: [ 'messages', 'structuredResponse' ],
//       streamMode: 'updates',
//       store: undefined,
//       name: undefined
//     },
//     lc_runnable: true,
//     name: undefined,
//     lc_namespace: [ 'langgraph', 'pregel' ],
//     lg_is_pregel: true,
//     nodes: {
//       __start__: PregelNode {
//         lc_serializable: true,
//         lc_kwargs: [Object],
//         lc_runnable: true,
//         name: undefined,
//         lc_namespace: [Array],
//         bound: [RunnablePassthrough],
//         config: [Object],
//         kwargs: {},
//         configFactories: undefined,
//         lc_graph_name: 'PregelNode',
//         channels: [Array],
//         triggers: [Array],
//         mapper: undefined,
//         writers: [Array],
//         metadata: {},
//         tags: [Array],
//         retryPolicy: undefined,
//         subgraphs: undefined,
//         ends: undefined
//       },
//       agent: PregelNode {
//         lc_serializable: true,
//         lc_kwargs: [Object],
//         lc_runnable: true,
//         name: undefined,
//         lc_namespace: [Array],
//         bound: [RunnableCallable],
//         config: [Object],
//         kwargs: {},
//         configFactories: undefined,
//         lc_graph_name: 'PregelNode',
//         channels: [Object],
//         triggers: [Array],
//         mapper: [Function (anonymous)],
//         writers: [Array],
//         metadata: {},
//         tags: [],
//         retryPolicy: undefined,
//         subgraphs: undefined,
//         ends: undefined
//       },
//       tools: PregelNode {
//         lc_serializable: true,
//         lc_kwargs: [Object],
//         lc_runnable: true,
//         name: undefined,
//         lc_namespace: [Array],
//         bound: [ToolNode],
//         config: [Object],
//         kwargs: {},
//         configFactories: undefined,
//         lc_graph_name: 'PregelNode',
//         channels: [Object],
//         triggers: [Array],
//         mapper: [Function (anonymous)],
//         writers: [Array],
//         metadata: {},
//         tags: [],
//         retryPolicy: undefined,
//         subgraphs: undefined,
//         ends: undefined
//       }
//     },
//     channels: {
//       messages: BinaryOperatorAggregate {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'BinaryOperatorAggregate',
//         value: [],
//         operator: [Function: messagesStateReducer],
//         initialValueFactory: [Function: default]
//       },
//       structuredResponse: LastValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'LastValue',
//         value: []
//       },
//       __start__: EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: true,
//         value: []
//       },
//       agent: EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       tools: EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       'branch:__start__:__self__:agent': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       'branch:__start__:__self__:tools': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       'branch:agent:__self__:agent': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       'branch:agent:__self__:tools': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       'branch:tools:__self__:agent': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       'branch:tools:__self__:tools': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       },
//       '__start__:agent': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: true,
//         value: []
//       },
//       'branch:agent:condition:tools': EphemeralValue {
//         ValueType: undefined,
//         UpdateType: undefined,
//         lg_is_channel: true,
//         lc_graph_name: 'EphemeralValue',
//         guard: false,
//         value: []
//       }
//     },
//     inputChannels: '__start__',
//     outputChannels: [ 'messages', 'structuredResponse' ],
//     autoValidate: false,
//     streamMode: [ 'updates' ],
//     streamChannels: [ 'messages', 'structuredResponse' ],
//     interruptAfter: undefined,
//     interruptBefore: undefined,
//     stepTimeout: undefined,
//     debug: false,
//     checkpointer: MemorySaver {
//       serde: JsonPlusSerializer {},
//       storage: {
//         'test4-1746688715512': [Object],
//         'test4-1746689071367': [Object],
//         'test4-1746689200571': [Object]
//       },
//       writes: {
//         '["test4-1746688715512","","1f02bdca-7ba9-6db0-ffff-7b042da1ddf4"]': [Object],
//         '["test4-1746688715512","","1f02bdca-7bc9-6980-8000-0158a5fb1f1f"]': [Object],
//         '["test4-1746689071367","","1f02bdd7-bd30-6880-ffff-46ff4d49580e"]': [Object],
//         '["test4-1746689071367","","1f02bdd7-bd4b-6630-8000-8d6a90345e54"]': [Object],
//         '["test4-1746689200571","","1f02bddc-8d5f-6fc0-ffff-a20a9dc12cf9"]': [Object],
//         '["test4-1746689200571","","1f02bddc-8d64-6de0-8000-96b0ce6f453f"]': [Object]
//       }
//     },
//     retryPolicy: undefined,
//     config: undefined,
//     store: undefined,
//     builder: StateGraph {
//       nodes: { agent: [Object], tools: [Object] },
//       edges: Set(2) { [Array], [Array] },
//       branches: { agent: [Object] },
//       entryPoint: undefined,
//       compiled: true,
//       channels: {
//         messages: [BinaryOperatorAggregate],
//         structuredResponse: [LastValue]
//       },
//       waitingEdges: Set(0) {},
//       _schemaDefinition: {
//         messages: [BinaryOperatorAggregate],
//         structuredResponse: [Function]
//       },
//       _schemaRuntimeDefinition: undefined,
//       _inputDefinition: {
//         messages: [BinaryOperatorAggregate],
//         structuredResponse: [Function]
//       },
//       _inputRuntimeDefinition: undefined,
//       _outputDefinition: {
//         messages: [BinaryOperatorAggregate],
//         structuredResponse: [Function]
//       },
//       _outputRuntimeDefinition: undefined,
//       _schemaDefinitions: Map(1) { [Object] => [Object] },
//       _configSchema: undefined,
//       _configRuntimeSchema: undefined
//     }
//   }