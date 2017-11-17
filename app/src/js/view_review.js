var currentbookname = window.location.pathname.split('/')[2];
var length;

function loadComments(iterator)
{
	var id = 'comment' + iterator;
	console.log(id);
	var rid = document.getElementById(id).getAttribute('data-revvalue');
	var comments = document.getElementById(id);
	comments.innerHTML = '<center>Loading comments...<center>';
	var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
			if (request.status === 200) {
				var content = '';
				var commentsData = JSON.parse(this.responseText);
				if(commentsData.length == 0)
					comments.innerHTML = '<center>No comments available</center>';
				else{
					for (var i=0; i< commentsData.length; i++) {
						var time = new Date(commentsData[i].comment_timestamp);
						content += `<p>${commentsData[i].comment_content}</p>
								  ${commentsData[i].user_name} - ${time.toLocaleTimeString()} on ${time.toLocaleDateString()}
								  <input type = "button" class = "viewbutton" value = "View Replies" onclick = "viewreplies(${commentsData[i].comment_id},${i})"></input>
								  <button class = "replybutton" onclick = "writereply(${commentsData[i].comment_id},${i})">Reply</button>
								  <div name="view"></div><br>
								  <div name="reply"></div>
								  <br>`
					}
					comments.innerHTML = content;
				}
			} else {
                comments.innerHTML('Oops! Could not load comments!');
            }
		}
	}
	request.open('GET', '/getcomments/'+rid ,true);
    request.send(null);
}

function countReviews()
{
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
			if (request.status === 200) {
				var data = JSON.parse(this.responseText);
				length = data[0].no_of_reviews;
				for(var i=0;i<length;i++)
					loadComments(i);
			}
		}
	}
	request.open('GET', '/getlength/' + currentbookname ,true);
    request.send(null);
}

function entercomment(iterator)
{
	var rid = document.getElementsByName("comment_form")[iterator].getAttribute('data-revvalue');
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
	  if (request.readyState === XMLHttpRequest.DONE) {
			if (request.status === 200) {
				document.getElementsByName('comment_text')[iterator].value = ' ';
				countReviews();    
			} else {
				alert('Error! Could not submit comment');
			}
	  }
	};
	
	var comment = document.getElementsByName('comment_text')[iterator].value;
	request.open('POST', '/submit-comment', true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({comment: comment,rid: rid}));  
}

function viewreplies(cid,iterator)
{
	var replies = document.getElementsByName('view')[iterator];
	var buttonval = document.getElementsByClassName('viewbutton')[iterator];
	var buttonvalue = buttonval.value;
	console.log(buttonvalue);
	var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
			if (request.status === 200) {
				if(buttonvalue == "View Replies") { 
					var content = '';
					var replyData = JSON.parse(this.responseText);
					if(replyData.length == 0)
						replies.innerHTML = '<center>No replies available</center>';
					else{
						for (var i=0; i < replyData.length; i++) {
							var time = new Date(replyData[i].reply_timestamp);
							content += `<p>${replyData[i].reply_content}</p>
									  ${replyData[i].user_name} - ${time.toLocaleTimeString()} on ${time.toLocaleDateString()}
									  <br>`
						}
						replies.innerHTML = '<div class = "reply">' + content + '</div>';
					}
					buttonval.value = "Hide Replies";
					console.log(buttonvalue);
				}
				else if(buttonvalue == "Hide Replies") { 
					replies.innerHTML = ' ';
					buttonval.value = "View Replies";
				}
			} else {
                replies.innerHTML('Oops! Could not load replies!');
            }
		}
	}
	request.open('GET', '/getreplies/' + cid ,true);
    request.send(null);
}

function writereply(cid,iterator){
	var replyfield = document.getElementsByName('reply')[iterator];
	replyfield.innerHTML = '<div class = "write"><textarea id = "reply_text" rows="1" cols="50" placeholder="Enter your reply here..."></textarea><br/><input type="submit" id="submitr" value="Submit"/></div>';
	var submit = document.getElementById('submitr');
	submit.onclick = function() { 
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
		  if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					replyfield.innerHTML = ' ';
					viewreplies(cid,iterator);
				} else if(request.status==500){
					alert('Server error');
				} else {
					alert('Error! Could not submit reply');
				}
		  }
		};
		
		var reply = document.getElementById('reply_text').value;
		request.open('POST', '/submit-reply', true);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify({reply: reply,cid: cid})); 
	};
}

if(document.getElementById('edit')){
var edit = document.getElementById('edit');
var deleterev = document.getElementById('delete');
var revid = document.getElementById('delete').getAttribute('data-revvalue');

edit.onclick = function(){
	location.href = '/editreview/' + currentbookname + '/' + revid;
};

deleterev.onclick = function(){
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
		  if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					location.reload();
				} else {
					alert('Error! Could not delete review');
				}
		  }
		};

		request.open('POST', '/deletereview' , true);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify({review_id: revid})); 
};
}

if(document.getElementById('writereview')){
var write = document.getElementById('writereview');

write.onclick = function() { 
	location.href = '/writereview/' + currentbookname;
};
}

countReviews();
