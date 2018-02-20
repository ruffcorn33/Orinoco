// REQUIRED MODULES
const inquirer = require('inquirer');
require("dotenv").config();
const mysql = require('mysql');
const colors = require('colors');
const cliBoxes = require('cli-boxes');
var mysql_pwd = process.env.MYSQL_PASSWORD;

// GLOBALS
var query_str = '';

// create a connection database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: mysql_pwd,
  database: "orinoco_DB"
});
// and connect
connection.connect(function(err) {
  if (err) throw err;
  // open welcome screen
  selectDept();
});

selectDept = function(){
  connection.query("SELECT DISTINCT department_name FROM departments", function(err,res){
    // display Orinoco 'logo'
    displayLogo();
    // get user input
    // begin with choosing a department to narrow items displayed
    inquirer
    .prompt([
      {
        name:'dept',
        type: 'list',
        choices: function(){          
          var deptArr = [];
          var dept;
          deptArr.push('ALL')
          for (i=0; i<res.length; i++){
            deptArr.push(res[i].department_name);
          }
          deptArr.push('QUIT');
          return deptArr;
        },
        message: 'What Department?\n'.red
      }
    ])
    .then(function(selection){
      if(selection.dept === 'QUIT'){process.exit()};
      selectItems(selection.dept);  
    });
  });
}

function selectItems(dept){
  console.log(dept);
  if(dept === 'ALL'){
    connection.query("SELECT * FROM products", function(err,res){
      if (err) throw err;
      displayItems(res);
    });
  } 
  else{
    connection.query("SELECT * FROM products WHERE department_name = ?", dept, function(err,res){
      if (err) throw err;
      displayItems(res);
    });
  }  
}

function displayItems(res){
  console.log(res);
  displayLogo();
  inquirer
  .prompt([
    {
      name:'item',
      type: 'list',
      choices: function(){
        var itemArr = ['<--BACK TO DEPARTMENTS'];
        var item;
        for (i=0; i<res.length; i++){
          item = res[i].item_id + " " + res[i].product_name + " $" + res[i].price;
          itemArr.push(item);
        }
        itemArr.push('QUIT'.red);
        return itemArr;
      },
      message: 'Select an item to add it to your cart\n'.red
    }
  ])
  .then(function(selection){
    if(selection.item === '<--BACK TO DEPARTMENTS'){
      clearScreen();
      selectDept();
    }
    else if(selection.item === 'QUIT') {process.exit()}
  });
}


displayLogo = function(){
  const topleft = cliBoxes.double.topLeft;
  const topright = cliBoxes.double.topRight;
  const bottomleft = cliBoxes.double.bottomLeft;
  const bottomright = cliBoxes.double.bottomRight;
  const side = cliBoxes.double.vertical;
  var hz = "";
  var pd = "";
  for (i=1; i<42; i++){
    hz = hz+cliBoxes.double.horizontal;
    pd = pd + " ";
  }
  const horizontal = hz;
  const BorderTop = topleft+horizontal+topright;
  const BorderBottom = bottomleft+horizontal+bottomright;
  const BorderSides = side+pd+side;
  const company = 'ORINOCO.COM';
  const slogan  = '   (A slightly smaller online store)   '; 
  const companyLine = side.green+'               '+company.bold.yellow+'               '+side.green;
  const sloganLine = side.green+" "+slogan.yellow+" "+side.green;
  const managerLine = side.green + "             MANAGER SCREEN              ".cyan + side.green;
  clearScreen();
  console.log(BorderTop.green);
  console.log(BorderSides.green);
  console.log(companyLine.bold);
  console.log(sloganLine);
  console.log(BorderSides.green);
  console.log(managerLine);
  console.log(BorderSides.green);
  console.log(BorderBottom.green);
}

function clearScreen(){
  // clear output from this application/prevent scrolling
  process.stdout.write('\033c'); 
}