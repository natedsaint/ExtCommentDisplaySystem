Ext.live = function (selector, event, handler, scope) {
  Ext.getBody().on(event, function(event, target){
    handler.apply(Ext.get(target), arguments);
  }, scope, {
    delegate: selector,
    scope:scope
  });
};

Ext.define('CDS.plugin.Clickable',{
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.clickable',

  init: function (component) {
    component.addEvents({ click: true });
    component.on('render', this.onRender, component);

  },
  onRender: function () {
    var component = this;

    component.getEl().on('click', function () {
      var component = this;
      component.fireEvent('click', component);
    }, component);
  }
});

Ext.define('CDS.view.DocHolder',{
  extend: 'Ext.Component',
  tpl:'<aside><span class="closeButton">X</span>{content}</aside>'
});

Ext.define('CDS.view.SearchField',{
  extend:'Ext.Component',
  html:'<input type="text" placeholder="Search comments" />'
});

Ext.define('CDS.view.CommentButton',{
  alias:'widget.commentbutton',
  extend:'Ext.Component',
  defaultText:'Show Comments',
  html:'<div class="button comments">&#9997; Load Comments</div>',
  plugins:['clickable']
});

Ext.define('CDS.view.CommentHolder',{
  openComments: [],
  extend:'Ext.Component',
  plugins:['clickable'],
  alias:'widget.comment',
  tpl: new Ext.XTemplate(
    '<tpl for=".">',
      '<div class="comment {[this.checkForOpenComments(values,parent)]}" data-storeId="{[this.getStoreId(values)]}">',
        '<img src="avatar.png" class="userPortrait" style="{[this.generateUserColorClasses(values)]}" />',
        '<span class="userName">{[this.getUser(values)]}</span>',
        '<span class="date">{[this.getDate(values)]}</span>',
        '<div class="commentContent">{[this.getComment(values)]}</div>',
        '<tpl if="this.hasChildren(values)">',
          '<div class="childComments">',
            '{[ this.recurse(values) ]}',
          '</div>',
        '</tpl>',
      '</div>',
     '</tpl>',
      {
        getStoreId: function(values) {
          return values.internalId;
        },
        checkForOpenComments:function (values) {
          var CommentHolder = CDS.app.getController('Comments').CommentHolder,
              className = "";

          if (CommentHolder) {
            if (Ext.Array.contains(CommentHolder.openComments,values.internalId)) {
              className = "open";
            }
          }
          return className;
        },
        hasChildren: function(model) {
          return (model.children().count() > 0);
        },
        generateUserColorClasses: function(model) {
          // normally I don't condone inline styles (for specificity 
          // and also performance reasons) but since
          // we're generating the color on the fly this works best
          var user = model.getUser(),
              first = user.get("firstName"),
              last = user.get("lastName"),
              fullName = first+last,
              background = '',
              border = '',
              nameArray,
              total = 0,
              nameLength;

          nameArray = fullName.toUpperCase().split('');
          nameArray = nameArray.map(this.letterConvert);
          nameLength = nameArray.length;

          while(nameLength--) {
            total += nameArray[nameLength]*2;
          }

          // I prefer HSLA because we can keep the saturation and lightness
          // constant with a random-ish number, and hue is just degrees on a circle
          // so any integer is valid.

          background = "hsla("+total+",40%,45%,1)";

          // We are adding a darker border of the same hue to visually blend the internal image
          // and create the illusion we're altering the image in some way.

          border = "hsla("+total+",35%,25%,1)";

          return "background-color:"+background+";border:2px solid "+border;
        },
        recurse: function(values) {
          return this.apply(values.children());
        },
        getUser:function(model) {
          var user = model.getUser(),
              returnString = user.get("firstName")+" "+user.get("lastName");
          return returnString;
        },
        convertToUTC: function(date) {
          // safest cross-browser way to deal with UTC
          var utcDate =  new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes()
          ));
          return utcDate;
        },
        letterConvert : function(val) {
          var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;

          for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
            result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
          }
          return result;
        },
        getDate:function(model) {
          var now = window.getCurrentTime(), // was never in UTC, it was declared as a simple time and it takes client browser's timezone
              nowutc = this.convertToUTC(now),
              commentTime = model.get('date'), // was defined in UTC but my browser converted it to my time zone when Ext parsed it
              commentutc = this.convertToUTC(commentTime),
              difference = nowutc.getTime()-commentutc.getTime(),
              map = [],
              mapping,
              text,
              thisValue,
              nextValue,
              thisMap,
              nextMap,
              otherValue;

          map.push({ms:0,txt: "a few seconds ago"});
          map.push({ms:1000*60,txt:"{x} minute(s) ago"});
          map.push({ms:1000*60*60,txt: "{x} hour(s) ago"});
          map.push({ms:1000*60*60*24,txt: "{x} day(s) ago"});
          map.push({ms:1000*60*60*24*30,txt: "{x} month(s) ago"}); // rough math, just means 30 days worth of milliseconds, not a calendar year
          map.push({ms:1000*60*60*24*365,txt: "{x} year(s) ago"});

          for (mapping in map) {
            if (map.hasOwnProperty(mapping)) {
              thisMap = map[mapping];
              nextMap = map[parseInt(mapping,10)+1];
              thisValue = thisMap.ms;
              nextValue = nextMap.ms || 0;
              if (difference >= thisValue && difference < nextValue ) {
                otherValue = difference / thisValue;
                text = thisMap.txt.replace("{x}",Math.round(otherValue));
                if (otherValue === 1) {
                  text = text.replace(/\(s\)/,"");
                } else {
                  text = text.replace(/\(s\)/,"s");
                }
                return text;
              }
            }
          }

          return "Negative value!";

        },
        getComment:function(model) {
          var comment = model.get("searchText"),
              scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
          comment = comment.replace(scriptPattern,''); // use the script tag regEx the jQuery guys use to avoid XSS.
          return comment;
        }
      }
  )
});
