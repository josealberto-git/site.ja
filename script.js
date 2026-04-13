import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
 getAuth,
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 signOut,
 sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
 getFirestore,
 doc,
 setDoc,
 getDoc,
 collection,
 getDocs,
 addDoc,
 onSnapshot,
 updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
 getStorage,
 ref,
 uploadBytes,
 listAll,
 getDownloadURL,
 deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// CONFIG FIREBASE
const firebaseConfig = {
 apiKey:"SUA_KEY",
 authDomain:"SEU_DOMINIO",
 projectId:"SEU_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 👑 CRIAR MASTER
async function criarMaster(){
 try{
  let cred = await createUserWithEmailAndPassword(auth,"master@admin.com","123456");

  await setDoc(doc(db,"users",cred.user.uid),{
   email:"master@admin.com",
   tipo:"master"
  });
 }catch(e){}
}
criarMaster();

// MATRIX
const c=document.getElementById("matrix");
const ctx=c.getContext("2d");
c.height=innerHeight;c.width=innerWidth;
let letters="01";let drops=[];
for(let i=0;i<c.width/10;i++)drops[i]=1;
setInterval(()=>{
 ctx.fillStyle="rgba(0,0,0,0.05)";
 ctx.fillRect(0,0,c.width,c.height);
 ctx.fillStyle="#0f0";
 for(let i=0;i<drops.length;i++){
  let t=letters[Math.floor(Math.random()*2)];
  ctx.fillText(t,i*10,drops[i]*10);
  if(drops[i]*10>c.height) drops[i]=0;
  drops[i]++;
 }
},33);

// LOGIN
window.login = async ()=>{
 try{
  let cred = await signInWithEmailAndPassword(auth,email.value,senha.value);

  loginBox.style.display="none";
  app.style.display="block";

  info.innerText = cred.user.email;

  // IP
  fetch("https://api.ipify.org?format=json")
  .then(r=>r.json())
  .then(d=>ip.innerText=d.ip);

  listarArquivos();
  ouvirMinhasMsgs();

  let snap = await getDoc(doc(db,"users",cred.user.uid));
  let data = snap.data();

  if(data?.tipo==="admin"||data?.tipo==="master"){
   adminArea.style.display="block";
   listarUsuarios();
   ouvirAdmin();
   ouvirReset();
  }

 }catch(e){
  alert("Erro: "+e.message);
 }
};

// REGISTER
window.register = async ()=>{
 let cred = await createUserWithEmailAndPassword(auth,email.value,senha.value);

 await setDoc(doc(db,"users",cred.user.uid),{
  email:email.value,
  tipo:"cliente"
 });

 alert("Conta criada!");
};

// RESET FIREBASE
window.reset = ()=> sendPasswordResetEmail(auth,email.value);

// LOGOUT
window.logout = ()=>{ signOut(auth); location.reload(); }

// DRIVE
window.upload = async ()=>{
 let file = fileInput.files[0];
 let user = auth.currentUser;

 let path = ref(storage,"arquivos/"+user.uid+"/"+file.name);
 await uploadBytes(path,file);

 listarArquivos();
};

async function listarArquivos(){
 let user = auth.currentUser;
 let pasta = ref(storage,"arquivos/"+user.uid);

 let listaFiles = await listAll(pasta);

 arquivos.innerHTML="";

 listaFiles.items.forEach(async file=>{
  let url = await getDownloadURL(file);

  let li=document.createElement("li");
  li.innerHTML = `${file.name}
  <a href="${url}" target="_blank">📥</a>
  <button onclick="del('${file.fullPath}')">🗑️</button>`;

  arquivos.appendChild(li);
 });
}

window.del = async (path)=>{
 await deleteObject(ref(storage,path));
 listarArquivos();
};

// SUPORTE LOGIN
window.abrirSuporte = async ()=>{
 let e = prompt("Email:");
 let m = prompt("Mensagem:");

 if(!m) return;

 await addDoc(collection(db,"suporte"),{
  email:e,
  mensagem:m,
  resposta:"",
  status:"pendente"
 });
};

// PEDIDO RESET
window.pedirReset = async ()=>{
 let e = prompt("Email");

 await addDoc(collection(db,"reset"),{
  email:e,
  status:"pendente"
 });
};

// SUPORTE USER
window.enviarSuporte = async ()=>{
 let msg = prompt("Mensagem:");
 let user = auth.currentUser;

 await addDoc(collection(db,"suporte"),{
  uid:user.uid,
  email:user.email,
  mensagem:msg,
  resposta:"",
  status:"pendente"
 });
};

// VER RESPOSTA
function ouvirMinhasMsgs(){
 onSnapshot(collection(db,"suporte"), snap=>{
  minhasMsgs.innerHTML="";
  snap.forEach(doc=>{
   let m=doc.data();
   if(m.email===auth.currentUser.email){
    let li=document.createElement("li");
    li.innerHTML=m.mensagem+"<br>👑 "+(m.resposta||"aguardando");
    minhasMsgs.appendChild(li);
   }
  });
 });
}

// ADMIN USERS
async function listarUsuarios(){
 let snap = await getDocs(collection(db,"users"));
 lista.innerHTML="";

 snap.forEach(doc=>{
  let u = doc.data();
  let li=document.createElement("li");
  li.innerText = u.email+" ("+u.tipo+")";
  lista.appendChild(li);
 });
}

// ADMIN SUPORTE
function ouvirAdmin(){
 onSnapshot(collection(db,"suporte"), snap=>{
  msgs.innerHTML="";
  snap.forEach(doc=>{
   let m=doc.data();

   let li=document.createElement("li");
   li.innerHTML = `
   ${m.email}: ${m.mensagem}
   <button onclick="resp('${doc.id}')">Responder</button>
   `;

   msgs.appendChild(li);
  });
 });
}

window.resp = async (id)=>{
 let r = prompt("Resposta:");
 await updateDoc(doc(db,"suporte",id),{
  resposta:r,
  status:"respondido"
 });
};

// ADMIN RESET
function ouvirReset(){
 onSnapshot(collection(db,"reset"), snap=>{
  resetList.innerHTML="";
  snap.forEach(doc=>{
   let r=doc.data();

   let li=document.createElement("li");
   li.innerHTML = `
   ${r.email} [${r.status}]
   <button onclick="aprovar('${doc.id}')">Aprovar</button>
   `;

   resetList.appendChild(li);
  });
 });
}

window.aprovar = async (id)=>{
 await updateDoc(doc(db,"reset",id),{
  status:"aprovado"
 });
};