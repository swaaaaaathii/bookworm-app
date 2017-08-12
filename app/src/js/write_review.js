var submit = document.getElementById("submit_btn");

var currentbookname = window.location.pathname.split('/')[2];

submit.onclick = function() { 
	var request = new XMLHttpRequest(); 
	 request.onreadystatechange = function(){ 
		if(request.readyState = XMLHttpRequest.DONE){ 
			if(request.status === 200){
				location.href = '/review/'+currentbookname;
			}
			else if(request.status === 403) {
				alert("Unsuccessful. Try logging in again.");
				location.href='/login';
			}
			else if(request.status === 500)
				alert("Server Error");
		}
	 }
	 
	 var revcon = document.getElementById("rev").value;
	 if(document.getElementById("star5").checked == true)
		var rating = 5;
	 else 
	 if(document.getElementById("star4").checked == true)
		var rating = 4;
	 else
	 if(document.getElementById("star3").checked == true)
		var rating = 3;
	 else
	 if(document.getElementById("star2").checked == true)
		var rating = 2;
	 else
	 if(document.getElementById("star1").checked == true)
		var rating = 1;
	
	 request.open('POST', '/insertreview', true);
	 request.setRequestHeader('Content-Type', 'application/json');
	 request.send(JSON.stringify({review: revcon, rating: rating}));
}