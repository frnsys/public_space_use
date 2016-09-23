import _ from 'underscore';
import * as THREE from 'three';
import Person from './Person';

const floors = 8;
const side = 1;
const height = 0.6;
const maxOccupants = 8;

class Building {
  constructor(x, z, flipped, city) {
    this.x = x;
    this.z = z;
    this.city = city;
    this.nFloors = 0;
    this.apartments = [];
    this.flipped = flipped;

    // create empty parent to manage rotations
    var geometry = new THREE.BoxGeometry(0,0,0),
        material = new THREE.MeshLambertMaterial();
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.isVisible = false;
    this.addFloors(floors);
  }

  populate(vacantProb) {
    var residents = [];
    this.apartments.forEach(a => {
      if (Math.random() > vacantProb) {
        _.times(_.random(1, maxOccupants), () => {
          var person = new Person(a);
          a.addOccupant(person);
          residents.push(person);
        });
      }
    });
    return residents;
  }

  addFloor(positions) {
    positions.forEach(pos => {
      var x = pos[0],
          z = pos[1],
          apartment = new Apartment(this);

      this.apartments.push(apartment);
      apartment.mesh.position.set(
        x,
        this.height + apartment.mesh.geometry.parameters.height/2,
        z);
      this.mesh.add(apartment.mesh);
    });
  }

  addFloors(nFloors) {
    // 3x2
    var positions = [
      [0, 0],
      [0, side],
      [side, 0],
      [side, side],
      [side*2, 0],
      [side*2, side],
    ];

    if (this.flipped) {
      positions = positions.reverse();
    }

    _.times(nFloors, (i) => {
      var fromTop = nFloors - i;
      this.addFloor(positions.slice(0, fromTop*2));
      this.nFloors += 1;
    });

    this.city.place(this.mesh, this.x, 0, this.z);
    this.mesh.rotation.y = Math.random() * 2 * Math.PI;
  }

  // total height of the building
  get height() {
    return this.nFloors * height;
  }
}

class Apartment {
  constructor(building) {
    var geometry = new THREE.BoxGeometry(side, height, side),
        material = new THREE.MeshLambertMaterial();
    this.occupants = [];
    this.building = building;
    this.mesh = new THREE.Mesh(geometry, material);
    this.update();
  }

  get occupancy() {
    return this.occupants.length/maxOccupants;
  }

  update() {
    var hex = this.occupancy * 0xFF,
        // color = (hex << 16) | (hex << 8) | 0x32;
        color = (hex << 16) | 0x32 | 0x32;
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

export default Building;
