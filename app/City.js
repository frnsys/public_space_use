import $ from 'jquery';
import _ from 'underscore';
import * as THREE from 'three';
import Park from './Park';
import Building from './Building';
import chroma from 'chroma-js';

const colors = {
  dayTop: '#0735ef',
  dayBottom: '#268ca8',
  nightTop: '#1a1a1a',
  nightBottom: '#610303'
};

const side = 3;
const margin = 0.8;
const pPark = 0.1;
const vacantProb = 0.6;
const timeAtHome = [10,20]
const ticksPerHour = 4;

// set to above 0 to slow things down
const frameSpacing = 0;


class City {
  constructor(rows, cols, config, scene) {
    this.rows = rows;
    this.cols = cols;
    this.side = side;
    this.scene = scene;
    this._scene = scene.scene; // meh

    this.fullSide = this.side + 2*margin;
    this.gridWidth = this.fullSide * cols;
    this.gridDepth = this.fullSide * rows;

    // extra offset to compensate for building height
    var xOffset = 3,
        zOffset = 3;

    // for centering the city
    this.offset = {
      x: -this.gridWidth/2 + xOffset,
      z: -this.gridDepth/2 + zOffset
    }

    // initialize the grid
    this.grid = [];
    for (var i=0; i < rows; i++) {
      var row = [];
      for (var j=0; j < cols; j++) {
        row.push(null);
      }
      this.grid.push(row);
    }

    this.spawn();

    this.frameCountdown = frameSpacing;
    this.time = 0;
  }

  get hour() {
    return this.time % 24;
  }

  // for conveniently placing things with the offset
  place(obj, x, y, z) {
    obj.position.set(x + this.offset.x, y, z + this.offset.z);
    this._scene.add(obj);
  }

  remove(obj) {
    this._scene.remove(obj);
  }

  update() {
    this.population.forEach(p => {
      if (p.atPark) {
        p.timeAtPark++;
        if (p.leavePark(this.hour)) {
          p.plot.removeOccupant(p);
          p.plot = null;
          p.timeAtPark = 0;
          p.timeAtHome = _.random(timeAtHome[0], timeAtHome[1]);
          p.atPark = false;
          p.apartment.addOccupant(p);
        }
      } else if (p.timeAtHome <= 0 && p.visitPark(this.hour)) {
        var plot = p.park.randomUnoccupiedPlot();
        if (plot) {
          p.plot = plot;
          p.atPark = true;
          p.plot.addOccupant(p);
          p.apartment.removeOccupant(p);
        }
      } else {
        p.timeAtHome--;
      }
    });
  }

  // spawn the city
  spawn() {
    this.parks = [];
    this.residents = [];
    this.buildings = [];

    this.spawnPlaces();
    this.spawnGround();
    // this.origin();

    this.population = _.chain(this.buildings).map(b => {
      return b.populate(vacantProb);
    }).flatten().value();

    this.population.forEach(p => {
      p.park = this.closestPark(p);
    });
  }

  spawnBuilding(row, col) {
    var x = row * this.fullSide + (Math.random()-0.5) * margin/2,
        z = col * this.fullSide + (Math.random()-0.5) * margin/2,
        flipped = row % 2 == 0,
        building = new Building(x, z, flipped, this);
    return building;
  }

  spawnPark(row, col) {
    var x = row * this.fullSide,
        z = col * this.fullSide,
        park = new Park(x, z, this);
    return park;
  }

  spawnPlaces() {
    var self = this;
    for (var i=0; i < this.rows; i++) {
      var row = [];
      for (var j=0; j < this.cols; j++) {
        if (Math.random() <= pPark) {
          this.parks.push(this.spawnPark(i, j));
        } else {
          this.buildings.push(this.spawnBuilding(i, j));
        }
      }
    }
  }

  spawnGround() {
    var planeWidth = this.gridWidth * 1.1,
        planeDepth = this.gridDepth * 1.1,
        planeGeometry = new THREE.PlaneGeometry(planeWidth, planeDepth),
      planeMaterial = new THREE.MeshLambertMaterial({
        opacity: 0.6,
        transparent: true,
        color: 0xAAAAAA,
        side: THREE.DoubleSide
      }),
        plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.rotation.x = Math.PI / 2;
    this.place(plane, this.gridWidth/2 - margin*2, 0, this.gridDepth/2 - margin*2);
  }

  // to easily visually identify where the origin is (for debugging)
  origin() {
    var geometry = new THREE.BoxGeometry(0.2,50,0.2),
        material = new THREE.MeshLambertMaterial({
          color: 0x000000
        }),
        cube = new THREE.Mesh(geometry, material);
    cube.position.set(0,0,0);
    this._scene.add(cube);
  }

  run() {
    requestAnimationFrame(this.run.bind(this));
    this.scene.render();
    if (this.frameCountdown > 0) {
      this.frameCountdown--;
    } else {
      this.update();
      this.time += 1/ticksPerHour;
      this.frameCountdown = frameSpacing;

      var colorScale = 1 - Math.abs((this.hour-12)/12),
          fromColor = chroma.mix(colors.nightTop, colors.dayTop, colorScale, 'lab'),
          toColor = chroma.mix(colors.nightBottom, colors.dayBottom, colorScale, 'lab');
      $('html').css('background', `linear-gradient(to bottom, ${fromColor} 0%, ${toColor} 100%)`);
    }
  }

  closestPark(person) {
    var bldg = person.apartment.building,
        parks = _.sortBy(this.parks, p => {
          return Math.sqrt(
            Math.pow(bldg.x - p.x, 2) +
            Math.pow(bldg.z - p.z, 2));
        });
    return parks[0];
  }
}

export default City;
