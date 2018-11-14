const mongoose = require("mongoose");
var tvSchema = new mongoose.Schema({
    name : {
            type: String,
            required: true
            },
    files : [
                {  
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "file"
                }
            ]
});

module.exports = mongoose.model("tv",tvSchema);