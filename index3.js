const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const bodyParser = require('body-parser');
//const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./forms'));

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
  
  res.redirect('/login.html');
});


app.post('/',urlencodedParser,
	function(req,res)
	{
		console.log('Inside POST homepage callback function');
		console.log(req.sessionID);
		
		var loginas=req.body.LoginAs;
		var s=req.body.Username;
		var s2=req.body.Password;
		
		if(loginas=="Student"){
				
		var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ? AND LoginAs=?";
		con.query(sql, [ s,s2,loginas], 
			function(err, result, fields) 
			{
				
				if(result.length > 0){
				var name = result[0].username;
				
				var sql2 = "SELECT * FROM student WHERE username = ?";
		        con.query(sql2, [ name ], 
			function(err, result2, fields) 
			{
				var sid=result2[0].SID;
				
		
				
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
				
				app.get('/repair',function(req,res)
				{
					res.render('repair',{username:name,sid:sid});
				});
				
				
				app.post('/repair',urlencodedParser,
	            function(req,res)
	            {
					
					var type=req.body.Type;
					var desc=req.body.Description;
								
				res.render('repair2',{username:name,sid:sid})			
					
			    var sql2 = "INSERT INTO repair VALUES (?,?,?)";
				con.query(sql2,[ sid,type,desc],
				function(err,result,fields)
				{
				});
				});
				
				app.get('/remove',function(req,res)
				{
					var sq12 = "DELETE FROM repair WHERE sid = ?";
					con.query(sq12,[sid],function(err,result,fields)
					{
						res.render('repair3',{username:name,sid:sid});
						
					});
				});
				
				app.get('/show',function(req,res)
				{
					var sq12 = "select * FROM repair WHERE sid = ?";
					con.query(sq12,[sid],function(err,result,fields)
					{
						if(result.length==0){
						res.render('showerr',{username:name,sid:sid});}
						else{
						var des=result[0].description;
						res.render('show',{username:name,sid:sid,result:des});}
						
					});
				});
				
				
				
				
				
				});
				}
					
				else
				res.sendFile(__dirname+ '/login2.html');
			
				
	});
		}
	
	
	else if(loginas=="Hostel Staff"){
		
		let data =new Array();
				
			for(let i=0;i<3;i++)
			data[i]=new Array();
		
		var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ? AND LoginAs=?";
		con.query(sql, [ s,s2,loginas ], 
		function(err, result, fields) 
		{
			
			if(result.length > 0)
			{
				var name = result[0].username;
				
		
				
		   var sql2 = "SELECT * FROM hostel_worker WHERE USERNAME = ?";
		con.query(sql2, [ s ], 
		function(err, result2, fields)
		{
			
			var type = result2[0].type;
			console.log(type);
			
			var sql4 = "CREATE TABLE TABLA SELECT SID,Room_No,type,description FROM repair NATURAL JOIN student";
			con.query(sql4,function(err, result01, fields){//console.log(result01);
			});
			//console.log(result01);
			
			var sql3 = "SELECT SID,Room_No,description FROM TABLA WHERE type = ?";
		con.query(sql3, [type],
		   function(err, result3, fields) 
		   {
			  console.log(result3);
		
		    		
			
			res.render('staff',{username:name,data:result3});
			//res.sendFile(__dirname+ '/login2.html');
		});
		
		var sql5 = "DROP TABLE TABLA";
		con.query(sql5,function(err,results,fields){});
		
		});
		
			}
			
			else
				res.sendFile(__dirname+ '/login2.html');
			
		});
	}
	
	
	
	
	else if(loginas=="Mess Manager"){
		
	var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ? AND LoginAs=?";
		con.query(sql, [ s,s2,loginas ], 
		function(err, result, fields) 
		{
			
			if(result.length > 0){
				var name = result[0].username;
				
				console.log(name);
				
				res.render('manager',{username:name});
			}
			
			else
				res.sendFile(__dirname+ '/login2.html');
			
			
		});
		
		app.get('/manager',function(req,res)
				{
					res.render('manager',{username:s});
				});
		
		app.get('/headcounts',function(req,res)
		{
		
			var sql = "SELECT * FROM messoff WHERE startdate< curdate()  AND enddate>= curdate()";
			con.query(sql, 
			function(err,result, fields) 
			{
			var	headcount = result.length;
			res.render('headcount',{username:s,headcount:headcount});
			});
		});
	
		app.get('/mnotif',function(req,res)
		{
			res.render('mess_notif',{username:s});
		});
		
		app.post('/mnotif',urlencodedParser,
	            function(req,res)
	            {
					var desc=req.body.Description;
								
				res.render('mess_notif_2',{username:s})			
				var datetime = new Date();
			    var sql2 = "INSERT INTO notif VALUES (?,?)";
				con.query(sql2,[ datetime,desc],
				function(err,result,fields)
				{
				});
				});
	
	}
	
	else if(loginas=="Data Analyst")
	{
		var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ? AND LoginAs=?";
		con.query(sql, [ s,s2,loginas ], 
		function(err, result, fields) 
		{
			
			if(result.length > 0){
				var name = result[0].username;
				
				console.log(name);
				
				res.render('data',{username:name});
			}
			
			else
				res.sendFile(__dirname+ '/login2.html');
			
			
		});
		
		app.get('/breakfast',function(req,res)
				{
					res.sendFile(__dirname+ '/breakfast.html');
				});
				
				
				
				
		
	
	}
	
	else if(loginas=="Attendant")
	{
		
		var sql = "SELECT * FROM log WHERE username = ? AND password COLLATE utf8mb4_0900_as_cs = ? AND LoginAs=?";
		con.query(sql, [ s,s2,loginas ], 
		function(err, result, fields) 
		{
			
			if(result.length > 0){
				var name = result[0].username;
				
				console.log(name);
				
				res.render('attendant',{username:name});
			}
			
			else
				res.sendFile(__dirname+ '/login2.html');
			
			
		});
	
	
		app.get('/atten_notif',function(req,res)
		{
		res.render('a_notif',{username:s});
		});
		
		app.post('/atten_notif',urlencodedParser,
	            function(req,res)
	            {
					var desc=req.body.Description;
								
				res.render('a_notif_2',{username:s})			
				var datetime = new Date();
			    var sql2 = "INSERT INTO notif VALUES (?,?)";
				con.query(sql2,[ datetime,desc],
				function(err,result,fields)
				{
				});
				});
				
		app.get('/add',function(req,res)
		{
		res.render('add',{username:s});
		});
		
		app.post('/add',urlencodedParser,
	            function(req,res)
	            {
					var sd=req.body.SID;
					var user=req.body.USERNAME;
					var phone=req.body.PHONE;
								
			    var sql2 = "INSERT INTO student VALUES (?,?,?)";
				con.query(sql2,[ sd,user,phone],
				function(err,result,fields)
				{
				});
				
				res.render('add_2',{username:s})
				});
				
		
	
  
	}
		
		
	});
			
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



app.listen(3000);