var express = require('express');
var path = require('path');
var request = require('request');
var bodyParser = require('body-parser');
var config = require('./js/config.js');
var admin = require('./js/admin.js');
var root = process.cwd();
var app = express();
var id; 
var auth;
var book;
 
//your routes here
app.use("/css", express.static(__dirname + '/css'));
app.use("/html", express.static(__dirname + '/html'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/images", express.static(__dirname + '/images'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile('html/home.html',{root});
});

app.get('/login', function (req, res) {
    res.sendFile('html/login.html',{root});
});

app.post('/authenticate', function (req, res) {
	var query = {
         "username": req.body.username,
         "password": req.body.password
       };
	var options = {
         method: "POST",
         url: 'http://auth.' + config.DOMAIN + '/login',
         json: true,
         body: query
       }
	
	request(options, function(error, response, body){
         if(error){
           console.log(error);
           res.status(500).send("Error");
		 }
		 else if(body.hasura_id) {
			id = body.hasura_id;
		    config.TOKEN = body.auth_token;
		    res.status(200).send("Successful");
		 }
		 else {
			res.status(403).send("Incorrect Credentials");
		 }
	});
});

app.get('/signup', function (req, res) {
    res.sendFile('html/signup.html',{root});
});

app.post('/register', function (req,res) {
	var query = {
		 "username": req.body.username,
		 "password": req.body.password,
		 "email": req.body.email
	   }
	var options = {
		 method: "POST",
		 url: 'http://auth.' + config.DOMAIN + '/signup',
		 json: true,
		 body: query
	   }
	request(options, function(error, response, body){
		 if(error){
		   console.log(error);
		   res.status(500).send("Error");
		 }
		 else {
		   id = body.hasura_id;
		   config.TOKEN = body.auth_token;
		   res.status(200).send("Successful");
		 }
	});
});

app.post('/entername',function(req,res) {
	var query = {
		"type": "insert",
		"args": {
			"table": "user_details",
			"objects": [{
				"user_id": id,
				"user_name": req.body.name
			}]
		}
	}
	var options = {
		 method: 'POST',
		 url: 'http://data.' + config.DOMAIN + '/v1/query',
		 json: true,
		 headers : {
			 'Authorization': 'Bearer ' + admin.getToken()
			},
		 body: query
	 }
	 request(options, function(error, response, body){
		 if(error){
		   console.log(error);
		   res.status(500).send("Error");
		 }
		 else {
		   res.status(200).send("Successful");
		 }
	});	
});

app.post('/entergenre',function(req,res) { 
	console.log(id);
	var query = {
		"type": "insert",
		"args": {
			"table": "user-genre",
			"objects": [{
				"user_id":id,
				"genre_id": req.body.genre_id
			}]
		}
	}
	var options = {
		 method: 'POST',
		 url: 'http://data.' + config.DOMAIN + '/v1/query',
		 json: true,
		 headers : {
			 'Authorization': 'Bearer ' + admin.getToken()
			},
		 body: query
	 }
	 request(options, function(error, response, body){
		 if(error){
		   console.log(error);
		   res.status(500).send("Error");
		 }
		 else {
		   res.status(200).send("Successful");
		 }
	});
});

app.get('/logout', function (req, res) {
   id = 0;
   config.TOKEN = undefined;
   res.status(200).send("Successful");
});

