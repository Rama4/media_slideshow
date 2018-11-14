var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const path = require('path');
const async = require('async');

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var userRoutes = require('./users');
var uploadRoutes = require('./upload');
var File = require("../models/file");
var User = require("../models/users");
var TV = require("../models/tv");

var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
//-------------------------------------------------------------------------------------------------
function upload(req, res)
{
    if (!req.payload._id)
    {
        res.status(401).json({"message" : "UnauthorizedError: private profile"});
    }
    else
    {
        User.findById(req.payload._id, (err, user) =>
        {
            if (err)
            {
                res.status(404).json({"message": "User not found!"});
            }
            else
            {
                var form = new IncomingForm();
                form.on('file', (field, file) =>
                {
                    console.log("uploading file..");
                    var new_file = {
                        name : file.name,
                        author : user,
                        date_created : new Date(),
                        size : fs.statSync(file.path).size
                    }
                    File.create(new_file, (err, saved_file) =>
                    {    
                        if(err)
                        {
                            console.log(err);
                            res.status(500).json({"message" : "error while creating file"});
                        }
                        else
                        {
                            console.log(saved_file)
                            console.log(typeof file.path)
                            fs.rename(file.path, path.join(__dirname, "../../", "files", String(saved_file._id)), (err)=>
                            {
                                if(err) throw err;
                                console.log("file saved!");
                            });
                        }
                    });
                });
                
                
                form.on('end', () =>
                {
                    res.json({'success':true});
                });
                
                form.parse(req);
            }
        });
    }
};
//-------------------------------------------------------------------------------------------------

// delete me
var files_path = path.join(__dirname, "../../", "files");
// fs.rmdir(files_path, (err) =>{ console.log( err ? err : "deleted files directory") });
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
// deleteFolderRecursive(files_path);
// fs.mkdir(files_path, (err) =>{ console.log( err ? err : "created files directory") });

