import _ from 'underscore';
import * as THREE from 'three';
import Person from './Person';

const floors = 6;
const side = 1;
const height = 0.6;
const maxOccupants = 3;

class Building {
  constructor(x, z, city) {
    this.x = x;
    this.z = z;
    this.city = city;
    this.nFloors = 0;
    this.apartments = [];

    _.times(floors, this.addFloor.bind(this));
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

  addFloor() {
    var positions = [
      [0, 0],
      [0, side],
      [side, 0],
      [side, side]
    ];

    positions.forEach(pos => {
      var x = pos[0],
          z = pos[1],
          apartment = new Apartment(this);

      this.apartments.push(apartment);
      this.city.place(
        apartment.mesh,
        this.x + x,
        this.height + apartment.mesh.geometry.parameters.height/2,
        this.z + z);
    });

    this.nFloors += 1;
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
