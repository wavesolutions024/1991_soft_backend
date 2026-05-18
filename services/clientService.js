import { database } from "../db/database.js";

export const addClientsService = async (payload, image, franchiesCode) => {
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
    const query = `UPDATE clients SET name=?,gender=?,email=?,mobileno=?,address=?,dob=? WHERE id = ?`;
    const values = [
      payload.name,
      payload.gender,
      payload.email,
      payload.mobileno,
      payload.address,
      payload.dob,
      id,
    ];

    await database.query(query, values);

    const imgQuery = `UPDATE tattooDetails SET tattoodetails=?,inch=?,price=?,tattooImage=? WHERE clientId=?`;
    const imgValues = [
      payload.tattoodetails,
      payload.inch,
      payload.price,
      image,
      id,
    ];

    const [oldImageData] = await database.query(`SELECT tattooImage FROM tattooDetails WHERE clientId = ?`,[id]);

    const oldImage = oldImageData[0]?.tattooImage;

    const finaleImage = image === null ? oldImage : image

    await database.query(imgQuery,imgValues);

    return {
      success:true,
      message:"Update Successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
