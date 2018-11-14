const mongoose = require("mongoose");
var fileSchema = new mongoose.Schema({
    name : {
            type: String,
            required: true
            },
    author : {  
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            },
    date_created : Date,
    size : String
});




module.exports = mongoose.model("file",fileSchema);