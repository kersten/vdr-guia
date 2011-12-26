(function($) {
    $.fn.blinky = function(args) {
      var opts = { frequency: 1e3, count: -1 };
      args = $.extend(true, opts, args);  
      var i = 0;
      var that = this;
      var dfd = $.Deferred();
        function go() {
            if(that.length == 0) {
                return dfd.reject();    
            }
            if(i == args.count) {
                return dfd.resolve();
            }
          i++;
          $(that).fadeOut().fadeIn();
          setTimeout(go, args.frequency);
        };
        go();
        return dfd.promise();
    };
        
})(jQuery);