function createWelcomeTemplate(data) { 
	var name = data[0].user_name;
	var bookpics = new Array(); var i;
	var bookname = new Array();
	var length = data.length;
	for(i=0; i<length; i++){
		bookname[i] = data[i].book_name.split("'").join("%27");
	}
	for(i=0; i<length; i++){
		bookpics[i] = data[i].book_pic;
	}
	var text = '';
	
	for (i = 0; i<length; i++) {
		var link = '"/review/' + bookname[i] + '"';
		text += '<a href = ' + link + '><img src="https://filestore.dejected61.hasura-app.io/v1/file/' + bookpics[i] +'" class="books"/></a>';
		if((i+1)%4==0)
			text = text + "<br>";
	}
	
	var htmlTemplate = `
		<!doctype HTML>
		<html>
			<head>
				<meta charset="utf-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<title>Welcome</title>
				<link rel="stylesheet" type="text/css" href="/css/welcomestyle.css"/>
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
			</head>
			<body>
				<div class="container-fluid">
					<div class="row">
						<div class="col-sm-7">
							<h1>Welcome, ${name}</h1>
						</div>
						<div class="col-sm-3">
							<img id="booki" src="http://images.clipartpanda.com/book-worm-clip-art-RTdRnoXxc.png"/>
						</div>
						<div class="col-sm-2">
							<button id="logout" href='/logout'>Log out</button>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-1"></div>
							<div class="col-sm-10">
								<h2>Search for a book : <input type="search" id="search">  <button id="search_button">Search</button></h2>
							</div>
						<div class="col-sm-1"></div>
					</div>
				<h2>Recommended books for you : </h2><br>
				<div id="books" align="left"></div>
			</div>
			</body>
			<script>
				document.getElementById("books").innerHTML = '${text}';
			</script>
			<script type="text/javascript" src="/js/welcome_page.js"></script>
		</html>`;
	return htmlTemplate;
}
 function createWriteTemplate(data){
	var bookname = data.book_name;
	var author = data.book_author;
	var genre = data.genre_name;
	var pic = data.book_pic;
	var htmlTemplate = `
	<!doctype HTML>
	<html>
		<head>
			<meta charset="utf-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>Write Review</title>
			<link rel="stylesheet" type="text/css" href="/css/write_review_style.css"/>
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		</head>
		<body>
			<div class = "container-fluid">
				<div class="row">
					<div class="col-sm-1"></div>
					<div class="col-sm-7">
						<h1 align="center">Write/Edit Review</h1>
					</div>
					<div class="col-sm-4">
						<a href = "/welcome"><img id="booki" src="http://images.clipartpanda.com/book-worm-clip-art-RTdRnoXxc.png"/></a>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-3">
						<img id="book_pic" src="https://filestore.dejected61.hasura-app.io/v1/file/${bookpic}" / >
					</div>
					<div class="col-sm-6">
						<h2 value="${bookname}" id="bname">Title : <div class="green">${bookname}</div></h2>
						<h2>Author : <div class="green">${author}</div></h2>
						<h2>Genre : <div class="green">${genre}</div></h2>
						<h2>Rating : (out of 5 stars)</h2>
						<div class="stars">
							<fieldset class="rating">
								<input type="radio" id="star5" name="rating"/><label for="star5" title="Rocks!">5 stars</label>
								<input type="radio" id="star4" name="rating"/><label for="star4" title="Pretty good">4 stars</label>
								<input type="radio" id="star3" name="rating"/><label for="star3" title="Meh">3 stars</label>
								<input type="radio" id="star2" name="rating"/><label for="star2" title="Kinda bad">2 stars</label>
								<input type="radio" id="star1" name="rating"/><label for="star1" title="Sucks big time">1 star</label>
							</fieldset>
						</div>
					</div>
					<div class="col-sm-3"></div>
				</div><br>
				<div class="row">
					<div class="col-sm-2"></div>
					<div class="col-sm-8">
						<textarea id="rev" cols="100" rows="10" placeholder="Write Review...." style="font-family:Comic Sans MS, Comic Sans, cursive;"></textarea>
					</div>
					<div class="col-sm-2"></div>
				</div>
				<br><br>
				<div class="row">
					<div class="col-sm-5"></div>
					<div class="col-sm-3">
						<input type="submit" id="submit_btn"/><br>
					</div>
					<div class="col-sm-4"></div>
				</div>
			</div>
		</body>
		<script type="text/javascript" src="/js/write_review.js"></script>
	</html>`

return htmlTemplate;
}

