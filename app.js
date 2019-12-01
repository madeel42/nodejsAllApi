const express = require('express');
const app = express();
const lodash = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const config = require('config');
const formidable = require('formidable')
const cors = require('cors')
const bd = require('body-parser');
const Post = require('./models/postmodel')
const User = require('./models/userModel')
app.use(cors());
app.use(express.json());
app.use(bd.json());
//////////////////////////////here we get all user///////////////////////////////
app.get('/', (req, res) => {
  User.find({}, (err, data) => {
    if (err) throw err
    res.json({ users: data })
  })
})
///////////////////////////////////////////here we get all user using params///////////
app.get('/alluser/:userId', (req, res) => {
  return res.json(req.profile);
})
////////////////////////////////////////////////////here we signup user////////////////
app.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      message: "please enter all fields"
    })
  }
  User.findOne({ email }).then(user => {
    if (user) return res.json({ msg: "user already exist" })
  })
  const newUser = new User({
    email, password, name
  })
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err
      newUser.password = hash;
      newUser.save().then(user => {
        jwt.sign({ id: user.id }, 'jwtSecrt', { expiresIn: 36000 }, (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password
            },
            success: true
          })
        })
      })
    })
  })
})
////////////////////////////////////////////////here we update user info/////////////////////
app.put('/user/:userId', (req, res) => {
  let user = req.profile;
  user = lodash.extend(user, req.body);
  user.updated = Date.now();
  user.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: "user dos't updated" })
    } else {
      res.json({ data })
    }
  })
})
///////////////////////////////////////////here we delete user info ////////////////////
app.delete('/user/:userId', (req, res) => {
  let user = req.profile;
  user.remove((err, data) => {
    if (err) {
      return res.status(400).json({ error: "user dos't delete" })
    } else {
      res.json({ msg: "user delete successfully" });
    }
  })
})
/////////////////////////////////////////////here we set params///////////////////////////
app.param('userId', (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'user not found' })
    }
    req.profile = user;
    next();
  })
})
///////////////////////////////////////////////////post Portion///////////////
///////////////////////////////////////////////////here we get who posted/////////
app.get('/post/by/:userId', (req, res) => {
  Post.find({ postedBy: req.profile._id }).populate("postedBy", '_id name').sort('_created').exec((err, data) => {
    if (err) {
      return res.json({ msg: "erroe occur" })
    } else {
      res.json({ data })
    }
  })
})
////////////////////////////////////////////////////////////////we get all post///////
app.get('/allpost', (req, res) => {
  // Post.find({}, (err, data) => {
  //   res.json(data);
  // });
  Post.find().populate('postedBy', '_id name').select("_id title body").then(data => {
    res.json({
      user: data,
      success: true
    })
  }).catch(err => console.log(err))
})
///////////////////////////////////////////////////here get post by post id////////////////
app.get('/post/:postId', (req, res) => {
  return res.json(req.profile);
})
///////////////////////////////////////////////here we create post///////////////////////////
app.post('/post/new/:userId', (req, res, next) => {
  let form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ msg: 'error occured' })
    } else {
      let post = new Post(fields);
      post.postedBy = req.profile;
      post.save().then(data => {
        return res.json({ data })
      })

    }

  })


  //   let form = new formidable.IncomingForm();
  //   form.parse(req,(err,fields,files)=>{
  //     if(err) {
  //       return res.status(400).json({
  //         error:'img could not be upload'
  //       })
  //     }else {
  //       let post = new Post(fields);
  //       req.profile.hashed_password = undefined;
  //       post.postedBy = req.profile;
  //       post.save((err,data)=>{
  //         if(err){
  //           return res.status(400).json({
  //             error:err
  //           })
  //         }else{
  //           res.json({data})
  //         }
  //       })
  //     }
  //   })
})
// app.post('/post',(req,res)=>{

// const post = new Post(req.body);
// post.save().then(data =>{
//   return res.json({data})
// })
// })
////////////////////////////////////////////////////here we see that who posted///////////
app.get('/post/by/:userId', (req, res) => {
  Post.find({ postedBy: req.profile._id }).populate('postedBy,"_id name').exec((err, data) => {
    if (err) {
      return res.status(400).json({ msg: 'error occur' })
    } else {
      res.json({ data })
    }
  })
})
///////////////////////here we remove post////////////////
app.delete('/postdell/:postId', (req, res) => {
  let post = req.profile;
  post.remove((err, data) => {
    if (err) {
      return res.json({ msg: "error occured" })
    } else {
      res.json({ msg: "post succfully deleted" })
    }
  })
})
/////////////////////////////here we update post///////////////////
app.put('/postupdate/:postId', (req, res) => {
  let post = req.profile;
  post = lodash.extend(post, req.body);
  post.created = Date.now();
  post.save().then(data => {
    return res.json(data);
  })
})
///////////////////////////////////////////////set params for post///////////////////////
app.param('postId', (req, res, next, id) => {
  Post.findById(id).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ msg: 'post not found' })
    }
    req.profile = data;
    next();
  })
})
const port = process.env.Port || 4000;
app.listen(port, () => {
  console.log('server started');
})