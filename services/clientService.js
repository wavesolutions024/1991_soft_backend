import { database } from "../db/database.js";

export const addClientsService = async (payload,image,franchiesCode) => {
  try {
    const query = `INSERT INTO clients (franchiesCode,name,gender,email,mobileno,address,dob) VALUES (?,?,?,    ?,?,?,?)`;
    const values = [
      franchiesCode,
      payload.name,
      payload.gender,
      payload.email,
      payload.mobileno,
      payload.address,
      payload.dob,
    ];

    const [clients] = await database.query(query, values);

    //  tattoo details
    const ttQuery = `INSERT INTO tattooDetails (clientId,tattoodetails,inch,price,tattooImage) VALUES(?,?,?,?,?)`;
    const ttValues = [
      clients.insertId,
      payload.tattoodetails,
      payload.inch,
      payload.price,
      image,
    ];

    await database.query(ttQuery,ttValues);

    return {
        success:true,
        message:"Clients added successfully"
    }

  } catch (error) {
   
    return {
        success:false,
        message:error.message
    }
  }
};
