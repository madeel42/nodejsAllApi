const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://adeel123:adeel123@devconnector-pdmbx.mongodb.net/nodePracticeUser', {
    useCreateIndex: true,
    useNewUrlParser: true
}, (err, data) => {
    console.log(err || data);
    console.log('mongodb connected')
})
const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        trim:true
    },
    password: {
        type:String,
        required:true
    },
    created:{
        type:Date,
        default:Date.now()
    },
})
const User = mongoose.model('User',userSchema);
module.exports = User;
