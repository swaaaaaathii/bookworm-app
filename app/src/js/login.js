var submit = document.getElementById('submit_btn');

submit.onclick = function () {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
		  console.log(request.status);
          if (request.status === 200) {
			  alert('success');
			  location.href = '/welcome';
			}else if(request.status===403){
                alert('Invalid username or password');
            }else if(request.status===500){
                alert('Something wrong with the server');
            }else{
			}
          }
      }
    
    var username = document.getElementById('user').value;
    var password = document.getElementById('pass').value;
	console.log(username);
	console.log(password);
    request.open('POST', '/authenticate', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username: username, password: password}));
};

