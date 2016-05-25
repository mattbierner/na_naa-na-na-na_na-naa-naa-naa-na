"use strict";
import THREE from 'three';
import OrbitControls from './OrbitControls';
import Shader from './shader';
const ResizeSensor = require('imports?this=>window!css-element-queries/src/ResizeSensor');

const MID = 128;
const MAX = 255;
const DEAD_ZONE = 10;
const SCALE = 1 / 20;

const shaderMaterial = new THREE.ShaderMaterial(Shader);

/**
 * 3D view
 */
export default class Viewer {
    constructor(canvas, container) {
        this.isMouseDown = false;
        this.container = container;

        this.mouse = null;

        this._raycaster = new THREE.Raycaster();
        this._clock = new THREE.Clock();

        this._scene = new THREE.Scene();

        this.initRenderer(canvas);
        this.initCamera();
        this.initControls(container);

        new ResizeSensor(container, this.onWindowResize.bind(this));
        this.onWindowResize();

        this.animate = () => this.animateImpl();
        this.animateImpl();
    }

    /**
     * Setup the initial renderer.
     */
    initRenderer(canvas) {
        this._renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        this._renderer.setClearColor(0xffffff, 0);
        this._renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    }

    /**
     * Setup the initial camera.
     */
    initCamera() {
        const [viewWidth, viewHeight] = this._getViewportSize();
        const aspect = viewWidth / viewHeight;
        this._camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 800);
        this._camera.position.z = 40;
    }

    /**
     * Setup the controls.
     */
    initControls(container) {
        this._controls = new OrbitControls(this._camera, container);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.25;
        this._controls.enableZoom = true;
    }

    /**
     * Get the size of the viewport.
     */
    _getViewportSize() {
        const rect = this.container.getBoundingClientRect();
        return [rect.width, rect.height];
    }

    /**
     * Handle window resize events.
     */
    onWindowResize() {
        const [width, height] = this._getViewportSize();

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(width, height);
    }


    draw(color, data) {
        if (false) {
            const posL = { x: 0, y: 0, z: 0 };

            var material = new THREE.LineBasicMaterial({
                color: color
            });
            
            geometry.vertices.push(new THREE.Vector3(posL.x, posL.y, posL.z));
            for (const {x, y} of data) {
                if (x === 0 && y === 0)
                    continue;

                posL.x += x * SCALE;
                posL.y += y * SCALE;
                geometry.vertices.push(new THREE.Vector3(posL.x, posL.y, posL.z));
            }
        }
        
        const buffergeometry = new THREE.BufferGeometry();

        const position = new THREE.Float32Attribute(data.length * 3, 3);
        buffergeometry.addAttribute('position', position)
        
        const progress = new THREE.Float32Attribute(data.length, 1);
        buffergeometry.addAttribute('progress', progress);
        
        const r = 20;
        
        var quaternion = new THREE.Quaternion(0, 0, 0, 1);
        
        let i = 0;
        for (const {x, y} of data) {
            const horizontal = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 1), x * SCALE);
            const vertical = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 1), y * SCALE);
            quaternion.multiply(horizontal).multiply(vertical);
            var vector = new THREE.Vector3(r, 0, 0);
            vector.applyQuaternion(quaternion);
            quaternion.normalize()
            vector.toArray(position.array, i * 3);
            progress.array[i] = i / data.length;
            console.log(i / data.length);
            ++i;
        }
        var line = new THREE.Line(buffergeometry, shaderMaterial);
        this._scene.add(line);
    }

    /**
     * Main update function.
     */
    update(delta) {
        this._controls.update();
    }

    animateImpl() {
        const delta = this._clock.getDelta();

        this.update(delta);
        if (this._particleGroup)
            this._particleGroup.tick(delta);
        this.render(delta);
        requestAnimationFrame(this.animate);
    }

    render(delta) {
        this._renderer.render(this._scene, this._camera);
    }
}