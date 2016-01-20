var gameOver = true;
var whoseTurn = "X";
var userRef;

var mainRef = new Firebase('https://gkjsdll-tic-tac-toe.firebaseio.com/');
var amOnline = new Firebase('https://gkjsdll-tic-tac-toe.firebaseio.com/.info/connected');

function checkOnline(username){
  userRef = new Firebase('https://gkjsdll-tic-tac-toe.firebaseio.com/presence/' + username);
  localStorage.username = username;
  amOnline.on('value', function(snapshot) {
    if (snapshot.val()) {
      userRef.onDisconnect().set(false);
      userRef.set(true);
    }
  });
}

function nameAvailable(name){
  //try usernamesRef.once in console
  mainRef.child("presence").once("value", function(usernames){
    console.log(usernames)
    debugger;
    var isAvailable = true;
    usernames.forEach(function(username){
      if(name === username.key()){
        isAvailable = false;
      }
    })
    console.log("Username available: ", isAvailable);
    if(isAvailable){
      checkOnline(name);
      gameOver = false;
      swal.close();
    }
    else{
      swal.showInputError("Username taken");
    }
  });
}

$(document).ready(function(){

  var $squares = $('.square');

  $squares.click(squareClickHandler);

  for(var i = 0; i < $squares.length; i++){
    $squares.eq(i).css('top', Math.floor(i/3)*128+'px');
    $squares.eq(i).css('left', (i%3)*128+'px');
  }


  if(!localStorage.username){
    swal({
      title: "Enter a Username",
      text: "This cannot be changed later.",
      type: "input",
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "Username"
    },
    nameAvailable);
  }
  else {
    checkOnline(localStorage.username);
    gameOver = false;
  }
})

function squareClickHandler(){ //must be adapted for firebase
  if(!gameOver){
    var $this = $(this);
    if($this.text() === ""){
      $this.text(whoseTurn);
      $this.css("cursor","default");
      switch(whoseTurn){
        case "X":
          whoseTurn = "O";
          break;
        case "O":
          whoseTurn = "X";
          break;
      }
      // checkWin($this);
    }
  }
};
