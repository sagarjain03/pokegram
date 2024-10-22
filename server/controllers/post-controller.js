const sharp = require('sharp')
const Post = require('../models/post-model');
module.exports.addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!image) {
      return res.status(400).json({ message: 'Image is required', success: false });
    }
    //image upload
    //sharp use hota h image optimization k lie
    const optimizedImageBuffer = await sharp(image.buffer).resize({
      width: 800, height: 800, fit: 'inside'
    }).isformat('jpeg', { quality: 80 }).toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({
      path: 'author',
      select: '-password'
    });
    return res.status(201).json({ message: 'Post created successfully', success: true, post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', success: false });
  }
}

module.exports.getAllPost = async (req,res)=>{
  try{
      const posts = await Post.find().sort({ createdAt: -1 }).populate({
        path: 'author',
        select:'username profilePicture'
      }).populate({
        path: 'comments',
        sort: { createdAt: -1 },
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      })
      return res.status(200).json({success:true,posts})


  }catch(error){
    console.log(error);
    return res.status(500).json({message:'Internal Server Error',success:false})

  }
}

module.exports.getUserPost = async (req,res)=>{
  try{
    const authorId = req.id;
    const posts = await Post.find({author:authorId}).populate({
      path: 'author',
      select:'username profilePicture'
    }).populate({
      path: 'comments',
      sort: { createdAt: -1 },
      populate: {
        path: 'author',
        select: 'username profilePicture'
      }
    })
    return res.status(200).json({success:true,posts})

  }catch(error){
    console.log(error);
    return res.status(500).json({message:'Internal Server Error',success:false})

  }
}
module.exports.likePost = async (req,res)=>{
  try{
    const likeKrneWaleKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(400).json({message:'Post not found',success:false})
    }
    await post.updateOne({$addToSet:{likes:likeKrneWaleKiId}});
    await post.save();

    //implement socket io for real time notification 

    return res.status(200).json({message:'Post liked successfully',success:true,post})
  }catch(error){
    console.log(error);
    return res.status(500).json({message:'Internal Server Error',success:false})
  }
}
module.exports.dislikePost = async (req,res)=>{
  try{
    const likeKrneWaleKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(400).json({message:'Post not found',success:false})
    }
    await post.updateOne({$pull:{likes:likeKrneWaleKiId}});
    await post.save();

    //implement socket io for real time notification 

    return res.status(200).json({message:'Post disliked successfully',success:true,post})
  }catch(error){
    console.log(error);
    return res.status(500).json({message:'Internal Server Error',success:false})
  }
}

module.exports.addComment = async (req,res)=>{
  try{
    const postId = req.params.id;
    const commentKrneWaleKiId = req.id;
    const {text} = req.body;
    const post = await Post.findById(postId);
    if(!text){
      return res.status(400).json({message:'Text is required',success:false})
      const comment = await Comment.create({text,author:commentKrneWaleKiId,post:postId}).populate({
        path:'author',
        select:'username profilePicture'
      })
      post.comments.push(comment._id);
      await post.save();
      return res.status(201).json({message:'Comment added successfully',success:true,comment})
    }
  }catch(error){
    console.log(error);
    return res.status(500).json({message:'Internal Server Error',success:false})
  }
}

module.exports.getCommentOfPost = async (req,res)=>{
  try{
    const postId = req.params.id;
    const comments = await Comment.find({post:postId}).populate({
      path:'author',
      select:'username profilePicture'
    })
    if(!comments){
      return res.status(400).json({message:'No comments found',success:false})  
    }
    return res.status(200).json({message:'Comments fetched successfully',success:true,comments})
  }catch(error){

  }
}
export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const authorId = req.id;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found', success: false });
  }
  //check if the loggedin user is the owner of post
  if (post.author.toString() !== authorId) {
    return res.status(401).json({ message: 'Unauthorized access', success: false });
  }
  await Post.findByIdAndDelete(postId);
  //remove postId from user post
  let user = await User.findById(authorId);
  user.posts = user.posts.filter(id=> id.toString() !== postId);

  //delete associated comments
  await Comment.deleteMany({ post: postId });
  
  return res.status(200).json({ message: 'Post deleted successfully', success: true });
}
module.exports.bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: 'Post not found', success: false });
    }
    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({ message: 'Post unbookmarked successfully', success: true });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({ message: 'Post bookmarked successfully', success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error', success: false });
  }
}