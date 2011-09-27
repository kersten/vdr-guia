var AppController = Backbone.Controller.extend({
    initalize: function() {
        this.socket = new io.Socket();
        
        this.menu = new MenuView();

        /*this.model = new models.NodeChatModel();
        this.view = new NodeChatView({model: this.model, socket: this.socket, el: $('#content')});
        var view = this.view;

        this.socket.on('message', function(msg) {view.msgReceived(msg)});
        this.socket.connect();*/

        this.menu.render();

        return this;
    }
});