Ext.define("CDS.model.User",{
  extend:'Ext.data.Model',
  fields:[
    {
      name:'firstName',
      type:'string'
    },
    {
      name:'lastName',
      type:'string'
    }
  ]
});

Ext.define("CDS.model.Comment",{
  extend:'Ext.data.Model',
  requires:'CDS.model.User',
  fields:[
    {
      name:'text',
      type:'string'
    },
    {
      name:'searchText',
      type:'string',
      persist: false,
      convert:function(value,record) {
        if (!record.get("searchString")) {
          return record.get("text");
        }
        var searchValue = record.get('searchString'),
            oldValue = record.get("text"),
            newValue,
            pattern = new RegExp("("+searchValue+")","gi");
        newValue = oldValue.replace(pattern,"<span class=\"searchResults\">$1</span>"); // man, this looks like perl
        return newValue;
      }
    },
    {
      name:'searchString',
      type:'string',
      persist:false
    },
    {
      name:'date',
      type:'date',
      dateFormat:'time' // JS millisecond timestamp
    }
  ],
  associations: [
    {
      type: 'hasMany',
      model: 'CDS.model.Comment',
      associationKey: 'children',
      name:'children'
    },
    {
      type: 'hasOne',
      model: 'CDS.model.User',
      associationKey: 'user',
      getterName:'getUser',
      name: 'user'
    }
  ],
  set: function(fieldName) { // enforce updating of the converted field
    this.callParent(arguments);
    if (fieldName==='searchString') {
      this.set('searchText');
    }
  }
});



