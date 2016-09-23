import './css/main.sass';
import $ from 'jquery';
import dat from 'dat-gui';
import Scene from './app/Scene';
import City from './app/City';

const rows = 12;
const cols = 12;

// TODO?
var config = {};
// var gui = new dat.GUI();

$('.start').on('click', function() {
  $(this).hide();
  var scene = new Scene();
  var city = new City(rows, cols, config, scene);
  console.log(`Population: ${city.population.length}`);
  city.run();
});
