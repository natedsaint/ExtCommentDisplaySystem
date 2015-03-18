General
------------
My style rules are consistent but they may not match the standards of your organization. The rules I follow are:

* Use 2 spaces for tabs
* Use "Egyptian" style braces (opening brace belongs to the line that began it, not the line below)
* Avoid use of "one-line" ifs, etc. 
* Code paragraphs required for methods and blocks of functionality
* Variables declared together at top of scope 

My CSS and JavaScript have been fully linted, though I don't follow all linting rules. Here are the ones I avoid and why

### CSS
* adjoining classes -- I do not code for IE6 or older in my main stylesheets. If I need to support them, I make a custom sheet.
* box-model warnings -- I ignore most of these as I'm careful to account for border, padding, and margin when I declare widths/heights
* duplicate assignments -- I use specificity to cascade styles, so sometimes I need duplicate assignments.

### JavaScript
* Incrementers/Decrementers -- Like most linting rules, the trick is knowing the value of the rule. I only use ++ or -- safely. Also without them we can't do the most efficient while loop in JavaScript: while (length--)
* Insecure regex ([^] and .) -- This is "unsafe" because it allows unicode characters. While I agree it's unsafe to trust user input, that's best handled separately.

### HTML5
* I validate with the w3c validator, and this markup validates with no errors, but as the html5 spec is not yet final, this is subject to change.

Features
------------
This application is a self-contained ExtJS application comment display module. It is designed to take a given nested json data model and convert it into an interface that allows you to see the relationships between comments.

It features the latest HTML5 and CSS3 capabilities, and utilizes the ExtJS 4.2 GPL release to provide an MVC framework.

Along with meeting the criteria of the original challenge, it also contains the following functionality:  

* nested comments highlight in increasingly dark hue to give the user an idea of the depth of the comment
* the avatar pictures contain a dynamically generated background color that has been generated from their name
* the times are given relative to the provided time in the util.js functions, and tell you how old the comment is relative to that time. 
  * The time is displayed in the largest unit available, starting from "a few seconds" if under a minute. 
  * The syntax is correct to English pluralization (IE one minute vs two minutes)
  * It updates the view once every minute.
* a responsive stylesheet is used to make the rendered view scale to the size of your browser window or device. Feel free to resize!
* tested to work in the latest browser version of Chrome/FireFox/Internet Explorer/Safari/Opera. Safari is the only browser that has a problem with non-vendor-prefixed declarations. This can be fixed with the [prefix-free framework](http://leaverou.github.io/prefixfree/) but I decided to avoid the bloat in this project as the requirement was the latest versions of the browsers, and targeting chrome specifically. The only vendor-prefixed selectors I used were the webkit ones for styling scrollbars, but these degrade gracefully. 

Architecture / Design Choices
------------
Typically, an Ext app is namespaced by the type of comment so that you can dynamically load using a directory structure that follows the namespacing. Since this is a small project and is intended to be inspected, I've chosen to reduce it to just the base class as a filename, for example Models.js or Stores.js. This would also make this process much faster if you chose to use a build process and reduce the component files to a single minified/compressed file.


The CommentHolder visual component was designed for the most optimal user experience. It could be argued that creating a view for the atomic unit of
comments and then recursively creating those for child components would be more OOP, but this includes a great deal of overhead, as each ExtJS component
will introduce a good bit of bloat not only to the DOM but in internal components and events registered on the event bus. The drawback to my approach is that I have to do some DOM manipulation, but I do it completely through the component to avoid cluttering up the DOM or doing anything to introduce tight coupling to the rendered document.

Notes
------------
The comments expand once you click on them, but they don't have a way to collapse back down. To me, this makes sense from a UX perspective if you believe 
the operation was to reveal the comment and introduce it to the view. Removing it would serve no purpose other than to make it quicker to view, but that
could be accomplished in other ways. Additionally, refreshing the comments will create a new instance of the records, which forces the view to be redrawn. This collapses all the existing records, which makes sense if you're assuming that the data is new and refreshed. Relationships could have changed, and the previous open comments may now be irrelevant. 

Every minute, the view is completely redrawn using the XTemplate's update() methodology, but we cache which comments are open in order to draw them as open when we redraw the view (take a look at CDS.view.CommentHolder's "openComments" config). 

The "loading comments" modal will appear and disappear very rapidly as there is no server processing required to fetch the json data source, but if you want to see what it looks like, you can simply call "setLoading()" on any component from the console to see how it is rendered.

License
------------
This readme file is written in markdown format, and is parsed into HTML live by using the [markdown-js](https://github.com/evilstreak/markdown-js) library which is released under the [MIT](http://opensource.org/licenses/MIT) license. ExtJS 4.2 is released under the [GPL](http://www.gnu.org/licenses/gpl.html) license. All other code is licensed by Nathan St. Pierre, and where applicable follows the license of the incorporated libraries.