//-------------------------------------------------------------------------------------------------
function get_files(req,res)
{
    File.find().populate("author").exec((err,files) => 
    {
        console.log( err ? err : `got list of files successfully!:\n${files}`);
        if(err) res.status(500).send(err);
        else res.status(200).send(files);
    });    
};
//-------------------------------------------------------------------------------------------------
function get_all_files(callback)
{
    File.find({}).lean().exec((err,files)=>
    {
        if(err)
        {
            console.log(`error while getting list of files: ${err}`);
            callback(err)
        }
        callback(null, files)
    })
}
//-------------------------------------------------------------------------------------------------
function get_tvs(req,res)
{
    // use lean() after find() to return js objects, which don't have additional methods like save()
    // By default Mongoose transforms the plain javascript objects returned from the database into Mongoose objects,
    // which have additional methods like save(). this leads to faster queries..
    TV.find({}).lean().exec((err, tvs) =>
    {
        if (err){console.log(err); return res.status(500).send(err);}
        get_all_files((err,files_list) =>
        {
            console.log( err ? err : `got list of tvs successfully!:\n${tvs}`);
            console.log(tvs);
            if(err) res.status(500).send(err);
            else res.status(200).json({"tvs":tvs, "files":files_list});      
        });
    });
}
//-------------------------------------------------------------------------------------------------
function create_tv(req, res)
{
    get_all_files((err,files_list) =>
    {
        if(!err)
            TV.create({name: req.body.name, files:files_list}, (err, saved_tv) => 
            {
                if(err)
                {
                    console.log(err);
                    res.status(500).json({"message" : "error while creating file"});
                }
                else
                {
                    console.log(saved_tv)
                    res.status(200).json({"message" : "Tv Created Successfully!"});
                }        
            });
    });
}
//-------------------------------------------------------------------------------------------------
function _get_tv(tvName, callback)
{
    TV.findOne({name: tvName}).populate('files').exec((err, found_tv) =>
    {
        if(err)
        {
            console.log(err);
            callback(err);
        }
        else if(!found_tv)
        {
            console.log
            callback({code:404})
        }
        else
        {
            callback(null, found_tv);
        }  
    })
}
//-------------------------------------------------------------------------------------------------
function get_tv_details(req, res)
{
    _get_tv(req.params.tvName, (err, tv_details) =>
    {
        if(err)
            return res.status(err.code).json(err);
        return res.status(200).json({"data" : tv_details});
    })
}
//-------------------------------------------------------------------------------------------------
function update_tv(req, res)
{
    TV.findOne({name: req.params.tvId}).exec((err, found_tv) =>
    {
        if(err)
        {
            console.log(err);
            return res.status(500).json({"message":err});
        }
        console.log(req.body)
        found_tv.files = req.body.files;
        found_tv.name = req.body.name;
        found_tv.save((err, saved_tv) =>
        {
            if(err)
            {
                console.log(err);
                return res.status(500).json({"message":err});
            }
            saved_tv.populate('files', (err) =>
            {
                if(err)
                {
                    console.log(err);
                    return res.status(500).json({"message":err});
                }
                return res.status(200).json({"data":saved_tv, "message":"Files Reordered Successfully!"});
            })
        });
    })
}
//-------------------------------------------------------------------------------------------------
function get_all_tvs(data, callback)
{
    // get only _id, name and files of each tv
    TV.find({}, { "name": 1, "files": 1, "_id": 1}).exec((err, tvs) =>
    {
        if(err)  callback(err);
        else    callback(null, data, tvs);
    });
}
//-------------------------------------------------------------------------------------------------
function modify_files_in_all_tvs(disp_arr, tvs, callback)
{
    let i=0, j=0;
    let tv;
    for (let [tvName, files] of disp_arr)
    {
        tv = tvs.find((o)=>o.name == tvName);
        j=0;
        let files_arr = Object.entries(files);
        for (let [fileId, isEnabled] of files_arr)
        {
            let index = tv.files.indexOf(fileId);
            if(isEnabled == true && index < 0 )
            {    
                tv.files.push(fileId);
            }
            else if(isEnabled == false && index >= 0 )
            {
                tv.files.splice(index,1);
            }
            // save the tv document, only after all changes are made.
            // if we save() after every edit (inside the for loop), we will get 
            // "too many save() called in parallel, for the same document" error
            if(++j == files_arr.length)
                tv.save();
        }
        if(++i == disp_arr.length)
            callback(null);
    }
}
//-------------------------------------------------------------------------------------------------
function save_disp_matrix(req,res)
{
    
    let disp_arr = Object.entries(req.body);
    async.waterfall([
        // create an anonymous function to pass arguments to first function
        (callback)=>callback(null,disp_arr),        
        get_all_tvs,    
        modify_files_in_all_tvs
    ],
    (err) =>
    {
        if(err)
        {
            console.log(err);
            res.status(500).json({"message" : "error while getting tv details"});
        }
        else
        {
            console.log("display matrix updated successfully")
            res.status(200).json({"message":"Changes Saved Successfully"});
        }
    })
    
}
//-------------------------------------------------------------------------------------------------
// video streaming

var mimeNames = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.ogg': 'application/ogg', 
    '.ogv': 'video/ogg', 
    '.oga': 'audio/ogg',
    '.txt': 'text/plain',
    '.wav': 'audio/x-wav',
    '.webm': 'video/webm'
};

function getMimeNameFromExt(ext) {
    var result = mimeNames[ext.toLowerCase()];
    
    // It's better to give a default value.
    if (result == null)
        result = 'application/octet-stream';
    
    return result;
}

function readRangeHeader(range, totalLength) {
        /*
         * Example of the method 'split' with regular expression.
         * 
         * Input: bytes=100-200
         * Output: [null, 100, 200, null]
         * 
         * Input: bytes=-200
         * Output: [null, null, 200, null]
         */

    if (range == null || range.length == 0)
        return null;

    var array = range.split(/bytes=([0-9]*)-([0-9]*)/);
    var start = parseInt(array[1]);
    var end = parseInt(array[2]);
    var result = {
        Start: isNaN(start) ? 0 : start,
        End: isNaN(end) ? (totalLength - 1) : end
    };
    
    if (!isNaN(start) && isNaN(end)) {
        result.Start = start;
        result.End = totalLength - 1;
    }

    if (isNaN(start) && !isNaN(end)) {
        result.Start = totalLength - end;
        result.End = totalLength - 1;
    }

    return result;
}

