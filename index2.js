const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const bodyParser = require('body-parser');
//const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.set('view engine', 'ejs');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(bodyParser.urlencoded({ extended: true }));
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
  
  res.sendFile(__dirname + '/login.html');
});


app.post('/',urlencodedParser,
	function(req,res)
	{
		console.log('Inside POST homepage callback function');
		console.log(req.sessionID);
		
		var s=req.body.Username;
		var s2=req.body.Password;
		
		var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ?";
		con.query(sql, [ s,s2 ], 
			function(err, result, fields) 
			{
				
				if(result.length > 0){
				var name = result[0].username;
				var sid=result[0].sid;
				res.render('home',{username:name,sid:sid});
				
				app.get('/billcheck',function(req,res){
					
				var sql2 = "SELECT amount FROM bill WHERE sid =?";
				con.query(sql2,[ sid ],
				function(err,result,fields)
				{
				var amount=result[0].amount;
					
	            res.render('bill',{username:name,sid:sid,bill:amount});
				});
	
				})
				
				app.get('/home',function(req,res)
				{
					res.render('home',{username:name,sid:sid});
				});
				
				app.get('/feedback',function(req,res)
				{
					res.render('feedback',{username:name,sid:sid});
				});
				
				app.post('/feedback',urlencodedParser,
	            function(req,res)
	            {
					
					var breakfast=req.body.Breakfast;
					var lunch=req.body.Lunch;
					var snacks=req.body.Snacks;
					var dinner=req.body.Dinner;
				
					
					res.render('feedback2',{username:name,sid:sid})		

                console.log(req.body);					
					
			    var sql2 = "UPDATE feedback SET  breakfast=?, lunch=?, snacks=?,dinner=? where sid=?";
				con.query(sql2,[ breakfast,lunch,snacks,dinner,sid ],
				function(err,result,fields)
				{
				});
				
				
				
				});
				
				app.get('/messoff',function(req,res)
				{
					res.render('messoff',{username:name,sid:sid});
				});
				
               app.post('/messoff',urlencodedParser,
	            function(req,res)
	            {
					
					var startdate=req.body.startdate;
					var enddate=req.body.enddate;
								
				res.render('messoff2',{username:name,sid:sid})			
					
			    var sql2 = "UPDATE messoff SET  startdate=?, enddate=? where sid=?";
				con.query(sql2,[ startdate,enddate,sid ],
				function(err,result,fields)
				{
				});
				});
				
				
				app.get('/remove',function(req,res)
				{
					var sq12 = "DELETE FROM repair WHERE sid = ?";
					con.query(sq12,[sid],function(err,result,fields)
					{
						res.render('remove',{username:name,sid:sid});
						
					});
				});
				
				app.get('/repair',function(req,res)
				{
					res.render('repair',{username:name,sid:sid});
				});
				
				app.post('/repair',urlencodedParser,
	            function(req,res)
	            {
					
					var type=req.body.Type;
					var desc=req.body.Description;
								
					//res.render('repair2',{username:name,sid:sid})	

					 var sql2 = "SELECT * FROM repair WHERE sid = ?";
					con.query(sq12,[sid],function(err,results,fields)
					{
						if(result.length > 0){}
						else
						{
					
							var sql2 = "INSERT INTO repair VALUES (?,?,?)";
							con.query(sql2,[ type,desc,sid ],
							function(err,result,fields)
							{
								res.render('repair2',{username:name,sid:sid})
							});
						}
					});
				
				
				
				
				});
				
				
				
				
				
				}
					
				else
				res.sendFile(__dirname + '/login2.html');
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



app.listen(3000,() => {
  console.log('Listening on localhost:3000');
});