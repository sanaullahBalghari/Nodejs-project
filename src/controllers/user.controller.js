import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token and refresh token")
    }
}

const registeruser = asyncHandler(async (req, res) => {
    // get user data from frontend
    const { fullName, email, username, password } = req.body

    // validation
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with this username or email already exists")
    }

    // check for images, check for avatar
    const avatarLocalpath = req.files?.avatar?.[0]?.path
    console.log("Uploading Avatar From:", avatarLocalpath)

    const coverImageLocalpath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalpath)
    console.log("Avatar: ", avatar)

    const coverImage = coverImageLocalpath
        ? await uploadOnCloudinary(coverImageLocalpath)
        : null

    if (!avatar) {
        throw new ApiError(400, "Avatar is not uploaded to cloudinary")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong, try again")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    // username or email check
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect")
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // send cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User successfully logged in"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const changeCurrentPassword=asyncHandler(async(req, res)=>{

    const {oldPassword, newPassword}= res.body

    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {

        throw new ApiError(400, "invalid old password")
        
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200, {},"password cahnged successfully"))
})

const getCurrentUser=asyncHandler(async(req, res)=>{

    return res
    .status(200)
    .json(200, req.user,"current user fetched successfully")
})

const updateAccountDetails=asyncHandler(async(req, res)=>{

    const {fullName, email}=req.body
    if (!fullName || !email) {
        
        throw new ApiError(400, "All fields are requried")
    }
   const user= User.findByIdAndUpdate(
        req.user?._id,
        {
      $set:{
      fullName,
      email
         }
        },
        {new:true}
    
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,"account Details  update  successfully"))
})

const updateUserAvatar=asyncHandler(async(req, res)=>{

    const avatarLocalpath=req.file?.path

    if (!avatarLocalpath) {
        
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalpath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar ")
    }

    await User.findByIdAndUpdate(

        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}

    ).select("-password")

        return res
    .status(200)
    .json(new ApiResponse(200,"avatar  update  successfully"))
})

const updateUserCoverImage=asyncHandler(async(req, res)=>{

    const coverImageLocalpath=req.file?.path

    if (!coverImageLocalpath) {
        
        throw new ApiError(400, "coverimage file is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalpath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on coverimage ")
    }

   const user= await User.findByIdAndUpdate(

        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}

    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,"Cover image  update  successfully"))
})
export {
    registeruser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails ,
    updateUserAvatar,
    updateUserCoverImage
}
