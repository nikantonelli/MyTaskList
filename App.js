Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var me = this;
        var modelNames = ['task'];
        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: modelNames,
            enableHierarchy: true,
            remoteSort: true,
            fetch: ['FormattedID', 'Name', 'State', 'WorkProduct', 'TaskIndex', 'Owner'],
            sorters: [
                {
                    property: 'WorkProduct.DragAndDropRank',
                    direction: 'ASC'
                },
                {
                    property: 'TaskIndex',
                    direction:' ASC'
                }
            ]
        }).then({
            success: function(store) { me._addGridboard(store, modelNames);},
            scope: me
        });
    },

    _addGridboard: function(store, modelNames) {
        console.log(this.getContext().getScopedStateId('filters'+Ext.id()));

        this.add({
            height: '100%',
            xtype: 'rallygridboard',
            gridConfig: {
                columnCfgs: [
                    'FormattedID',
                    'Name',
                    'State',
                    'Owner',
                    'WorkProduct'
                ],
                store: store
            },
            plugins: [
                {
                    ptype: 'rallygridboardinlinefiltercontrol',
                    inlineFilterButtonConfig: {
                        stateful: true,
                        stateId: this.getContext().getScopedStateId('filters'+Ext.id()),
                        modelNames: modelNames,
                        inlineFilterPanelConfig: {
                            quickFilterPanelConfig: {
                                whiteListFields: [
                                   'Tags',
                                   'Milestones'
                                ],
                                defaultFields: [
                                    'ArtifactSearch',
                                    'Owner',
                                    'Iteration'
                                ]
                            }
                        }
                    }
                },
                {
                    ptype: 'rallygridboardfieldpicker',
                    headerPosition: 'left',
                    modelNames: modelNames
                    //stateful: true,
                    //stateId: this.getContext().getScopedStateId('columns-example')
                }
            ],

            cardBoardConfig: {
                attribute: 'State'
            },
            toggleState: 'grid',
            modelNames: modelNames,
            context: this.getContext(),

        });
    },

    _onSelect: function() {
        var grid = this.down('rallygrid'),
            store = grid.getStore();

        store.clearFilter(true);
        store.filter(this._getOwnerFilter());
    }
});