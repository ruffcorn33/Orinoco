drop database if exists orinoco_DB;

create database orinoco_DB;
use orinoco_DB;

create table products (
item_id int not null auto_increment,
product_name varchar(100) null,
department_name varchar(100) null,
price decimal(10,2) null,
stock_quantity int null,
product_sales decimal(10,2),
primary key (item_id)
);

insert into products (product_name, department_name, price, stock_quantity, product_sales)
values 
("Cloud Atlas", "Books", 10.99, 45,0.00),
("The Bone Clocks", "Books", 11.99, 50, 0.00),
("Slade House", "Books", 9.99, 30, 0.00),
("Black Swan Green", "Books", 11.99, 40, 0.00),
("The Thousand Autumns of Jacob de Zoet: A Novel", "Books", 11.99, 50, 0.00),
("Ghost Written", "Books", 11.99, 50, 0.00),
("Number9Dream", "Books", 11.99, 50, 0.00),
("Neuromancer", "Books", 11.99, 50, 0.00),
("The Peripheral", "Books", 12.99, 100, 0.00),
("Mona Lisa Overdrive", "Books", 8.99, 50, 0.00),
("Count Zero", "Books", 7.99, 30, 0.00),
("Pattern Recognition", "Books", 12.99, 50, 0.00),
("The Difference Engine", "Books", 10.99, 50, 0.00),
("Burning Chrome", "Books", 8.99, 50, 0.00),
("Virtual Light", "Books", 7.99, 20, 0.00),
("Agency", "Books", 14.99, 50, 0.00),
("Zero History", "Books", 8.99, 50, 0.00),
("One Hundred Years of Solitude", "Books", 11.73, 50, 0.00),
("Love in the Time of Cholera", "Books", 11.99, 50, 0.00),
("Chronicle of a Death Foretold", "Books", 11.99, 50, 0.00),
("The Autumn of the Patriarch", "Books", 10.99, 50, 0.00),
("Of Love and Other Demons", "Books", 9.99, 50, 0.00),
("No One Writes to the Colonel: and Other Stories", "Books", 11.99, 50, 0.00),
("American Gods", "Books", 5.89, 50, 0.00),
("The Graveyard Book", "Books", 8.99, 50, 0.00),
("The Ocean at the End of the Lane", "Books", 10.99, 50, 0.00),
("The Sandman, Vol 1", "Books", 11.99, 50, 0.00),
("Coraline", "Books", 11.99, 50, 0.00),
("Stardust", "Books", 11.99, 50, 0.00),
("The Shepherd's Crown", "Books", 11.99, 50, 0.00),
("Mort", "Books", 11.99, 50, 0.00),
("The Light Fantastic", "Books", 11.99, 50, 0.00),
("Dark Sacred Night", "Books", 11.99, 50, 0.00),
("Two Kinds of Truth", "Books", 11.99, 50, 0.00), 
("Gotham Steel 5 Piece Kitchen Essentials Cookware Set", "Kitchen", 49.99, 10,0.00),
("Gotham Steel 20 Piece All in One Kitchen Cookware", "Kitchen", 11.99, 30, 0.00),
("Vremi 15 Piece Nonstick Cookware Set", "Kitchen", 272.84, 20, 0.00),
("Calphalon Classic Stainless Steel Cookware Set, 10-Piece", "Kitchen", 128.99, 10, 0.00),
("DANIALLI - 10-Piece Non Stick Aluminum Cookware Set", "Kitchen", 11.99, 30, 0.00),
("Chefs Star Professional Grade Aluminum 15 Piece", "Kitchen", 49.99, 30, 0.00),
("Calphalon Contemporary Square Griddle", "Kitchen", 36.99, 30, 0.00),
("Hamilton Beach Food Processor", "Kitchen", 33.99, 30, 0.00),
("Hamilton Beach Professional Dicing Food Processor", "Kitchen", 199.00, 20, 0.00),
("Braun FP3020 12 Cup Food Processor", "Kitchen", 158.94, 30, 0.00),
("Aicok 8-Cup Food Processor", "Kitchen", 39.99, 20, 0.00),
("Over-and-Back 4-Piece Porcelain Serving Bowl Set (4 Bowls)", "Kitchen", 34.99, 40, 0.00),
("Corelle Livingware 2-quart Serving Bowl Winter Frost White (3)", "Kitchen", 27.99, 100, 0.00),
("Nordic Ware 4-Piece Prep N Serve Mixing Bowl Set", "Kitchen", 26.99, 30, 0.00),
("CorningWare 12 Piece Round and Oval Bakeware Set", "Kitchen",37.99, 20, 0.00),
("Instant Pot DUO60 6 Qt", "Kitchen", 99.99, 300, 0.00),
("Instant Pot LUX60 V3 6 Qt", "Kitchen", 79.99, 30, 0.00),
("Advanced Pure Air ‘Air Fryer’", "Kitchen", 74.99, 40, 0.00),
("Acer Aspire  14 inch Full HD", "Computers", 209.99, 5,0.00),
("HP 14 Inch Stream Laptop", "Computers", 299.99, 9,0.00),
("Acer Aspire E 15", "Computers", 349.99, 2,0.00),
("HP High performance 17 inch HD", "Computers", 899.99, 3,0.00),
("Dell Inspiron 13.3 2 in 1", "Computers", 49.99, 1,0.00),
("Lenovo Ideapad 15.6", "Computers", 438.99, 1,0.00),
("Plugable USB 3.0 Universal Laptop Docking Station", "Computers", 94.99, 4,0.00),
("Laptop Stand", "Computers", 19.99, 10,0.00),
("Samsung Chromebook", "Computers", 149.99, 5,0.00), 
("Sony XBR-75Z9D 75 inch Class 4K Ultra HD TV", "Electronics", 6998.99, 5,0.00),
("TCL 32S305 32-Inch 720p TV", "Electronics", 159.99, 5,0.00),
("Samsung Electronics 43-Inch TV", "Electronics", 387.99, 5,0.00),
("Vizio 24-Inch TV", "Electronics", 88.99, 15,0.00),
("LG Electronics 65-Inch 4K Ultra HD Smart LED TV", "Electronics", 734.99, 5,0.00),
("Samsung Electronics 40-Inch 1080p Smart LED TV", "Electronics", 299.99, 5,0.00),
("Sceptre X509BV-FSR Slim LED 1080p HDTV, 50 Inch", "Electronics", 299.99, 5,0.00),
("Nintendo Switch", "Electronics", 297.99, 50,0.00),
("Xbox One S 500GB Console", "Electronics", 223.99, 3,0.00),
("PlayStation 4 Slim 1TB Console", "Electronics", 319.99, 45,0.00),
("Panasonic Eluga 16GB WiFi Android Tablet", "Electronics", 62.99, 5,0.00),
("Samsung Galaxy Tab 16GB Wifi Tablet", "Electronics", 125.99, 5,0.00);

create table departments (
department_id int not null auto_increment,
department_name varchar(100) null,
department_costs decimal(10,2) null,
primary key (department_id)
);

insert into departments (department_name, department_costs)
values 
("Books", 5000.00),
("Computers", 6000.00),
("Electronics",9000.00),
("Kitchen",7000.00);
