(function(){
    var startTime = new Date().getTime(),
        refTime   = new Date("Thu Dec 10 2009 05:29:30 GMT-0700").getTime();

    window.getCurrentTime = function(){
        var delta = (new Date().getTime()) - startTime;
        return new Date(refTime + delta);
    };
})();