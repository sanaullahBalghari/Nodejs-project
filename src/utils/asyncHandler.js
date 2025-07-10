const asyncHandler=(requestHandler)=>{
   return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=> next(err))
    }
}

export {asyncHandler}
/*
using trycatch approch

const asyncHandler=(fn)=> async(req, resizeBy, next) =>{
    try {
       await fn(req, resizeBy, next) 
    } catch (error) {

        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })
        
    }
}

*/