let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let msgs = JSON.parse(localStorage.getItem("msgs")) || [];
let resets = JSON.parse(localStorage.getItem("resets")) || [];
let arquivos = JSON.parse(localStorage.getItem("arquivos")) || [];

let logado = null;

// 👑 MASTER FIXO
if(!usuarios.find(u=>u.user==="master")){
 usuarios.push({user:"master",pass:"123",tipo:"master"});
 salvar();
}

function salvar(){
 localStorage.setItem("usuarios",JSON.stringify(usuarios));
 localStorage.setItem("msgs",JSON.stringify(msgs));
 localStorage.setItem("resets",JSON.stringify(resets));
 localStorage.setItem("arquivos",JSON.stringify(arquivos));
}

// LOGIN
function login(){
 let u=user.value;
 let p=pass.value;

 let ok = usuarios.find(x=>x.user===u && x.pass===p);

 if(ok){
  logado=ok;
  loginBox.style.display="none";
  app.style.display="block";
  info.innerText="👤 "+ok.user;

  carregar();

  if(ok.tipo==="master"){
   adminArea.style.display="block";
   painelAdmin();
  }

 }else alert("Login errado");
}

// REGISTER
function register(){
 let u=user.value;
 let p=pass.value;

 usuarios.push({user:u,pass:p,tipo:"cliente"});
 salvar();

 alert("Conta criada!");
}

// RESET
function reset(){
 alert("Offline: fale com o admin");
}

// LOGOUT
function logout(){
 location.reload();
}

// DRIVE
function upload(){
 let nome=fileName.value;

 arquivos.push({user:logado.user,nome});
 salvar();

 carregar();
}

function carregar(){
 arquivosList = arquivos.filter(a=>a.user===logado.user);

 arquivos.innerHTML="";
 arquivosList.forEach(a=>{
  let li=document.createElement("li");
  li.innerText=a.nome;
  arquivos.appendChild(li);
 });

 // mensagens user
 msgsUser.innerHTML="";
 msgs.filter(m=>m.user===logado.user).forEach(m=>{
  let li=document.createElement("li");
  li.innerText=m.msg+" | resp: "+(m.resp||"aguardando");
  msgsUser.appendChild(li);
 });
}

// SUPORTE LOGIN
function suporteLogin(){
 let m=prompt("Mensagem");
 msgs.push({user:"login",msg:m});
 salvar();
}

// PEDIR RESET
function pedirReset(){
 let u=prompt("Usuário");
 resets.push({user:u,status:"pendente"});
 salvar();
}

// USER MSG
function enviarMsg(){
 let m=prompt("Mensagem");
 msgs.push({user:logado.user,msg:m});
 salvar();
 carregar();
}

// ADMIN
function painelAdmin(){
 lista.innerHTML="";
 usuarios.forEach(u=>{
  let li=document.createElement("li");
  li.innerText=u.user+" ("+u.tipo+")";
  lista.appendChild(li);
 });

 // msgs
 msgsAdmin.innerHTML="";
 msgs.forEach((m,i)=>{
  let li=document.createElement("li");
  li.innerHTML=`
  ${m.user}: ${m.msg}
  <button onclick="resp(${i})">Responder</button>
  `;
  msgsAdmin.appendChild(li);
 });

 // reset
 resetList.innerHTML="";
 resets.forEach((r,i)=>{
  let li=document.createElement("li");
  li.innerHTML=`
  ${r.user} [${r.status}]
  <button onclick="aprovar(${i})">OK</button>
  `;
  resetList.appendChild(li);
 });
}

function resp(i){
 let r=prompt("Resposta");
 msgs[i].resp=r;
 salvar();
 painelAdmin();
}

function aprovar(i){
 resets[i].status="aprovado";
 salvar();
 painelAdmin();
}