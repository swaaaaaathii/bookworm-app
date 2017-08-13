var submit1 = document.getElementById('submitbtn');
var submit2 = document.getElementById('submit_btn');
var flag=0;

alert("Select the box to the left of the picture");

submit1.onclick = function () {
	var request = new XMLHttpRequest(); 
	 request.onreadystatechange = function(){ 
		if(request.readyState = XMLHttpRequest.DONE){ 
			if(request.status === 200){
				flag = 1;
				document.getElementById("namediv").innerHTML="<h1>Select your favourite Genres : </h1>";
			}
			else if(request.status === 403) { 
				alert("Unsuccessful. Try logging in again");
				location.href='/login';
			}
			else if(request.status === 500)
				alert("Server Error");
		}
	 }
	 var name = document.getElementById('name').value;
	 var nlength = document.getElementById('name').length;
	 
	if(name=="")
		alert("Name cannot be empty");
	else if(nlength > 0 && nlength < 3)
		alert("Name must have atleast 3 characters.");
	else { 
		request.open('POST', '/entername', false);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify({name: name}));
	}
};

submit2.onclick = function () {
	var request = new XMLHttpRequest(); 
	 request.onreadystatechange = function(){ 
		if(request.readyState = XMLHttpRequest.DONE){ 
			if(request.status === 200){
				location.href = '/welcome';
			}
			else if(request.status === 403) {
				alert("Unsuccessful. Try logging in again");
				location.href='/login';
			}
			else if(request.status === 500)
				alert("Server Error");
		}
	 }
	 var sg,genre_id;
	 var i;
	 if(flag==0)
		 alert("Please enter a name and submit first");
	 
	 for(i=0;i<12;i++) { 
		genre_id = document.getElementsByName("c1")[i].value;
		sg = document.getElementsByName("c1")[i].checked;
		if(sg===true) { 
			request.open('POST','/entergenre', false);
			request.setRequestHeader('Content-Type', 'application/json');
			request.send(JSON.stringify({genre_id:genre_id}));
	    }
	 }
}