function sendResponse(response, responseStatus, responseHeaders, readable) {
    response.writeHead(responseStatus, responseHeaders);

    if (readable == null)
        response.end();
    else
        readable.on('open', function () {
            readable.pipe(response);
        });

    return null;
}
// function to download the whole file
function download(req, res)
{
    const file_directory = path.join(__dirname, "../../", "files");
    const file_path = path.join(file_directory, req.params.fileId);
    if(fs.existsSync(file_path))
    {
        let header = {"content-type":"video/mp4"}
        fs.createReadStream(file_path).pipe(res);
        res.writeHead(206, header);
        console.log("file found")
    }
    else
    {
        res.status(404).json({"message":"File not found!"});
    }   
}
// function to stream the file
function download2(request, response) {
    
    const file_directory = path.join(__dirname, "../../", "files");
    const filename = path.join(file_directory, request.params.fileId);
    
    // Check if file exists. If not, will return the 404 'Not Found'. 
    if (!fs.existsSync(filename)) {
        sendResponse(response, 404, null, null);
        return null;
    }

    var responseHeaders = {};
    var stat = fs.statSync(filename);
    var rangeRequest = readRangeHeader(request.headers['range'], stat.size);

    // If 'Range' header exists, we will parse it with Regular Expression.
    if (rangeRequest == null) {
        responseHeaders['Content-Type'] = getMimeNameFromExt(path.extname(filename));
        responseHeaders['Content-Length'] = stat.size;  // File size.
        responseHeaders['Accept-Ranges'] = 'bytes';

        //  If not, will return file directly.
        sendResponse(response, 200, responseHeaders, fs.createReadStream(filename));
        return null;
    }

    var start = rangeRequest.Start;
    var end = rangeRequest.End;

    // If the range can't be fulfilled. 
    if (start >= stat.size || end >= stat.size) {
        // Indicate the acceptable range.
        responseHeaders['Content-Range'] = 'bytes */' + stat.size; // File size.

        // Return the 416 'Requested Range Not Satisfiable'.
        sendResponse(response, 416, responseHeaders, null);
        return null;
    }

    // Indicate the current range. 
    responseHeaders['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
    responseHeaders['Content-Length'] = start == end ? 0 : (end - start + 1);
    responseHeaders['Content-Type'] = getMimeNameFromExt(path.extname(filename));
    responseHeaders['Accept-Ranges'] = 'bytes';
    responseHeaders['Cache-Control'] = 'no-cache';

    // Return the 206 'Partial Content'.
    sendResponse(response, 206, 
        responseHeaders, fs.createReadStream(filename, { start: start, end: end }));
}
//-------------------------------------------------------------------------------------------------

// const getDuration = require('get-video-duration');
// const file_directory = path.join(__dirname,"../../", "files","5bd4246c4c898317289dbcce");

// // // From a local path...
// getDuration(file_directory).then((duration) => {
//   console.log(`duration = ${duration}`);
// });

//-------------------------------------------------------------------------------------------------

// Routes:

// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/tvs', create_tv);
router.post('/tvs/save', save_disp_matrix);
router.post('/tvs/:tvId', update_tv);

router.post('/users', userRoutes);
router.post('/upload', auth, upload);
router.get('/files', auth, get_files);
router.get('/tvs', get_tvs);
router.get('/tvs/:tvName', get_tv_details);
router.get('/download/:fileId', download2);
// router.get('/download2/:fileId', download2);

//-------------------------------------------------------------------------------------------------
module.exports = router;
//-------------------------------------------------------------------------------------------------