import { database } from "../db/database.js";

const franchies = `CREATE TABLE IF NOT EXISTS franchies(
id INT AUTO_INCREMENT PRIMARY KEY,
franchies VARCHAR(255) NOT NULL,
address VARCHAR(255) NOT NULL,
username VARCHAR(255) NOT NULL,
password VARCHAR(100) NOT NULL,
role ENUM('Admin') DEFAULT 'Admin',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const clients = `CREATE TABLE IF NOT EXISTS clients(
id INT AUTO_INCREMENT PRIMARY KEY,
franchiesCode INT NOT NULL,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE,
gender ENUM('Male','Female','Other') NOT NULL,
mobileno VARCHAR(10) NOT NULL,
address VARCHAR(255) ,
dob VARCHAR(20) ,
status ENUM('Active','Deactive') DEFAULT 'Active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (franchiesCode) REFERENCES franchies(id) ON DELETE CASCADE ON UPDATE CASCADE
)`

const tattooDetails = `CREATE TABLE IF NOT EXISTS tattooDetails(
id INT AUTO_INCREMENT PRIMARY KEY,
clientId INT NOT NULL,
tattoodetails VARCHAR(255),
inch VARCHAR(255),
price VARCHAR(255),
tattooImage VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE
)`

const tattooArtists = `CREATE TABLE IF NOT EXISTS tattooArtists (
id INT AUTO_INCREMENT PRIMARY KEY,
franchiesCode INT NOT NULL,
artistName VARCHAR(255) NOT NULL,
artistNumber VARCHAR(20) NOT NULL,
username VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
role ENUM('Artist') DEFAULT 'Artist',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (franchiesCode) REFERENCES franchies(id) ON DELETE CASCADE ON UPDATE CASCADE
)`



const createTable = async (table,query) =>{
try {
    await database.query(query);

    console.log(`${table} is created successfully`)
} catch (error) {
    console.log(error)
}
}

export const createALLtabels = async ()=>{
   await createTable("franchies",franchies);
   await createTable("clients",clients);
   await createTable("tattooDetails",tattooDetails);
   await createTable("tattooArtists",tattooArtists);
}