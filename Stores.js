Ext.define("CDS.store.Comments",{
  extend:'Ext.data.Store',
  model:'CDS.model.Comment',
  proxy: {
    type: 'ajax',
    url: 'json-comments-ds.json',
    reader: {
       type: 'json'
    }
  }
});