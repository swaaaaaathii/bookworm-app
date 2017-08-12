var submit = document.getElementById('submit_btn');

submit.onclick = function () {
	var request = new XMLHttpRequest(); 
	 request.onload = function(){ 
		if(request.readyState = XMLHttpRequest.DONE){ 
			if(request.status === 200||request.status === 304){
				location.href='html/select_genre.html';
			}
			else if(request.status === 403){
				alert("Unsuccessful. Try logging in again");
				location.href='/login';
			}
			else if(request.status === 500)
				alert("Server Error");
		}
	 }
	var username = document.getElementById('user').value;
	var password = document.getElementById('pass').value;
	var email = document.getElementById('email').value;
	var ulength = document.getElementById('user').length;
	var plength = document.getElementById('pass').length;
	var usercheck = false;
	var passcheck = false;
	var emailcheck = false;
	
	function password_check(pass) { 
		var re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&<>^()])[A-Za-z\d$@$!%*#?&<>^()]{8,}$/;
        return re.test(pass); 
	}
	
	function email_check(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}	
	if(username=="")
		alert("Username cannot be empty !");
	 else if(ulength > 0 && ulength < 3)
		alert("Username must have atleast 3 characters.");
	else
		usercheck = true;
	
	if(password=="")
		alert("Password cannot be empty");
	else if(plength > 0 && plength < 8)
		alert("Password must have atleast 8 characters.");
	else if(password_check(password)==false)
		alert("Password must have atleast one character, one number and one special character.");
	else
		passcheck = true;
	
	if(email=="")
		alert("Email cannot be empty");
	else if(email_check(email)==false)
		alert("Invalid email ID");
	else
		emailcheck = true; 
	
	if(usercheck==true && emailcheck==true && passcheck==true)
	{ 
		request.open('POST', '/register', true);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify({username:username ,email:email, password: password}));
	}
};
		