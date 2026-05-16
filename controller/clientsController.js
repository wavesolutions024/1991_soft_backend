import { addClientsService } from "../services/clientService.js";

export const addClinets = async (req, res) => {
  try {
    const franchiesCode = req.user.id
    const payload = JSON.parse(req.body.clients);
    const baseUrl = "http://localhost:3003/images/";

    
    const imageFile = req.files?.tattooImage?.[0];

    const ttImage = imageFile ? `${baseUrl}/${imageFile.filename}` : null;

    const response = await addClientsService(payload, ttImage,franchiesCode);

    if (response.success) {
      return res.status(200).json({
        message: response.message,
      });
    } else {
      return res.status(500).json({
        message: response.message,
      });
    }
  } catch (error) {
console.log(error)
    return res.status(500).json({
        message:error.message
    })
  }
};
