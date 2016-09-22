import _ from 'underscore';
import * as THREE from 'three';

const side = 1;
const height = 0.01;
const maxOccupants = 20;

class Park {
  constructor(x, z, city) {
    this.x = x;
    this.z = z;
    this.city = city;
    this.plots = [];
    this.generatePlots();
  }

  generatePlots() {
    var positions = [
      [0, 0],
      [0, side],
      [side, 0],
      [side, side]
    ];

    positions.forEach(pos => {
      var x = pos[0],
          z = pos[1],
          plot = new Plot();

      this.plots.push(plot);
      this.city.place(
        plot.mesh,
        this.x + x,
        plot.mesh.geometry.parameters.height/2,
        this.z + z);
    });
  }

  get quality() {
    var occupancy = _.reduce(this.plots, (m,p) => m + p.occupants.length, 0)/(this.plots.length * maxOccupants);
    return Math.pow(occupancy, 2);
  }

  randomUnoccupiedPlot() {
    return _.sample(_.filter(this.plots, p => p.occupancy < 1));
  }
}

class Plot {
  constructor() {
    var geometry = new THREE.BoxGeometry(side, height, side),
        material = new THREE.MeshLambertMaterial();
    this.occupants = [];
    this.mesh = new THREE.Mesh(geometry, material);
    this.update();
  }

  get occupancy() {
    return this.occupants.length/maxOccupants;
  }

  update() {
    var hex = this.occupancy * 0xFF,
        color = 0x32 | (hex << 8) | 0x32;
    this.mesh.material.color.setHex(color);
  }

  addOccupant(p) {
    if (this.occupants.length < maxOccupants) {
      this.occupants.push(p);
      this.update();
      return true;
    }
    return false;
  }

  removeOccupant(p) {
    this.occupants = _.without(this.occupants, p);
    this.update();
  }
}

export default Park;
