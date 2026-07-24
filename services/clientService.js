import { database } from "../db/database.js";
import {  del } from "@vercel/blob";
export const addClientsService = async (payload, image, franchiesCode,id) => {
  try {

     let backDate;
     if(payload.backDateEntry === ""){
      backDate = new Date()
     }else{
       backDate = payload.backDateEntry
     }

    let tattooArtist;

    if(payload.tattooArtist === ""){
      tattooArtist = "Admin"
    }else{
      tattooArtist = payload.tattooArtist
    }

    
    const query = `INSERT INTO clients (franchiesCode,a_id,name,gender,email,mobileno,tattooArtist,paymentType, clientType,referallName,address,dob,backDateEntry) VALUES (?,?,?,?,?,?,?, ?,?,?,?,?,?)`;
    const values = [
      franchiesCode,
      id,
      payload.name,
      payload.gender,
      payload.email,
      payload.mobileno,
      tattooArtist,
      payload.paymentType,
      payload.clientType,
      payload.referallName,
      payload.address,
      payload.dob,
      backDate
    ];

    const [clients] = await database.query(query, values);

    //  tattoo details
    const ttQuery = `INSERT INTO tattoodetails (clientId,tattoodetails,inch,price,tattooImage) VALUES(?,?,?,?,?)`;
    const ttValues = [
      clients.insertId,
      payload.tattoodetails,
      payload.inch,
      payload.price,
      image,
    ];

    await database.query(ttQuery, ttValues);

    return {
      success: true,
      message: "Clients added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const editClientService = async (payload, newImageUrl, id) => {
  try {
const [existData] = await database.query(`SELECT backDateEntry FROM clients WHERE id = ?`,id)
        let backDate;
     if(payload.backDateEntry === ""){
      backDate = existData[0].backDateEntry
     }else{
       backDate = payload.backDateEntry
     }


    await database.query(
      `UPDATE clients SET name=?, gender=?,email=?,mobileno=?,address=?,tattooArtist=?,clientType=?,referallName=?,dob=?,paymentType=?,backDateEntry=? WHERE id=?`,
      [
        payload.name,
        payload.gender,
        payload.email,
        payload.mobileno,
        payload.address,
        payload.tattooArtist,
        payload.clientType,
        payload.referallName,
        payload.dob,
        payload.paymentType,
        backDate,
        id,
      ]
    );

    const [[oldData]] = await database.query(
      `SELECT tattooImage FROM tattoodetails WHERE clientId=?`,
      [id]
    );

    const oldImage = oldData?.tattooImage;

    // 🔥 DELETE OLD IMAGE IF NEW ONE EXISTS
    if (newImageUrl && oldImage) {
      try {
        const pathname = new URL(oldImage).pathname;
        await del(pathname);
      } catch (err) {
        console.log("Blob delete failed:", err.message);
      }
    }

    const finalImage = newImageUrl || oldImage;

    await database.query(
      `UPDATE tattoodetails SET tattoodetails=?,inch=?,price=?,tattooImage=? WHERE clientId=?`,
      [
        payload.tattoodetails,
        payload.inch,
        payload.price,
        finalImage,
        id,
      ]
    );

    return {
      success: true,
      message: "Updated Successfully",
    };

  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
