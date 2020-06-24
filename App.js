Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items: [
        {
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'container',
                    id: 'fieldbox',
                    width: 80
                },
                {
                    xtype: 'container',
                    id: 'filterbox',
                    flex: 1
                }
            ]
            
        }
    ],
    modelNames: ['Task'],
    launch: function() {
        var me = this;
        var blackListFields = ['Successors', 'Predecessors', 'DisplayColor'],
            whiteListFields = ['Milestones', 'Tags'];

        this.down('#fieldbox').add({
            xtype: 'rallybutton',
            text: 'Fields',
            width: 60,
            margin: 10,
            handler: function() {
                if (me.down('#fieldPicker'). isVisible()) {
                    me.down('#fieldPicker').hide();
                    me._redrawGrid();
                }
                else {
                    me.down('#fieldPicker').show();
                    me.down('#fieldPicker').refreshView();
                }
            },
            scope: me
        });
        var fieldpicker = this.down('#filterbox').add({
                xtype: 'rallyfieldpicker',
                id: 'fieldPicker',
                modelTypes: this.modelNames
        });

        fieldpicker.hide();


        this.down('#filterbox').add({
            xtype: 'rallyinlinefiltercontrol',
            context: this.getContext(),
            height: 26,
            margin: 7,
            inlineFilterButtonConfig: {
                stateful: true,
                stateId: this.getContext().getScopedStateId('inline-filter'),
                context: this.getContext(),
                modelNames: this.modelNames,
                filterChildren: false,
                inlineFilterPanelConfig: {
                    quickFilterPanelConfig: {
                        defaultFields: ['ArtifactSearch', 'Owner', 'Iteration', 'State'],
                        addQuickFilterConfig: {
                            blackListFields: blackListFields,
                            whiteListFields: whiteListFields
                        }
                    },
                    advancedFilterPanelConfig: {
                        advancedFilterRowsConfig: {
                            propertyFieldConfig: {
                                blackListFields: blackListFields,
                                whiteListFields: whiteListFields
                            }
                        }
                    }
                },
                listeners: {
                    inlinefilterchange: this._onFilterChange,
                    inlinefilterready: this._onFilterReady,
                    scope: this
                }
            }
        });

    },

    _onFilterChange: function(inlineFilterButton) {
        this.filterInfo = inlineFilterButton.getTypesAndFilters();
        this._redrawGrid();
    },

    _redrawGrid: function() {
        var me = this;
        var columnCfgs = [
                    'FormattedID',
                    'Name'
                ].concat(me.down('#fieldPicker').getSubmitValue());
        var grid = this.down('rallygrid');
        if (grid) { 
            grid.destroy();
        }
        
        grid = this.add({
            xtype: 'rallygrid',
            columnCfgs: columnCfgs,
            context: this.getContext(),
            storeConfig: {
                models: me.filterInfo.types,
                filters: me.filterInfo.filters,
                sorters: [
                    {
                        property: 'WorkProduct.DragAndDropRank',
                        direction: 'ASC'
                    },
                    {
                        property: 'TaskIndex',
                        direction:' ASC'
                    }
                ],
            }
        });
    },

    _onFilterReady: function(inlineFilterPanel) {
        this.add(inlineFilterPanel);
    }

});