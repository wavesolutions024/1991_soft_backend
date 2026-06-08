import { database } from "../db/database.js";

export const addClientsService = async (payload, image, franchiesCode) => {
  try {
    const query = `INSERT INTO clients (franchiesCode,name,gender,email,mobileno,tattooArtist,clientType,referallName,address,dob) VALUES (?,?,?,?,?, ?,?,?,?,?)`;
    const values = [
      franchiesCode,
      payload.name,
      payload.gender,
      payload.email,
      payload.mobileno,
      payload.tattooArtist,
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

export const editClientService = async (payload, image, id) => {
  try {
    const query = `UPDATE clients SET name=?,gender=?,email=?,mobileno=?,address=?,tattooArtist=?,clientType=?, referallName=?,dob=? WHERE id = ?`;
    const values = [
      payload.name,
      payload.gender,
      payload.email,
      payload.mobileno,
      payload.address,
      payload.tattooArtist,
      payload.clientType,
      payload.referallName,
      payload.dob,
      id,
    ];

    await database.query(query, values);

    const imgQuery = `UPDATE tattoodetails SET tattoodetails=?,inch=?,price=?,tattooImage=? WHERE clientId=?`;
    const imgValues = [
      payload.tattoodetails,
      payload.inch,
      payload.price,
      image,
      id,
    ];

    const [oldImageData] = await database.query(
      `SELECT tattooImage FROM tattoodetails WHERE clientId = ?`,
      [id],
    );

    const oldImage = oldImageData[0]?.tattooImage;

    const finaleImage = image === null ? oldImage : image;

    await database.query(imgQuery, imgValues);

    return {
      success: true,
      message: "Update Successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
