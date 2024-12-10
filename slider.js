class DepthMapEffect {
    constructor(container) {
        this.container = document.querySelector(container);
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl');

        // Liste des décors, personnages et graffitis
        this.imageSets = [
            { original: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756da336f08670cc24b5744_bg1.webp', depth: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94a151d20d360320bd6_bg-map1.webp', character: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94a89e94d5f060ba272_character1.webp', graffiti: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94beb0ce3c356aebe83_graffiti1.webp' },
            { original: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756da343538ad9615a3e8e3_bg2.webp', depth: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94abaf5625c6ed9d59d_bg-map2.webp', character: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94b17bbe69f351bf5cb_character2.webp', graffiti: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94b7b7928efc8a1ab02_graffiti2.webp' },
            { original: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756da34bb5f1230758e3287_bg3.webp', depth: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94bff08eb308aa3d303_bg-map3.webp', character: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94bc0f6499a0bea1ca2_character3.webp', graffiti: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94b151d20d360320cd9_graffiti3.webp' },
            { original: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756da33f92ab0e6f329759d_bg4.webp', depth: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94a151d20d360320b9f_bg-map4.webp', character: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94b5ed4549ca8f90ccd_character4.webp', graffiti: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94a94faca94fd02dc76_graffiti4.webp' },
            { original: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756da3325a2363cf420673d_bg5.webp', depth: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94a4916501c1247685c_bg-map5.webp', character: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94b0eda885a6e929f4f_character5.webp', graffiti: 'https://cdn.prod.website-files.com/6740471331c3ef2ba0ada212/6756d94b6b0bed1222337af2_graffiti5.webp' },
        ];

        this.currentIndex = 0;
        this.textures = [];
        this.mouse = { x: 0, y: 0 };
        this.mouseTarget = { x: 0, y: 0 };

        this.characterLayer = document.querySelector('.character-layer');
        this.characterImg = document.querySelector('.character-img');
        this.graffitiLayer = document.querySelector('.graffiti-layer');
        this.graffitiImg = document.querySelector('.graffiti-img');

        this.params = {
            depthMultiplier: 0.04,
            smoothing: 0.05,
            enableMouse: true,
        };

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());

        this.loadImages(this.imageSets[this.currentIndex], (images) => {
            this.setupWebGL(images);
            this.setCharacter(this.currentIndex);
            this.setGraffiti(this.currentIndex);
            this.addMouseMovement();
            this.render();
        });

        this.setupButtons();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    setCharacter(index) {
        const character = this.imageSets[index].character;

        gsap.to(this.characterImg, {
            duration: 0.5,
            filter: "blur(20px)",
            opacity: 0,
            onComplete: () => {
                this.characterImg.src = character;
                gsap.to(this.characterImg, {
                    duration: 1.5,
                    filter: "blur(0px)",
                    opacity: 1
                });
            }
        });
    }

    setGraffiti(index) {
        const graffiti = this.imageSets[index].graffiti;

        gsap.to(this.graffitiImg, {
            duration: 0.5,
            filter: "blur(20px)",
            opacity: 0,
            onComplete: () => {
                this.graffitiImg.src = graffiti;
                gsap.to(this.graffitiImg, {
                    duration: 1.5,
                    filter: "blur(0px)",
                    opacity: 1
                });
            }
        });
    }

    setupButtons() {
        const buttons = document.querySelectorAll('.slider-controls button');
        const sliderActive = document.querySelector('.slider-active');

        const updateSliderActivePosition = (button) => {
            const buttonLeft = button.offsetLeft;
            const buttonTop = button.offsetTop;

            gsap.to(sliderActive, {
                duration: 0.5,
                x: buttonLeft,
                y: buttonTop,
                ease: "power2.out"
            });
        };

        updateSliderActivePosition(buttons[0]);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'), 10);

                if (index !== this.currentIndex) {
                    this.currentIndex = index;

                    this.loadImages(this.imageSets[this.currentIndex], (images) => {
                        this.setupWebGL(images);
                        this.setCharacter(index);
                        this.setGraffiti(index);
                    });
                }

                updateSliderActivePosition(button);
            });
        });
    }

    loadImages(imageSet, callback) {
        let images = [];
        let urls = [imageSet.original, imageSet.depth];
        let loaded = 0;

        urls.forEach((url, index) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Ajout de crossOrigin
            img.src = url;
            img.onload = () => {
                images[index] = img;
                loaded++;
                if (loaded === urls.length) {
                    callback(images);
                }
            };
            img.onerror = () => {
                console.error(`Erreur de chargement de l'image : ${url}`);
            };
        });
    }

    setupWebGL(images) {
        const gl = this.gl;

        if (!this.program) {
            this.program = gl.createProgram();
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
                attribute vec2 a_position;
                varying vec2 v_uv;
                void main() {
                    v_uv = (a_position + 1.0) / 2.0;
                    gl_Position = vec4(a_position, 0, 1);
                }
            `);
            const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
                precision mediump float;
                uniform sampler2D u_imageOriginal;
                uniform sampler2D u_imageDepth;
                uniform vec2 u_mouse;
                uniform float u_depthMultiplier;
                varying vec2 v_uv;

                void main() {
                    vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
                    vec4 depth = texture2D(u_imageDepth, uv);
                    vec2 offset = (depth.r - 0.5) * u_mouse * u_depthMultiplier;
                    vec4 color = texture2D(u_imageOriginal, uv + offset);
                    gl_FragColor = color;
                }
            `);

            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);
            gl.useProgram(this.program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, -1, 1, 1, 1
            ]), gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(this.program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            this.uMouse = gl.getUniformLocation(this.program, "u_mouse");
            this.uDepthMultiplier = gl.getUniformLocation(this.program, "u_depthMultiplier");
        }

        this.textures = images.map((image) => {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            return texture;
        });

        this.bindTextures();
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    bindTextures() {
        const gl = this.gl;
        const uImageOriginal = gl.getUniformLocation(this.program, "u_imageOriginal");
        const uImageDepth = gl.getUniformLocation(this.program, "u_imageDepth");

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.uniform1i(uImageOriginal, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
        gl.uniform1i(uImageDepth, 1);
    }

    addMouseMovement() {
        window.addEventListener("mousemove", (e) => {
            if (this.params.enableMouse) {
                this.mouseTarget.x = ((e.clientX / window.innerWidth) * 2 - 1);
                this.mouseTarget.y = ((e.clientY / window.innerHeight) * 2 - 1);
            }
        });
    }

    render() {
        const gl = this.gl;

        this.mouse.x += (this.mouseTarget.x - this.mouse.x) * this.params.smoothing;
        this.mouse.y += (this.mouseTarget.y - this.mouse.y) * this.params.smoothing;

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform2f(this.uMouse, this.mouse.x, this.mouse.y);
        gl.uniform1f(this.uDepthMultiplier, this.params.depthMultiplier);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(this.render.bind(this));
    }
}

new DepthMapEffect('#depthMapContainer');
