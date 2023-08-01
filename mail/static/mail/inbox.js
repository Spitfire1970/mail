document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener('submit', submit_email);


  // By default, load the inbox
  load_mailbox('inbox');
});


function show_email(id){
  const curr = document.getElementById("user_email").innerHTML
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#a_email').style.display = 'block';
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        var body = email.body.replaceAll("\n", "<br />\n")
        if (email.sender===curr) {
        document.querySelector('#a_email').innerHTML=`<strong>From: </strong>${email.sender}<br><strong>To: </strong>${email.recipients}<br><strong>Subject: </strong>${email.subject}<br>
        <strong>Timestamp: </strong>${email.timestamp}<br><br><button onclick = "reply(${id})" class="btn btn-sm btn-outline-primary" id="inbox">Reply</button><hr>${body}`
        }
        else if (email.archived === false){
        document.querySelector('#a_email').innerHTML=`<strong>From: </strong>${email.sender}<br><strong>To: </strong>${email.recipients}<br><strong>Subject: </strong>${email.subject}<br>
        <strong>Timestamp: </strong>${email.timestamp}<br><br><button onclick = "reply(${id})" class="btn btn-sm btn-outline-primary" id="inbox">Reply</button>&nbsp;&nbsp;&nbsp;
        <i title = "Archive mail" onclick = "archive_email(${id})" class="fa-solid fa-box-archive fa-xl" style="color:#919099;"></i><hr>${body}`
      }
        else {
          document.querySelector('#a_email').innerHTML=`<strong>From: </strong>${email.sender}<br><strong>To: </strong>${email.recipients}<br><strong>Subject: </strong>${email.subject}<br>
          <strong>Timestamp: </strong>${email.timestamp}<br><br><button onclick = "reply(${id})" class="btn btn-sm btn-outline-primary" id="inbox">Reply</button>&nbsp;&nbsp;&nbsp;
          <i title = "Archive mail" onclick = "unarchive_email(${id})" class="fa-solid fa-box-archive fa-xl" style="color:#2589e1;"></i><hr>${body}`
        }
        document.querySelector('.fa-box-archive').addEventListener('mouseenter', toggleArchive)
        document.querySelector('.fa-box-archive').addEventListener('mouseleave', toggleArchive)
    });
}    

function toggleArchive (event){
  var e = event.target
  if (e.style.color === 'rgb(145, 144, 153)'){
    e.style.color = 'rgb(37, 137, 225)';
  }
  else if (e.style.color === 'rgb(37, 137, 225)'){
    e.style.color =  'rgb(145, 144, 153)';
  }
}

function reply(id){
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
  const str = '^Re: ';
  const regexp = new RegExp(str);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#a_email').style.display = 'none';

  document.querySelector('#compose-recipients').value = `${email.sender}`;
  if (regexp.test(email.subject)){
    document.querySelector('#compose-subject').value = `${email.subject}`;
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;})
}

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  load_mailbox('inbox');
}

function unarchive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  load_mailbox('inbox');
}
      

function submit_email(event) {
  event.preventDefault();
    const q = document.getElementById("compose-recipients").value;
    const w = document.getElementById("compose-subject").value;
    const e = document.getElementById("compose-body").value;
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: q,
            subject: w,
            body: e
        })
    })
    console.log("email sent");
    load_mailbox('sent');
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#a_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#a_email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  if (mailbox === "inbox"){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
        emails.forEach(f);
    });

  }
  else if (mailbox === "sent"){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
        emails.forEach(f);
    });
  }
  else if (mailbox === "archive"){
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        emails.forEach(f);
    });
  }
  function f(i){
    const big = document.getElementById("emails-view");
    const element = document.createElement('div');
    element.className = "an_email";
    if (i.read === false){
      element.style="border:0.5px solid rgb(171, 169, 169);margin-right:1%;padding: 10px";
    }
    else{
      element.style="background-color:#e3e3e3;border:0.5px solid rgb(171, 169, 169);margin-right:1%;padding: 10px";
    }
    element.innerHTML = `<h3 style = "display:none" class = "email_id">${i.id}</h3><strong>${i.sender}
    </strong> &nbsp; ${i.subject} <div style = "color:grey;display: inline-block;float:right">${i.timestamp}</div>`;
    element.addEventListener('click', function() {show_email(i.id)});
    big.append(element)
  }

}