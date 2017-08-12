var logout = document.getElementById("logout");
logout.onclick = function() {
	var request = new XMLHttpRequest(); 
	 request.onreadystatechange = function(){ 
		if(request.readyState = XMLHttpRequest.DONE){ 
			if(request.status === 200){
				location.href='/';
			}
			else if(request.status === 403) {
				alert("Unsuccessful. Try logging in again");
				location.href='/login';
			}
			else if(request.status === 500)
				alert("Server Error");
		}
	 }
	 request.open('GET', '/logout', true);
	 request.send(null);
}

var search = document.getElementById("search_button");

search.onclick = function() {
	var searchvalue = document.getElementById("search").value;
	console.log(searchvalue);
	location.href='/review/' + searchvalue;
}
	