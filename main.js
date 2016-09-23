import './css/main.sass';
import dat from 'dat-gui';
import Scene from './app/Scene';
import City from './app/City';

const rows = 12;
const cols = 12;

// TODO?
var config = {};
// var gui = new dat.GUI();

var scene = new Scene();
var city = new City(rows, cols, config, scene);

console.log(`Population: ${city.population.length}`);

city.run();