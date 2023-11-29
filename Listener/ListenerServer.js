const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname +'/static'));
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/swe432');
const db = mongoose.connection;

const songSchema = new mongoose.Schema({
  _id: String,
  Title: String,
  Artist: String,
  AlbumName: String,
  ImagePath: String,
  Description: String
});

const listenerPreferences = new mongoose.Schema({
  _id : String,
  uid: Number,
  Username: String,
  DisplayName: String,
  Email: String,
  LikedGenres: String,
  DislikedGenres: String
});

//timeslot for producer
const timeslotSchema = new mongoose.Schema({
  timeslot: String,
  dj: String,
  playlist: String,
  songs: [songSchema]
  });

db.once('open', () => {
    console.log('DEBUG: Mongo session has been connected');
});

app.get('/Listener', async function(req, res) {
  let songs = mongoose.model('SongList', songSchema, 'SongList');
  let songslist = await songs.find();
  let playingsong = songslist[6];
  
  res.render('pages/ListenerHome', {
    songsl: songslist,
    playingsong: playingsong
  });
});

app.get('/ListenerSearch*', async function(req, res){
  let songs = mongoose.model('SongList', songSchema, 'SongList');
  let search = await req.query.search;
  let songlist = await songs.find({$or: [{'Artist': {$regex: new RegExp(search, 'i')}}, {'Title': {$regex: new RegExp(search, 'i')}}]});
  res.json(songlist);
  console.log(songlist);
});

app.get('/ListenerSettings', async function(req, res) {
  let songs = mongoose.model('SongList', songSchema, 'SongList');
  let search = await req.query.search;
  let songlist = await songs.find({$or: [{'Artist': {$regex: new RegExp(search, 'i')}}, {'Title': {$regex: new RegExp(search, 'i')}}]});
  let playingsong = songlist[6]

  let prefs = mongoose.model('ListenerPref', listenerPreferences, 'ListenerPref');
  let userprefs = await prefs.find()
  
  res.render('pages/ListenerSettings', {
    playingsong: playingsong,
    userprefs: userprefs
  });
});

app.post('/ListenerUpdate*', async function(req, res){
  console.log(req.body)
  let prefs = mongoose.model('ListenerPref', listenerPreferences, 'ListenerPref');
  let update = {}

  if(req.body.Username!=""){
    update.Username = req.body.Username
  }
  if(req.body.DisplayName!=""){
    update.DisplayName = req.body.DisplayName
  }
  if(req.body.Email!=""){
    update.Email = req.body.Email
  }
  if(req.body.LikedGenres!=""){
    update.LikedGenres = req.body.LikedGenres
  }
  if(req.body.DislikedGenres!=""){
    update.DislikedGenres = req.body.DislikedGenres
  }
  ud = await prefs.findOneAndUpdate({"uid": 1}, {
    $set: {update}
  });
  let userdata = await prefs.findOne();
  res.json(userdata);
  console.log("Server Updated, "+userdata)
})

//Producer part
const constTimeslots = [
  { time: '9:00 AM - 10:00 AM' },
  { time: '10:00 AM - 11:00 AM' },
  { time: '11:00 AM - 12:00 PM' },
  { time: '12:00 PM - 1:00 PM' },
  { time: '1:00 PM - 2:00 PM' },
  { time: '2:00 PM - 3:00 PM' },
  { time: '3:00 PM - 4:00 PM' },
  { time: '4:00 PM - 5:00 PM' },
  { time: '5:00 PM - 6:00 PM' },
  { time: '6:00 PM - 7:00 PM' },
  { time: '7:00 PM - 8:00 PM' },
  { time: '8:00 PM - 9:00 PM' },
  { time: '9:00 PM - 10:00 PM' },
];

const Songs = mongoose.model('SongList', songSchema, 'SongList');
const Playlist = mongoose.model('Playlist', timeslotSchema, 'Playlist');

// producer page
app.get('/Producer', async function(req, res) {
  let songslist = await Songs.find();
  let playlistDB = await Playlist.find();

  res.render('pages/Producer', { 
    DBsongs: songslist, 
    timeslots: constTimeslots,
    playlist : playlistDB
   });
});

// producer add songs
app.post('/addSong', async (req, res) => {
  const selectedSongTitle = req.body.selectedSong;
  const formTimeslot = req.body.selectedTimeslot;

  const selectedSong = await Songs.findOne({title: selectedSongTitle});
  if (!selectedSong) {
    return res.status(404).json({ error: 'Selected song not found' });
  }

  const playlist = await Playlist.findOne({timeslot: formTimeslot});
  if (!playlist) {
    return res.status(404).json({error: 'Playlist not found'});
  }

  playlist.songs.push(selectedSong);
  await playlist.save();

  res.redirect('/');
});


console.log("DEBUG: Server listening in 8080")
app.listen(8080)