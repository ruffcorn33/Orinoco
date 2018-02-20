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
var tempQty = 0;

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
  selectDept(itemCount);
});

selectDept = function(count){
  // console.log('The Orinoco Customer functionality is under construction');
  // could get departments from the departments table but I wanted to practice a SELECT DISTINCT
  connection.query("SELECT DISTINCT department_name FROM products", function(err,res){
    // console.log(res);
    // display Orinoco 'logo'
    displayLogo(count);
    if (count === -1){count=0};
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
      selectItem(selection.dept, count);  
    });
  });
}

function selectItem(dept, count){
  console.log(dept);
  connection.query("SELECT * FROM products WHERE department_name = ?", dept, function(err,res){
    console.log(res);
    displayLogo(count);
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
        selectDept(count);
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
        addToCart(itemID, selection.item, count);
      };
    });
  });
}


addToCart = function(input_id, item, count){
  // console.log('in addToCart ID is: '+input);
  clearScreen();
  displayLogo(count);
  // console.log(input_id);
  console.log(item);
  // GET QTY
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
    tempQty = parseInt(answer.qty);
    // find item in products table
    connection.query("SELECT * FROM products WHERE item_id = ?", input_id, function(err,res){
      if (err) throw err;
      // console.log(res);
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
              'BACK'
            ]
          }
        ])
        .then(function(revision){
          // revise order qty = stock on hand qty
          if(revision.reviseQty === 'change to available quantity'){
            // console.log('Quantity changed to available quantity');
            tempQty = res[0].stock_quantity;
            itemCount += tempQty;
          }
          else if(revision.reviseQty === 'new quantity'){
            inquirer
            .prompt([
              {
                name: 'newQty',
                type: 'input',
                message: 'Enter new quantity',
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
              // console.log('revised qty is '+revised.newQty);
              tempQty = revised.newQty;
              itemCount += tempQty;
            });
          }  // END OF REVISE ORDER QTY = NEW QTY
          else{
            // BACK
            // return to selection of items in chosen department
            selectItem(res[0].department_name);
          }
        });  // END REVISE ORDER QTY
      }  // END IF ORDER QTY > STOCK ON HAND
      else {
        // use entered quantity
        // console.log('quantity is '+answer.qty);
        itemCount += tempQty;
        // console.log('itemcount is '+itemCount);
      }
      var lineItem = {
        id: res[0].item_id,
        item: res[0].product_name,
        price: res[0].price,
        quantity: tempQty,
        extAmt: res[0].price * tempQty
      };
      cartArr.push(lineItem);
      clearScreen();
      displayLogo(itemCount);
      console.log('itemcount is '+itemCount);
      // what's next?
      // continue shopping, checkout or quit?
      inquirer
      .prompt([
        {
          type: 'list',
          name: 'next',
          message: 'Do you want to ...',
          choices: [
            'continue shopping?',
            'checkout?',
            'QUIT'
          ]
        }
      ])
      .then(function(whats){
        switch(whats.next){
          case 'continue shopping?':
            selectDept(itemCount);
            return;
          case 'checkout?':
            checkout(itemCount);
            return;
          case 'QUIT':
            process.exit();
        }
      });  // END WHAT'S NEXT 
    // cartArr.push(selection.qty + " * " + selection.item.product_name + "  $"+selection.item.price);
    }); // END DATABASE QUERY
  }); // END GET QTY 
}


checkout = function(count){
  var total=0;
  clearScreen();
  displayLogo(count);
  // console.log('check back for checkout functionality');
  console.log('Items in your cart:');
  for(i=0; i<cartArr.length; i++){
    console.log(cartArr[i].quantity + ' ' + cartArr[i].item + ' ($' + cartArr[i].price + ') $' + cartArr[i].extAmt);
    total+=cartArr[i].extAmt;
  }
  console.log('Total Order Amount: ' + total);
  // console.log('\n');
  inquirer
  .prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Place this order?',
      choices: [
        'Place Order',
        'Cancel'
      ]
    }
  ])
  .then(function(answer){
    if(answer.action==='Cancel'){
      selectDept();      
    }
    else{
      for(i=0; i<cartArr.length; i++){
        productsUpdate(cartArr[i].id, cartArr[i].quantity, cartArr[i].extAmt);
      }
    }
  });
}


function productsUpdate(id, qty, extAmt){
  // console.log('id: '+ id + ', qty: ' + qty, 'Extended Amount: ' + extAmt);
  var query = connection.query(
    'UPDATE products SET stock_quantity = (stock_quantity - ?), product_sales = (product_sales + ?) WHERE item_id = ?',
    [qty, extAmt, id],
    function(err,res){
      if(err) throw err;      
      // console.log(res);
      // console.log('Thank you for your order!');
      // process.exit();
      cartArr = [];
      itemCount = 0;
      tempQty = 0;
      clearScreen();
      selectDept(-1);
    }
  );
}


displayLogo = function(itemCnt){
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
  var cartLine='';
  var cartMsg = itemCnt + " items in your cart"
  if (itemCnt > 9){
    cartLine = side.green + '          ' + cartMsg.red + '          ' + side.green;
  }
  else{
    cartLine = side.green + '           ' + cartMsg.red + '          ' + side.green;
  }
  var thanksLine = side.green + "        Thank-you for your order!        ".cyan + side.green;
  clearScreen();
  console.log(BorderTop.green);
  console.log(BorderSides.green);
  console.log(companyLine.bold);
  // console.log(BorderSides.green);
  console.log(sloganLine);
  console.log(BorderSides.green);
  if(itemCnt>0){
    console.log(cartLine);
  }
  else if(itemCnt === -1){
    console.log(thanksLine);
  }
  else {
    console.log(BorderSides.green);
  }
  console.log(BorderBottom.green);
}
itemCnt = 0;

function clearScreen(){
  // clear output from this application/prevent scrolling
  process.stdout.write('\033c'); 
}