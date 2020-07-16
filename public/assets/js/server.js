// Require modules
var express = require("express");
var path = require("path");
var util = require("util");
const fs = require("fs");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
var count = 1;
//Setup server
var app = express();
var PORT = process.env.PORT || 3001;;

//Allow data parsing for API
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var notes = [];

//Make all files public on server. This allows files in public folder to access each other
app.use(express.static(path.join(__dirname, "../../")));

//Create routes

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../../index.html"));
  });

app.get("/notes", function(req, res) {
  res.sendFile(path.join(__dirname, "../../notes.html"));
});

// Displays notes api
//Need to parse JSON since reading from file to put back in object type
app.get("/api/notes", function(req, res) {
  readFileAsync("../../../db/db.json", "utf-8").then((dbContents) =>{
    return res.json(JSON.parse(dbContents));
  }).catch((err) =>{
    console.log("error", err)
  })
  
});
//Stingify when writing to file
app.post("/api/notes", function(req, res){
  var newNote = req.body;
  newNote.id = count.toString();
  notes.push(newNote);
  writeFileAsync("../../../db/db.json", JSON.stringify(notes)).then(() =>{
    count++;
    return res.json(newNote);
  }).catch((err)=>{
    console.log("error", err);
  })
});
// Use promises to ensure each step of the way us completed and to avoid callback hell
//read file and determine which id corresponds to the triggered event, remove this note from array
app.delete("/api/notes/:id", function(req, res){
  var deleteID = req.params.id;
  readFileAsync("../../../db/db.json", "utf-8").then((dbContents) =>{
    notes = (JSON.parse(dbContents));
    console.log(notes);
    for(var i = 0; i < notes.length; i++){
      if(notes[i].id === deleteID){
        //Splice removes 1 index at position i in the notes array
        notes.splice(i, 1); 
      }
    }
  }).then(()=>{
    //Re-write file without deleted note
    console.log(notes);
    writeFileAsync("../../../db/db.json", JSON.stringify(notes))}).then(() =>{
      return res.json(notes);
    }).catch((err)=>{
      console.log("error", err);
    })
  });

  //Tell server to listen
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
  

