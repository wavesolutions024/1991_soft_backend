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
email VARCHAR(255),
gender ENUM('Male','Female','Other') NOT NULL,
mobileno VARCHAR(10) NOT NULL,
tattooArtist VARCHAR(255) DEFAULT ('Admin') ,
clientType VARCHAR(255),
referallName VARCHAR(255),
address VARCHAR(255) ,
dob VARCHAR(20) ,
status ENUM('Active','Deactive') DEFAULT 'Active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (franchiesCode) REFERENCES franchies(id) ON DELETE CASCADE ON UPDATE CASCADE
)`;

const tattooDetails = `CREATE TABLE IF NOT EXISTS tattoodetails(
id INT AUTO_INCREMENT PRIMARY KEY,
clientId INT NOT NULL,
tattoodetails VARCHAR(255),
inch VARCHAR(255),
price VARCHAR(255),
tattooImage VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE
)`;

const tattooArtists = `CREATE TABLE IF NOT EXISTS tattooArtists (
id INT AUTO_INCREMENT PRIMARY KEY,
artistCode VARCHAR(20) NOT NULL,
franchiesCode INT NOT NULL,
artistName VARCHAR(255) NOT NULL,
artistNumber VARCHAR(20) NOT NULL,
username VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
role ENUM('Artist') DEFAULT 'Artist',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (franchiesCode) REFERENCES franchies(id) ON DELETE CASCADE ON UPDATE CASCADE
)`;

const consentForm = `CREATE TABLE IF NOT EXISTS consent(
id INT AUTO_INCREMENT PRIMARY KEY,
clientId INT NOT NULL,
idProofType ENUM ('Aadhar Card', 'Pan Card', 'Passport') NOT NULL,
idProofNumber VARCHAR(255) NOT NULL,
idProofImage VARCHAR(255),
signature VARCHAR(255),
medicalDesc JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE
)`;

const logs = `CREATE TABLE IF NOT EXISTS logs(
id INT AUTO_INCREMENT PRIMARY KEY,
user VARCHAR(255) NOT NULL,
service VARCHAR(255) NOT NULL,
action VARCHAR(255) NOT NULL,
tableNames TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const enquiry = `CREATE TABLE IF NOT EXISTS enquiry (
id INT AUTO_INCREMENT PRIMARY KEY,
franchiesCode INT NOT NULL,
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
mobileNo VARCHAR(20) NOT NULL,
gender VARCHAR(20),
tattooStyle VARCHAR(100),
tattooDescription TEXT,
budget DECIMAL(10,2),
status ENUM('pending','contacted','booked','completed','cancelled') DEFAULT 'pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (franchiesCode) REFERENCES franchies(id) ON DELETE CASCADE ON UPDATE CASCADE
)`;

// const appoinments = `CREATE TABLE IF NOT EXISTS appoinments (
// id INT AUTO_INCREMENT PRIMARY KEY,

// ) `

const createTable = async (table, query) => {
  try {
    await database.query(query);

    console.log(`${table} is created successfully`);
  } catch (error) {
    console.log(error);
  }
};

export const createALLtabels = async () => {
  await createTable("franchies", franchies);
  await createTable("clients", clients);
  await createTable("tattoodetails", tattooDetails);
  await createTable("tattooArtists", tattooArtists);
  await createTable("consentForm", consentForm);
  await createTable("logs", logs);
  await createTable("enquiry", enquiry);
};
