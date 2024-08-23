document.querySelector("#signUp").addEventListener("click", () => {
  clearAllValues();
  document.querySelector(".signupForm").style.display = "flex";
  document.querySelector("#message1").style.display = "none";
  document.querySelector("#message2").style.display = "inline";
  document.querySelector("#message3").style.display = "inline";
});

document.querySelector("#guest").addEventListener("click", () => {
  clearAllValues();
  document.querySelector(".guestForm").style.display = "flex";
  document.querySelector("#message3").style.display = "none";
});

document.querySelector("#signIn").addEventListener("click", () => {
  clearAllValues();  
  document.querySelector(".logInForm").style.display = "flex";
  document.querySelector("#message1").style.display = "inline";
  document.querySelector("#message2").style.display = "none";
  document.querySelector("#message3").style.display = "inline";
});

document.querySelector(".logInForm").addEventListener("submit",login);
document.querySelector(".signupForm").addEventListener("submit",register);
document.querySelector(".guestForm").addEventListener("submit",guestLogin);


function login(event){
  event.preventDefault();
  console.log (document.querySelector("#username").value);
  console.log (document.querySelector("#password").value);
}

function register(event){
  event.preventDefault();
  console.log (document.querySelector("#signupUsername").value);
  console.log (document.querySelector("#signupPassword").value);
  console.log (document.querySelector("#signupEmail").value);
}

function guestLogin(event){
  event.preventDefault();
  console.log (document.querySelector("#guestUsername").value);
}

function clearAllValues(){
  document.querySelector(".logInForm").style.display = "none";
  document.querySelector(".guestForm").style.display = "none";
  document.querySelector(".signupForm").style.display = "none";
  document.querySelector("#username").value = '';
  document.querySelector("#password").value = '';
  document.querySelector("#signupUsername").value = '';
  document.querySelector("#signupPassword").value = '';
  document.querySelector("#signupEmail").value = '';
  document.querySelector("#guestUsername").value = '';
}
