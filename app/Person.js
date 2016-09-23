const maxTimeAtPark = 60;
const baseParkVisitProb = 0.0005;
const baseParkLeaveProb = 0.02;
const homeHours = [0,6];
const parkLeaveProbHomeHours = 0.2;
const parkVisitProbHomeHours = 0.1;

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
    this.timeAtHome = 0;
    this.atPark = false;
  }

  leavePark(hour) {
    var homeHour = hour > homeHours[0] && hour < homeHours[1];
    return this.atPark &&
      Math.random() <= Math.max(0, 1 - this.park.quality) + this.timeAtPark/maxTimeAtPark + baseParkLeaveProb + (homeHour ? parkLeaveProbHomeHours : 0);
  }

  visitPark(hour) {
    var homeHour = hour > homeHours[0] && hour < homeHours[1];
    return !this.atPark &&
      Math.random() <= (this.park.quality + baseParkVisitProb) * (homeHour ? parkVisitProbHomeHours : 1);
  }
}

export default Person;
