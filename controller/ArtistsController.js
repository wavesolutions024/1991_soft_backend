

export const addArtist = async (req,res)=>{
    try {
        const {artistName,artistNumber,username,password} = req.body;
        const {id} = req.user.id;

        if(!artistName){
            return res.status(400).json({
                message:"Artist Name Is Required"
            })
        }else if(!artistNumber){
                return res.status(400).json({
                message:"Artist Number Is Required"
            })
        }

    } catch (error) {
        
    }
}