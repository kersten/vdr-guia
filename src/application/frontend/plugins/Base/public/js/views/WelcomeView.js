var WelcomeView = Backbone.View.extend({
    template: 'BaseWelcomeTemplate',
    
    animate: function () {
        var _this = this;

        requestAnimationFrame(function () {
            _this.animate();
        });

        this.renderGL();
    },

    renderGL: function () {
        //this.mesh.rotation.x += 0.01;
        //this.mesh.rotation.y += 0.02;

        for (var x in this.meshes) {
            this.meshes[x].rotation.x += 0.001 + (0.1-0.001)*Math.random();
            //this.meshes[x].rotation.y += 0.001 + (0.1-0.001)*Math.random();
        }

        this.renderer.render( this.scene, this.camera );
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        var camera, scene, renderer,
            geometry, material, mesh;


        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera($(document).width() / - 2, $(document).width() / 2, $(document).height() / 2, $(document).height() / - 2, - 2000, 1000);
        this.camera.position.x = 200;
        this.camera.position.y = 200;
        this.camera.position.z = 200;
        this.scene.add(this.camera);

        geometry = new THREE.CubeGeometry($(document).width() / 10, $(document).width() / 10, 1, 100, 100, 1);
        material = new THREE.MeshBasicMaterial({color: 0x2C2C2C, wireframe: false});

        //var planeMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: THREE.ImageUtils.loadTexture("/icons/amazon.png"), shading: THREE.SmoothShading});
            //planeMaterialWire = new THREE.MeshLambertMaterial({color: 0xFFFFFF, wireframe:true});

        var startTop = ($(document).height() / 2) + ($(document).width() / 10);

        this.meshes = [];

        for (var x = 0; x < $(document).height() / ($(document).width() / 10); x++) {
            var startLeft = -($(document).width() / 2) + ($(document).width() / 10) + $(document).width() / 10;

            for (var i = 0; i < $(document).width() / ($(document).width() / 10); i++) {
                this.meshes[x + ':' + i] = new THREE.Mesh(geometry, material);

                this.meshes[x + ':' + i].position.x = startLeft;
                this.meshes[x + ':' + i].position.y = startTop;

                this.scene.add(this.meshes[x + ':' + i]);

                startLeft += $(document).width() / 10;
            }

            startTop -= $(document).width() / 10;
        }

        /*this.mesh = new THREE.Mesh(geometry, planeMaterial);

        this.mesh.position.x = -245;
        this.mesh.position.y = 475;

        this.scene.add(this.mesh);

        this.mesh = new THREE.Mesh(geometry, planeMaterial);

        this.mesh.position.x = -195;
        this.mesh.position.y = 475;

        this.scene.add(this.mesh); */

        // point
        pointLight = new THREE.PointLight( 0xFFFFFF );
        pointLight.position.x = 10;
        pointLight.position.y = 10;
        pointLight.position.z = 1500;
        this.scene.add( pointLight );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize($(document).width(), $(document).height());

        $(this.renderer.domElement).css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999,
            width: $(document).width(),
            height: $(document).height()
        });

        //$('body').append(this.renderer.domElement);

        //this.animate.apply(this, []);



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