function createEditTemplate(data){
	var bookname = data.book_name;
	var author = data.book_author;
	var genre = data.genre_name;
	var pic = data.book_pic;
	var review = data.review_content;
	var htmlTemplate = `
	<!doctype HTML>
	<html>
		<head>
			<meta charset="utf-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>Write Review</title>
			<link rel="stylesheet" type="text/css" href="/css/write_review_style.css"/>
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		</head>
		<body>
			<div class = "container-fluid">
				<div class="row">
					<div class="col-sm-1"></div>
					<div class="col-sm-7">
						<h1 align="center">Write/Edit Review</h1>
					</div>
					<div class="col-sm-4">
						<a href = "/welcome"><img id="booki" src="http://images.clipartpanda.com/book-worm-clip-art-RTdRnoXxc.png"/></a>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-3">
						<img id="book_pic" src="https://filestore.dejected61.hasura-app.io/v1/file/${bookpic}" / >
					</div>
					<div class="col-sm-6">
						<h2 value="${bookname}" id="bname">Title : <div class="green">${bookname}</div></h2>
						<h2>Author : <div class="green">${author}</div></h2>
						<h2>Genre : <div class="green">${genre}</div></h2>
						<h2>Rating : (out of 5 stars)</h2>
						<div class="stars">
							<fieldset class="rating">
								<input type="radio" id="star5" name="rating"/><label for="star5" title="Rocks!">5 stars</label>
								<input type="radio" id="star4" name="rating"/><label for="star4" title="Pretty good">4 stars</label>
								<input type="radio" id="star3" name="rating"/><label for="star3" title="Meh">3 stars</label>
								<input type="radio" id="star2" name="rating"/><label for="star2" title="Kinda bad">2 stars</label>
								<input type="radio" id="star1" name="rating"/><label for="star1" title="Sucks big time">1 star</label>
							</fieldset>
						</div>
					</div>
					<div class="col-sm-3"></div>
				</div><br>
				<div class="row">
					<div class="col-sm-2"></div>
					<div class="col-sm-8">
						<textarea id="rev" cols="100" rows="10" placeholder="Write Review...." style="font-family:Comic Sans MS, Comic Sans, cursive;"></textarea>
					</div>
					<div class="col-sm-2"></div>
				</div>
				<br><br>
				<div class="row">
					<div class="col-sm-5"></div>
					<div class="col-sm-3">
						<input type="submit" id="submit_btn"/><br>
					</div>
					<div class="col-sm-4"></div>
				</div>
			</div>
		</body>
		<script type="text/javascript" src="/js/write_review.js"></script>
		<script>document.getElementById('rev').innerHTML = "${review}";</script>
	</html>`

return htmlTemplate;
}


function createViewTemplate(data)
{
	var title = data[0].book_name;
	var author = data[0].book_author;
	var genre = data[0].genre_name;
	var revcount = data[0].no_of_reviews;
	var pic = data[0].book_pic;
	var length = data.length;
	var flag = 0;
	var text = '';
	var buttontext = '';
	if(revcount == null){
		revcount = 0;
	}
	else { 
		for (i = 0; i<length; i++) {
			var image = '<img src="/images/' + data[i].rating + '.png" class="stars">';
			if(data[i].user_id==id){
				text += '<h3>Review by ' + data[i].user_name + '  <button id = "edit">Edit</button>   <button id = "delete" data-revvalue = "' + data[i].review_id + '">Delete</button></h3>';
				flag = 1;
			}
			else
				text += '<h3>Review by ' + data[i].user_name + '</h3>';
			text += '<p>' + data[i].review_content + '</p><h3>Rating : ' + image + '</h3><h3>Comments : </h3><div id="comment' + i + '" class = "comment" data-revvalue = "' + data[i].review_id + '"></div><br><div name="comment_form" data-revvalue = "' + data[i].review_id + '"><textarea name = "comment_text" rows="3" cols="100" placeholder="Enter your comment here..."></textarea><br/><input type="submit" name="submit" value="Submit" onclick = "entercomment(' + i + ')" /><br><br><hr>';
		}
	}
	if(flag==0)
		buttontext = '<button id = "writereview">Write Review</button>';
	
	
	var htmlTemplate = `
		<!doctype HTML>
		<html>
			<head>
				<meta charset="utf-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<title>Reviews</title>
				<link rel="stylesheet" type="text/css" href="/css/view_review_style.css"/>
			</head>
			<body>
			<a href = "/welcome"><img id="booki" src="http://images.clipartpanda.com/book-worm-clip-art-RTdRnoXxc.png"/></a>
			<img id="book_pic" src="https://filestore.dejected61.hasura-app.io/v1/file/${pic}" / >
			<div id="info">
			<h1>${title}</h1>
			<h2>Author : <div class="green">${author}</div></h2>
			<h2>Genre : <div class="green">${genre}</div></h2>
			<h2>Reviews : <div class="green">${revcount}</div></h2>
			${buttontext}
			</div>
			<div id = "reviews">
			</div>
			</body>
			<script>
				document.getElementById("reviews").innerHTML = '${text}';
			</script>
			<script type="text/javascript" src="/js/view_review.js"></script>
		</html>`
		
		return htmlTemplate;
}

