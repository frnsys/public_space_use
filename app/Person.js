const maxTimeAtPark = 10;
const baseParkVisitProb = 0.01;

function s4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function guid() {
  return (s4() + s4() + "-" + s4() + "-4" + s4().substr(0,3) + "-" + s4() + "-" + s4() + s4() + s4()).toLowerCase();
}

class Person {
  constructor(apartment) {
    this.id = guid();
    this.apartment = apartment;
    this.timeAtPark = 0;
    this.atPark = false;
  }

  leavePark() {
    return this.atPark &&
      (Math.random() <= 1 - this.park.quality ||
      Math.random() <= this.timeAtPark/maxTimeAtPark);
  }

  visitPark() {
    return !this.atPark &&
      Math.random() <= this.park.quality + baseParkVisitProb;
  }
}

export default Person;
