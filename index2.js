const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.set('view engine', 'ejs');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mysql = require('mysql');

var con = mysql.createConnection(
	{
	host: "localhost",
	user: "root",
	password: "password",
	database: "mydb",
	insecureAuth : true
	}
								);
 
con.connect(

	function(err) 
	{
		if (err) throw err;
	}
			);

app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return uuid(); 
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));


app.get('/login', (req, res) => {
  console.log('Inside the homepage callback function');
  console.log(req.sessionID);
  
  
  /res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');/
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  
  res.sendFile(__dirname + '/f.html');
});


app.post('/',urlencodedParser,
	function(req,res)
	{
		console.log('Inside POST homepage callback function');
		console.log(req.sessionID);
		
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.header('Expires', '-1');
		res.header('Pragma', 'no-cache');
		
		var s=req.body.Username;
		var s2=req.body.Password;
		
		var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ?";
		con.query(sql, [ s,s2 ], 
			function(err, result, fields) 
			{
				
				if(result.length > 0){
				var rows = result[0].username;
				var rows2=result[0].sid;
				res.render('home2',{username:rows,sid:rows2});}
					
				else
				res.sendFile(__dirname + '/f2.html');
			}
				);
  
  
	}
		);
			
app.get('/logout',function(req,res)
{    


	
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    req.session.destroy(function(err)
	{  
        if(err)
		{  
            console.log(err);  
        }  
        else  
        {  
			
            res.redirect('/login');  
		
			
        }  
    }					);  

}		);

app.listen(3000, () => {
  console.log('Listening on localhost:3000');
});