app.get('/welcome', function(req, res){
	console.log("In server");
	if(admin.getToken()) {
		var query = {
			"type": "select",
			"args": {
				"table": "view_genre",
				"columns": ["user_name","genre_name","book_name","book_pic"],
				"where": {"user_id": id}
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
					console.log(body);
					res.send(createWelcomeTemplate(body));
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.get('/writereview/:bookname', function(req, res){
	if(admin.getToken()) {
		var query = {
			"type": "select",
			"args": {
				"table": "book1",
				"columns": ["book_id","book_pic","book_name","book_author","genre_name"],
				"where": {"book_name" : req.params.bookname}
			}
		}
		
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
					book = body[0].book_id;
					res.send(createWriteTemplate(body[0]));
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.get('/editreview/:bookname/:rid', function(req, res){
	if(admin.getToken()) {
		var query = {
			"type": "select",
			"args": {
				"table": "book1",
				"columns": ["book_id","book_pic","book_name","book_author","genre_name","review_content"],
				"where": {"book_name" : req.params.bookname,"user_id": id}
			}
		}
		
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
					book = body[0].book_id;
					res.send(createEditTemplate(body[0]));
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.get('/review/:bookname', function(req,res){
	if(admin.getToken()) { 		
		var query = {
			"type": "select",
			"args": {
				"table": "rev_details",
				"columns": ["*"],
				"where": {"book_name": req.params.bookname}
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else if(body.length == 0){
				res.send('Requested book is currently unavailable');
			 }
			 else{
					res.send(createViewTemplate(body));
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.get('/getcomments/:rid', function(req,res){
	if(admin.getToken()) { 		
		var query = {
			"type": "select",
			"args": {
				"table": "comment_details",
				"columns": ["*"],
				"where": {"review_id": req.params.rid}
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
					;
					res.send(body);
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.get('/getlength/:bookname', function(req,res){
	if(admin.getToken()) { 		
		var query = {
			"type": "select",
			"args": {
				"table": "book_details",
				"columns": ["no_of_reviews"],
				"where": {"book_name": req.params.bookname}
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
					res.send(body);
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.get('/getreplies/:cid', function(req,res){
	if(admin.getToken()) { 		
		var query = {
			"type": "select",
			"args": {
				"table": "reply_details",
				"columns": ["*"],
				"where": {"comment_id": req.params.cid}
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		}
		request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
					res.send(body);
			 }
		});
	}
	else{
		res.status(403).send("Not logged in");
	}
});


app.post('/insertreview',function(req,res) { 
	if(admin.getToken()) {
		 var query = { 
			"type": "insert",
			"args": {
				"table": "review",
				"objects": [{
					"review_content":req.body.review,
					"rating": req.body.rating,
					"user_id" : id,
					"book_id": book
				}]
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		 }
		 request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
			   res.status(200).send("Successful");
			 }
		 });
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.post('/updatereview',function(req,res) { 
	if(admin.getToken()) {
		 var query = { 
			"type": "update",
			"args": {
				"table": "review",
				"$set": {
					"review_content":req.body.review,
					"rating": req.body.rating
				},
				"where": {"review_id" : req.body.review_id}
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		 }
		 request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
			   res.status(200).send("Successful");
			 }
		 });
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.post('/deletereview',function(req,res) { 
	if(admin.getToken()) {
		 var query = { 
			"type": "delete",
			"args": {
				"table": "review",
				"where": {"review_id": req.body.review_id} 
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		 }
		 request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
			   res.status(200).send("Successful");
			 }
		 });
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.post('/submit-comment/:rid',function(req,res) { 
	if(admin.getToken()) {
		 var query = { 
			"type": "insert",
			"args": {
				"table": "comment",
				"objects": [{
					"comment_content":req.body.comment,
					"user_id" : id,
					"review_id": req.params.rid
				}]
			}
		}
		var options = {
			 method: 'POST',
			 url: 'http://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		 }
		 request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
			   res.status(200).send("Successful");
			 }
		 });
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.post('/submit-reply/:cid',function(req,res) { 
	if(admin.getToken()) {
		 var query = { 
			"type": "insert",
			"args": {
				"table": "reply",
				"objects": [{
					"reply_content":req.body.reply,
					"user_id" : id,
					"comment_id": req.params.cid
				}]
			}
		}
		var options = {
			 method: 'POST',
			 url: 'https://data.' + config.DOMAIN + '/v1/query',
			 json: true,
			 headers : {
				 'Authorization': 'Bearer ' + admin.getToken()
				},
			 body: query
		 }
		 request(options, function(error, response, body){
			 if(error){
			   console.log(error);
			   res.status(500).send("Error");
			 }
			 else {
			   res.status(response.STATUS).send("Successful");
			 }
		 });
	}
	else{
		res.status(403).send("Not logged in");
	}
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

