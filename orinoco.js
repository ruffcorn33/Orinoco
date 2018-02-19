// REQUIRED MODULES
const inquirer = require('inquirer');
require("dotenv").config();
const mysql = require('mysql');
const colors = require('colors');
const cliBoxes = require('cli-boxes');
var mysql_pwd = process.env.MYSQL_PASSWORD;

// GLOBALS
var cartArr = [];  // an array to hold order objects
var itemCount = 0;

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
  // console.log("connected as id " + connection.threadId + "\n");
  // open welcome screen
  selectDept();
});

selectDept = function(){
  // console.log('The Orinoco Customer functionality is under construction');
  // could get departments from the departments table but I wanted to practice a SELECT DISTINCT
  connection.query("SELECT DISTINCT department_name FROM products", function(err,res){
    // console.log(res);
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
          for (i=0; i<res.length; i++){
            deptArr.push(res[i].department_name);
          }
          deptArr.push('QUIT')
          return deptArr;
        },
        message: 'What department do you want to search in?\n'.red
      }
    ])
    .then(function(selection){
      if(selection.dept === 'QUIT'){process.exit()};
      selectItem(selection.dept);  
    });
  });
}

function selectItem(dept){
  console.log(dept);
  connection.query("SELECT * FROM products WHERE department_name = ?", dept, function(err,res){
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
      else {
        clearScreen();
        // console.log('Selection is: '+selection.item);
        // get item id
        var getItemID = selection.item.split(" ")
        // console.log(getItemID);
        var itemID = getItemID[0];
        // console.log('Item ID: '+itemID);
        // add to shopping cart here
        addToCart(itemID, selection.item);
      };
    });
  });
}

addToCart = function(input_id, item){
  // console.log('in addToCart ID is: '+input);
  clearScreen();
  displayLogo();
  console.log(item);
  // get quantity
  inquirer
  .prompt([
    {
      name: 'qty',
      type: 'input',
      message: 'How many?',
      validate: function(value) {
        var pass = value.match(
          /^\d\d?$/
        );
        if (pass) {
          return true;
        }   
        return 'Please enter a number between 1-99'.red;
      }
    }
  ])
  .then(function(answer){
    // find item in products table
    connection.query("SELECT * FROM products WHERE item_id = ?", input_id, function(err,res){
      if (err) throw err;
      // check availability
      if (res[0].stock_quantity < answer.qty){
        var qtyMsg = 'The available quantity is '+ res[0].stock_quantity + '. Revise quantity?';
        inquirer
        .prompt([
          {
            name: 'reviseQty',
            type: 'list',
            message: qtyMsg.red,
            choices: [
              'change to available quantity',
              'new quantity',
              'return to item selection'
            ]
          }
        ])
        .then(function(revision){
          if(revision.reviseQty === 'change to available quantity'){
            console.log('Quantity changed to available quantity');
            itemCount += res[0].stock_quantity;
          }
          else if(revision.reviseQty === 'new quantity'){
            inquirer
            .prompt([
              {
                name: 'newQty',
                type: 'input',
                message: 'Enter new quantity?',
                validate: function(value) {
                  var pass = value.match(
                    /^\d\d?$/
                  );
                  if(pass) {
                    if(value <= res[0].stock_quantity ){
                      if(value != 0){
                        return true;
                      }
                    }
                  }   
                  return 'Please enter a number between 1-'.red + res[0].stock_quantity;
                }
              }
            ])
            .then(function(revised){
              console.log('revised qty is '+revised.newQty);
              itemCount += revised.newQty;
            });
          }
          else{
            // return to selection of items in chosen department
            selectItem(res[0].department_name);
          }
        });
      }
      else {
        // use entered quantity
        console.log('quantity is '+answer.qty);
        itemCount += answer.qty;
      }
    // cartArr.push(selection.qty + " * " + selection.item.product_name + "  $"+selection.item.price);
    });
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
  const company = 'ORINOCO';
  const slogan  = '    A slightly smaller online store    '; 
  const companyLine = side.green+'                 '+company.bold.yellow+'                 '+side.green;
  const sloganLine = side.green+" "+slogan.yellow+" "+side.green;
  var cartLine='';
  var cartMsg = itemCount + " items in your cart"
  if (itemCount > 9){
    cartLine = side.green + '          ' + cartMsg.red + '          ' + side.green;
  }
  else{
    cartLine = side.green + '           ' + cartMsg.red + '          ' + side.green;
  };
  clearScreen();
  console.log(BorderTop.green);
  console.log(BorderSides.green);
  console.log(companyLine.bold);
  // console.log(BorderSides.green);
  console.log(sloganLine);
  console.log(BorderSides.green);
  if(cartArr.length>0){
    console.log(cartLine.green);
  }
  else{
    console.log(BorderSides.green);
  }
  console.log(BorderBottom.green);
}

function clearScreen(){
  // clear output from this application/prevent scrolling
  process.stdout.write('\033c'); 
}