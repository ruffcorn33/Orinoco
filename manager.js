// REQUIRED MODULES
const inquirer = require('inquirer');
const mysql = require('mysql');
const colors = require('colors');
const cliBoxes = require('cli-boxes');
const columnify = require('columnify')
require("dotenv").config();
var mysql_pwd = process.env.MYSQL_PASSWORD;

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
  mainMenu();
});

mainMenu = function(){
  // clearScreen();
  displayLogo('main');
  inquirer
  .prompt([
    {
      name: 'main',
      type: 'list',
      message: 'Manager Options',
      choices: [
        'View Products',
        'View Low Inventory',
        'Add Inventory',
        'Add New Product',
        'QUIT'
      ]
    }
  ])
  .then(function(selection){
    if(selection.main === 'QUIT'){process.exit()}
    // parameter will be 'View' or 'Add'
    var mgrParm = selection.main.split(" ");
    // console.log(mgrParm[0]);
    selectDept(mgrParm[0], mgrParm[1]);  
  });
}

selectDept = function(operation, target){
  connection.query("SELECT DISTINCT department_name FROM departments", function(err,res){
    displayLogo('dept');
    // get user input - begin with choosing a department to narrow items displayed
    inquirer
    .prompt([
      {
        name:'dept',
        type: 'list',
        choices: function(){          
          var deptArr = [];
          var dept;
          deptArr.push('MAIN MENU');
          // give user option of all items when viewing but narrow by department when adding
          if(operation === 'View'){
            deptArr.push('ALL');
          }
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

      if(selection.dept === 'QUIT'){
        process.exit()
      }
      else if(selection.dept === 'MAIN MENU'){
        mainMenu();
      }

      switch(target){
        case 'Products':
          queryInventory(selection.dept, 'view');
          break;
        case 'Low':
          queryInventory(selection.dept, 'low');
         break;
        case 'Inventory':
          addInventory(selection.dept);
          break;
        case 'New':
          addNewProd(selection.dept);
          break;
        default:
          console.log('unknown input');
          break;
      }
    });
  });
}

queryInventory = function(dept, operation){
  if(operation === 'view'){
    if(dept === 'ALL'){
      connection.query("SELECT * FROM products", function(err,res){
        if (err) throw err;
        displayItems(res, operation);  
      });
    } 
    else{
      connection.query("SELECT * FROM products WHERE department_name = ?", dept, function(err,res){
        if (err) throw err;
        displayItems(res, operation); 
      });
    }
  }
  else if(operation === 'low'){
    if(dept === 'ALL'){
      connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err,res){
        if (err) throw err;
        displayItems(res, operation); 
      });
    } 
    else{
      connection.query("SELECT * FROM products WHERE stock_quantity <= 5 AND department_name = ?", dept, function(err,res){
        if (err) throw err;
        displayItems(res, operation); 
      });
    }
  }
}

displayItems = function(res, operation){
  displayLogo(operation);
  var productsArr = [];
  // ItemObj constructor.  move to its own js file?
  var ItemObj = function(name, dept, price, SOH, sales){
    this.product = name;
    this.department = dept;
    this.price = price;
    this.quantity = SOH;
    this.sales = sales
  }
  // fill array with item objects based on query results
  for(i=0; i<res.length; i++){
    item = new ItemObj(
      res[i].product_name, 
      res[i].department_name, 
      res[i].price,
      res[i].stock_quantity,
      res[i].product_sales
    )
    productsArr.push(item);
  }
  // format output
  var columns = columnify(productsArr, {
    columnSplitter: ' | '
  });
  // clearScreen();
  console.log('\n');
  // title of report
  if(operation === 'view'){
    console.log('**********ALL INVENTORY**********\n');
  }
  else if(operation === 'low'){
    console.log('**********LOW INVENTORY**********\n'); 
  }
  //display output
  console.log(columns);
  console.log('\n');
  // pause before returning to main menu
  pause();
}

addInventory = function(dept){
  // use the appropriate select query
  // send response to stockItems
  
  if(dept === 'ALL'){
    connection.query("SELECT * FROM products", function(err,res){;
      if (err) throw err;
      stockItems(res);
    });
  } 
  else{
    connection.query("SELECT * FROM products WHERE department_name = ?", dept, function(err,res){
      if (err) throw err;
      stockItems(res);
    });
  }
}

stockItems = function(res){
  // populate inquirer prompt with items
  // choosing an item will bring up a new menu requesting a quantity to order
  // this will trigger an SQL UPDATE that will add that quantity to the item
  // stock_quantity
  
  inquirer
  .prompt([
    {
      name:'item',
      type: 'list',
      choices: function(){
        var itemArr = ['MAIN MENU'];
        var item;
        for (i=0; i<res.length; i++){
          item = res[i].item_id + " " + res[i].product_name + ', quantity:' + res[i].stock_quantity;
          itemArr.push(item);
        }
        itemArr.push('QUIT'.red);
        return itemArr;
      },
      message: 'Select the item you want to resupply\n'.red
    }
  ])
  .then(function(selection){
    if(selection.item === 'MAIN MENU'){
      mainMenu();
    }
    else if(selection.item === 'QUIT') {process.exit()}
    else {
      // get item id 
      var getItemID = selection.item.split(" ");
      var itemID = getItemID[0];
      inquirer
      .prompt([
        {
          type: 'input',
          name: 'qty',
          message: 'Quantity to reorder?',
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
        // UPDATE product record by adding to stock quantity
        var query = connection.query(
          'UPDATE products SET stock_quantity = (stock_quantity + ?) WHERE item_id = ?',
          [answer.qty, itemID]
        );
        console.log('Stock order placed');
        pause();
      });
    };
  });
}

addNewProd = function(){
  console.log('add new product functionality is under construction');
  // need to add a menu that asks for product_name --> department_name --> price --> stock_quantity
  // department should be a list select from query to departments table
  // then does an insert into the products table

}

displayLogo = function(operation){
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
  var operationLine;
  if(operation === 'main'){
    operationLine = side.green +   "               MAIN MANU                 ".cyan + side.green;
  }
  else if(operation === 'dept'){
    operationLine = side.green +   "              DEPARTMENTS                ".cyan + side.green;
  }
  else if(operation === 'view'){
    operationLine = side.green +   "             VIEW INVENTORY              ".cyan + side.green;
  }
  else if(operation === 'low'){
    operationLine = side.green +   "           VIEW LOW INVENTORY            ".cyan + side.green;
  }
  else if(operation === 'stock'){
    operationLine = side.green +   "                RESTOCK                  ".cyan + side.green;
  }
  else if(operation === 'new'){
    operationLine = side.green +   "           ADD NEW PRODUCTS              ".cyan + side.green;
  }
  
  // clearScreen();
  console.log(BorderTop.green);
  console.log(BorderSides.green);
  console.log(companyLine.bold);
  console.log(sloganLine);
  console.log(managerLine);
  console.log(operationLine);
  console.log(BorderSides.green);
  console.log(BorderBottom.green);
}

clearScreen = function(){
  // clear output from this application/prevent scrolling
  process.stdout.write('\033c'); 
}

pause = function(){
  inquirer
  .prompt([
    {
      name:'input',
      type: 'list',
      choices: ['<ENTER>'],
      message: 'Hit ENTER to return to the main menu'
    }
  ])
  .then(function(selection){
    mainMenu();
  });
}