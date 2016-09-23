import _ from 'underscore';
import * as THREE from 'three';
import Park from './Park';
import Building from './Building';

const side = 3;
const margin = 0.5;
const pPark = 0.1;
const vacantProb = 0.6;
const maxBuildingOccupants = 3;

// set to above 0 to slow things down
const frameSpacing = 1;


class City {
  constructor(rows, cols, config, scene) {
    this.rows = rows;
    this.cols = cols;
    this.side = side;
    this.margin = margin;
    this.scene = scene;
    this._scene = scene.scene; // meh

    this.fullSide = this.side + 2*this.margin;
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
        if (p.leavePark()) {
          p.plot.removeOccupant(p);
          p.plot = null;
          p.timeAtPark = 0;
          p.atPark = false;
          p.apartment.addOccupant(p);
        }
      } else if (p.visitPark()) {
        var plot = p.park.randomUnoccupiedPlot();
        if (plot) {
          p.plot = plot;
          p.atPark = true;
          p.plot.addOccupant(p);
          p.apartment.removeOccupant(p);
        }
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
    var x = row * this.fullSide,
        z = col * this.fullSide,
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
    var planeGeometry = new THREE.PlaneGeometry(this.gridWidth, this.gridDepth),
        planeMaterial = new THREE.MeshLambertMaterial( {color: 0xAAAAAA, side: THREE.DoubleSide} ),
        plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.rotation.x = Math.PI / 2;
    this.place(plane, this.gridWidth/2 - this.margin*2, 0, this.gridDepth/2 - this.margin*2);
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
      this.frameCountdown = frameSpacing;
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
