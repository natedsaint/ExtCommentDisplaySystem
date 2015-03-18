Ext.define('CDS.controller.Comments', {
  extend: 'Ext.app.Controller',
  init: function() {
    var me = this;

    this.control({
      '#loadCommentButton': {
        click: me.onShowCommentsClicked,
        scope:me
      },
      '#searchForm':{
        render: me.bindSearchFormListeners,
        scope:me
      }
    });

    Ext.live('#readme','click',me.onReadmeClicked,me); // bind event listener to dom outside extJS app (read me link in footer)

    me.buildViews();
    setInterval(me.redrawComments,1000*60); // every minute, update the comments from the current data model.
  },
  onReadmeClicked: function(event,element,options) {
    var me = options.scope;

    Ext.Ajax.request({
      url:'README.md',
      success:function(response) {
        var doc = me.DocHolder,
            html;
        html = markdown.toHTML(response.responseText);
        doc.update({
          content:html
        });
        me.bindDocListeners(doc);
        doc.show();
      }
    });
  },
  bindSearchFormListeners: function(component) {
    var me = this,
        el = component.getEl(),
        searchValue,
        input,
        Comments,
        pattern;

    input = el.select('input');
    input.on('keyup',function(key) {
      if (key.button ===12) { // suppress enter key
        return false;
      }

      if (me.CommentHolder) {
        searchValue = this.value;
        pattern = new RegExp(searchValue,"gi");
        Comments = CDS.app.getStore("Comments");
        me.recurse(Comments,searchValue);
        me.CommentHolder.update(Comments);
        me.bindCommentListeners(me.CommentHolder);
      }
    });
  },
  recurse: function(store,searchValue) {
    var me = this;
    store.each(function(record) {
      record.set("searchString",searchValue);
      me.recurse(record.children(),searchValue);
    });
  },
  onShowCommentsClicked: function(button) {
    var me = this,
        Comments = CDS.app.getStore("Comments");
    button.update('<div class="button comments">&#8634; Refresh Comments</div>');
    Comments.load({callback:me.onCommentsLoaded,scope:me});
    if (!me.CommentHolder) {
      me.CommentHolder = Ext.create("CDS.view.CommentHolder",{
        itemId:'commentHolder',
        renderTo:'comments'
      });
    }
    if (!me.SearchForm) {
      me.SearchForm = Ext.create("CDS.view.SearchField",{
        itemId:'searchForm',
        renderTo:'searchHolder'
      });
    }
    me.CommentHolder.setLoading("Loading Comments...");
  },
  redrawComments:function() {
    var me = CDS.app.getController('Comments');
    if (me.CommentHolder) {
      me.CommentHolder.update(CDS.app.getStore("Comments"));
      me.bindCommentListeners(me.CommentHolder);
    }
  },
  buildViews:function() {
    var me = this;
    // cache the comment button to get ahold of it later if needed

    me.CommentButton = Ext.create("CDS.view.CommentButton",{
      itemId:'loadCommentButton',
      renderTo:'buttonHolder'
    });

    me.DocHolder = Ext.create("CDS.view.DocHolder",{
      renderTo:Ext.getBody()
    });

  },
  bindDocListeners: function(cmp) {
    var me = this,
        element = cmp.getEl(),
        closeButton = element.select('.closeButton');

    closeButton.on('click', function(){
      console.warn("clicked");
      me.DocHolder.hide();
    });
  },
  bindCommentListeners: function(cmp) {
    var me = this,
        element = cmp.getEl(),
        subcomments = element.select('.childComments .comment'),
        storeId;

    subcomments.on('click', function(){
      if (!this.className.match(/open/)) {
        this.className += " open";
        storeId = this.getAttribute("data-storeId");
        me.CommentHolder.openComments.push(storeId);
      }
    });
  },
  onCommentsLoaded:function(records){
    var me = this;
    me.CommentHolder.openComments.length = 0; // clear it out without creating a new object since we reference this elsewhere
    me.CommentHolder.update(records);
    me.bindCommentListeners(me.CommentHolder);
    me.CommentHolder.setLoading(false);
  }
});
