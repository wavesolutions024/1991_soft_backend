import { database } from "../db/database.js";
import {  del } from "@vercel/blob";
export const addClientsService = async (payload, image, franchiesCode) => {
  try {
    const query = `INSERT INTO clients (franchiesCode,name,gender,email,mobileno,tattooArtist,paymentType, clientType,referallName,address,dob) VALUES (?,?,?,?,?, ?,?,?,?,?,?)`;
    const values = [
      franchiesCode,
      payload.name,
      payload.gender,
      payload.email,
      payload.mobileno,
      payload.tattooArtist,
      payload.paymentType,
      payload.clientType,
      payload.referallName,
      payload.address,
      payload.dob,
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
    await database.query(
      `UPDATE clients SET name=?,gender=?,email=?,mobileno=?,address=?,tattooArtist=?,clientType=?,referallName=?,dob=?,paymentType=? WHERE id=?`,
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
