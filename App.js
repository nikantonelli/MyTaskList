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
                    width: 100
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
    fieldNames: [],

    launch: function() {
        var me = this;
        Rally.data.PreferenceManager.load( {
            appId: this.getAppId(),
            filterByUser: true,
            filterByName: 'pickerFields',
            workspace: me.getContext().getWorkspace()._ref,
            success: function(results) {
                console.log('###prefs restored: ', results);
                if ( Object.keys(results).length) {
                    me.fieldNames = results.pickerFields.split(",") || [];
                }
                me._kickOff();
            },
            failure: function(e) {
                console.log('###prefs error: ', e);
            }
        });
    },

    _kickOff: function() {
        var me = this;
        var blackListFields = ['Successors', 'Predecessors', 'DisplayColor'],
            whiteListFields = ['Milestones', 'Tags'];

        this.down('#fieldbox').add({
            xtype: 'rallybutton',
            text: 'Fields',
            width: 80,
            margin: 10,
            iconCls: 'x4-btn-icon-el icon-add-column',
            //iconOnly: true,
            handler: function() {
                if (me.down('#fieldPicker'). isVisible()) {
                    me.down('#fieldPicker').hide();
                    me.down('#fieldPicker').refreshView();
//                    me._redrawGrid();
                }
                else {
                    me.down('#fieldPicker').show();
                    me.down('#fieldPicker').refreshView();
                }
            },
            scope: me
        });
        this.fieldpicker = this.down('#filterbox').add({
                xtype: 'rallyfieldpicker',
                id: 'fieldPicker',
                value: me.fieldNames,
                stateful: true,
                stateId: this.getContext().getScopedStateId('fieldPicker'),
                modelTypes: this.modelNames,
                listeners: {
                    selectionchange: function(picker) {
                        Rally.data.PreferenceManager.update({
                            appId: this.getAppId(),
                            filterByUser: true,
                            workspace: me.getContext().getWorkspace()._ref,
//                            project: me.getContext().getProject()._ref,
                            settings: { pickerFields : picker.getSubmitValue() },
                            success: function(updated) {
                                console.log('###prefs saved: ', updated);
                                me.fieldNames = picker.getSubmitValue();
                                me._redrawGrid();
                            },
                            failure: function(e) {
                                console.log('###prefs error2: ',e);
                            }
                        });
                    },
                    ready: me._redrawGrid,
                    scope: this
                },
        });

        Ext.util.Observable.capture( this.fieldpicker, function(event) { console.log('picker', event, arguments);});
        this.fieldpicker.hide();


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
                ].concat(me.fieldNames);
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