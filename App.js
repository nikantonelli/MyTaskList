Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        this.add({
            xtype: 'rallyfieldvaluecombobox',
            itemId: 'ownerComboBox',
            fieldLabel: 'Filter by Owner:',
            model: 'Task',
            stateful: true,
            stateId: 'tmp'+Ext.id(),
            field: 'Owner',
            listeners: {
                select: this._onSelect,
                ready: this._onLoad,
                scope: this
            }
        });
    },

    _onLoad: function() {
        this.add({
            xtype: 'rallygrid',
            columnCfgs: [
                'FormattedID',
                'Name',
                'State',
                'Owner',
                'WorkProduct'
            ],
            context: this.getContext(),
            storeConfig: {
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
                model: 'task',
                filters: [this._getOwnerFilter()]
            }
        });
    },
    _getOwnerFilter: function() {
        return {
            property: 'Owner',
            operator: '=',
            value: this.down('#ownerComboBox').getValue()
        };
    },

    _onSelect: function() {
        var grid = this.down('rallygrid'),
            store = grid.getStore();

        store.clearFilter(true);
        store.filter(this._getOwnerFilter());
    }
});