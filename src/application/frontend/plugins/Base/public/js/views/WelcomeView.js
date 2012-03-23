var WelcomeView = Backbone.View.extend({
    template: 'BaseWelcomeTemplate',
    
    animate: function () {
    	var _this = this;
    
    	requestAnimationFrame( function () {
    		_this.animate();
    	} );
    	
        this.renderGL();
    },
    
    renderGL: function () {
    	this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;

        this.renderer.render( this.scene, this.camera );
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

		var camera, scene, renderer,
    		geometry, material, mesh;

    	
    	this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, 940 / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1000;
        this.scene.add( this.camera );

        geometry = new THREE.CubeGeometry( 200, 200, 200 );
        material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );

        this.mesh = new THREE.Mesh( geometry, material );
        this.scene.add( this.mesh );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( 940, window.innerHeight );
        
        $(this.el).html(this.renderer.domElement);
    	
    	this.animate.apply(this, []);
		
		
		
		return this;

        var cloudCollection = new EventCollection();
        cloudCollection.url = 'EventCollection:cloud';

        cloudCollection.fetch({success: function (col, elements) {
            elements.forEach(function (tag) {
                $('#tags > ul', this.el).append('<li><a href="" onclick="Backbone.history.navigate(\'!/Channels\')">' + tag + '</a></li>');
            });

            $('#epgCloud', this.el).tagcanvas({
                textColour: '#ff0000',
                outlineColour: '#ff00ff',
                reverse: true,
                depth: 0.8,
                maxSpeed: 0.05,
                initial: [0.3,-0.3]
            },$('#tags', this.el));
        }});

        return this;
    }
});