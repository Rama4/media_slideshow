const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const path = require('path');
var express = require('express');
var router = express.Router();

function upload(req, res)
{
    // var form = new IncomingForm();
    // form.on('file', (field, file) =>
    // {
    //     // Do something with the file
    //     // e.g. save it to the database
    //     // you can access it using file.path
    //     console.log("file upload da");
    //     console.log("dwddwfafs")
    //     // console.log(file);
    //     var destination_path = path.join(__dirname, "../../files", file.name);
        
    //     // if(fs.existsSync(destination_path))
    //     // {
    //     //     console.log("file already exists!");
    //     //     res.status(200).json({"duplicate":"true"});
    //     // }
    //     // else
    //     // {
    //     //     fs.rename(file.path, destination_path, (err)=>
    //     //     {
    //     //         if(err) throw err;
    //     //         console.log("file saved!");
    //     //         res.status(200).json({"success":"true"});
    //     //     });
    //     // }
        
            
    // });
    
    
    // form.on('end', () =>
    // {
    //     res.json({'success':true});
    // });
    
    // form.parse(req);
};

router.post('/', upload);

module.exports = router;